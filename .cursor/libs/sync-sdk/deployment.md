# Agility CMS Sync SDK - Deployment

This document covers production deployment strategies, monitoring, and troubleshooting for the Agility Sync SDK.

---

## 🚀 **Production Deployment**

### **Environment Configuration**
```typescript
// config/sync.config.js
const configs = {
  production: {
    guid: process.env.AGILITY_PROD_GUID,
    apiKey: process.env.AGILITY_PROD_API_KEY,
    outputPath: './dist/agility-content',
    contentTypes: ['posts', 'pages', 'products'],
    caching: {
      enabled: true,
      ttl: 300000, // 5 minutes
      strategy: 'redis'
    },
    performance: {
      maxConcurrency: 3,
      batchSize: 100,
      rateLimitDelay: 200
    }
  },
  staging: {
    guid: process.env.AGILITY_STAGING_GUID,
    apiKey: process.env.AGILITY_STAGING_API_KEY,
    outputPath: './dist/agility-content',
    caching: {
      enabled: true,
      ttl: 60000,
      strategy: 'memory'
    }
  }
};

export const getSyncConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return configs[env];
};
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S agility -u 1001

COPY --from=builder --chown=agility:nodejs /app/dist ./dist
COPY --from=builder --chown=agility:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=agility:nodejs /app/package.json ./

RUN mkdir -p /app/agility-content/.cache && chown -R agility:nodejs /app/agility-content

USER agility
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  agility-sync:
    build: .
    environment:
      - NODE_ENV=production
      - AGILITY_GUID=${AGILITY_GUID}
      - AGILITY_API_KEY=${AGILITY_API_KEY}
      - REDIS_URL=redis://redis:6379
    volumes:
      - agility-content:/app/agility-content
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  agility-content:
  redis-data:
```

---

## 📊 **Monitoring & Health Checks**

### **Health Check Service**
```typescript
export class HealthChecker {
  constructor(private syncClient: SyncClient) {}

  async checkHealth(): Promise<HealthStatus> {
    const checks = {
      agility: await this.checkAgilityConnection(),
      cache: await this.checkCacheConnection(),
      disk: await this.checkDiskSpace(),
      memory: await this.checkMemoryUsage()
    };

    const isHealthy = Object.values(checks).every(check => check.healthy);

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime()
    };
  }

  private async checkAgilityConnection(): Promise<HealthCheck> {
    try {
      await this.syncClient.testConnection();
      return { healthy: true, message: 'Agility CMS connection OK' };
    } catch (error) {
      return { healthy: false, message: `Connection failed: ${error.message}` };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    const maxMemoryMB = 512;

    if (memUsageMB > maxMemoryMB) {
      return { healthy: false, message: `High memory: ${memUsageMB.toFixed(2)}MB` };
    }

    return { healthy: true, message: 'Memory usage OK' };
  }
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: Record<string, HealthCheck>;
  uptime: number;
}

interface HealthCheck {
  healthy: boolean;
  message: string;
}
```

### **Metrics Collection**
```typescript
export class MetricsCollector {
  private metrics = new Map();

  recordSyncOperation(contentType: string, duration: number, itemCount: number): void {
    const key = `sync_${contentType}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        totalOperations: 0,
        totalDuration: 0,
        totalItems: 0
      });
    }

    const metric = this.metrics.get(key);
    metric.totalOperations++;
    metric.totalDuration += duration;
    metric.totalItems += itemCount;
  }

  recordError(operation: string, error: Error): void {
    const key = `error_${operation}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, { count: 0, lastError: null });
    }

    const metric = this.metrics.get(key);
    metric.count++;
    metric.lastError = {
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }

  getPrometheusMetrics(): string {
    let output = '';
    
    for (const [key, metric] of this.metrics.entries()) {
      if (key.startsWith('sync_')) {
        const contentType = key.replace('sync_', '');
        output += `agility_sync_operations_total{content_type="${contentType}"} ${metric.totalOperations}\n`;
        output += `agility_sync_items_total{content_type="${contentType}"} ${metric.totalItems}\n`;
      }
    }
    
    return output;
  }
}
```

---

## 🔧 **Error Handling & Recovery**

### **Retry Logic**
```typescript
export class SyncRetryHandler {
  constructor(
    private maxRetries: number = 3,
    private baseDelay: number = 1000
  ) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        console.warn(`${operationName} failed (attempt ${attempt}/${this.maxRetries})`);
        
        // Don't retry on client errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }
}
```

### **Graceful Shutdown**
```typescript
export class GracefulShutdown {
  private isShuttingDown = false;
  private activeOperations = new Set<Promise<any>>();
  
  constructor(private syncClient: SyncClient) {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  async trackOperation<T>(operation: Promise<T>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }
    
    this.activeOperations.add(operation);
    
    try {
      return await operation;
    } finally {
      this.activeOperations.delete(operation);
    }
  }

  private async shutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, starting graceful shutdown...`);
    this.isShuttingDown = true;
    
    if (this.activeOperations.size > 0) {
      console.log(`Waiting for ${this.activeOperations.size} operations...`);
      
      try {
        await Promise.race([
          Promise.all(this.activeOperations),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 30000)
          )
        ]);
      } catch (error) {
        console.warn('Some operations did not complete');
      }
    }
    
    await this.syncClient.disconnect();
    console.log('Graceful shutdown completed');
    process.exit(0);
  }
}
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Memory Leaks**
```typescript
export class MemoryLeakDetector {
  private baselineMemory: number;
  
  constructor() {
    this.baselineMemory = process.memoryUsage().heapUsed;
    setInterval(() => this.checkMemory(), 60000);
  }

  private checkMemory(): void {
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = currentMemory - this.baselineMemory;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    
    if (memoryGrowthMB > 100) {
      console.warn(`Memory leak detected: ${memoryGrowthMB.toFixed(2)}MB growth`);
      
      if (global.gc) {
        global.gc();
      }
    }
  }
}
```

#### **Rate Limiting**
```typescript
export class RateLimitHandler {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerSecond = 10;
  
  async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      await request();
      await new Promise(resolve => setTimeout(resolve, 1000 / this.requestsPerSecond));
    }
    
    this.processing = false;
  }
}
```

### **Diagnostic Tools**
```typescript
export class SyncDiagnostics {
  async runDiagnostics(syncClient: SyncClient): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    report.tests.connectivity = await this.testConnectivity(syncClient);
    report.tests.contentAccess = await this.testContentAccess(syncClient);
    report.tests.performance = await this.testPerformance(syncClient);
    
    return report;
  }

  private async testConnectivity(syncClient: SyncClient): Promise<TestResult> {
    try {
      await syncClient.testConnection();
      return { passed: true, message: 'API connectivity OK' };
    } catch (error) {
      return { passed: false, message: `Failed: ${error.message}` };
    }
  }

  private async testContentAccess(syncClient: SyncClient): Promise<TestResult> {
    try {
      const content = await syncClient.getContentList({
        referenceName: 'posts',
        take: 1
      });
      return { passed: true, message: `Content access OK (${content.length} items)` };
    } catch (error) {
      return { passed: false, message: `Failed: ${error.message}` };
    }
  }

  private async testPerformance(syncClient: SyncClient): Promise<TestResult> {
    const startTime = Date.now();
    try {
      await syncClient.getContentList({ referenceName: 'posts', take: 5 });
      const duration = Date.now() - startTime;
      
      return duration > 5000 
        ? { passed: false, message: `Slow: ${duration}ms` }
        : { passed: true, message: `Performance OK: ${duration}ms` };
    } catch (error) {
      return { passed: false, message: `Failed: ${error.message}` };
    }
  }
}

interface DiagnosticReport {
  timestamp: string;
  tests: Record<string, TestResult>;
}

interface TestResult {
  passed: boolean;
  message: string;
}
```

---

## 🔧 **Production Scripts**

### **Deployment Script**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build and sync content
npm run build:production

# Run health checks
npm run health-check

# Deploy to production
docker-compose up -d --build

# Verify deployment
sleep 10
curl -f http://localhost:3000/health || exit 1

echo "✅ Deployment completed successfully"
```

### **Monitoring Setup**
```bash
#!/bin/bash
# setup-monitoring.sh

# Install monitoring tools
docker run -d --name prometheus \
  -p 9090:9090 \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

docker run -d --name grafana \
  -p 3001:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana

echo "📊 Monitoring setup completed"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001"
```

---

## 🔗 **Related Documentation**

- **Sync Client Setup**: `sync-sdk/sync-client-setup.md`
- **Sync Operations**: `sync-sdk/sync-operations.md`
- **Build Integration**: `sync-sdk/build-integration.md`
- **Performance**: `sync-sdk/performance.md`

---

This deployment guide ensures reliable production deployment with monitoring, error handling, and troubleshooting capabilities. 
# Agility CMS Fetch SDK - Best Practices

This document outlines best practices for using the Agility Fetch SDK in production environments, covering performance optimization, security, error handling, and deployment strategies.

---

## 🚀 **Performance Best Practices**

### **Efficient Data Fetching**
```typescript
// ✅ Good: Fetch only needed data
const posts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  take: 10,
  skip: 0,
  fields: ['title', 'slug', 'excerpt', 'date'] // Only fetch required fields
});

// ❌ Bad: Fetching all data unnecessarily
const posts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us'
  // Fetches all fields and all items
});
```

### **Smart Caching Strategy**
```typescript
// Multi-layer caching approach
class AgilityDataLayer {
  private memoryCache = new Map();
  private redisCache: Redis;
  
  constructor() {
    this.redisCache = new Redis(process.env.REDIS_URL);
  }
  
  async getContent(key: string, fetcher: () => Promise<any>) {
    // 1. Check memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // 2. Check Redis cache (fast)
    const cached = await this.redisCache.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      this.memoryCache.set(key, data); // Populate memory cache
      return data;
    }
    
    // 3. Fetch from API (slowest)
    const data = await fetcher();
    
    // Cache at both levels
    this.memoryCache.set(key, data);
    await this.redisCache.setex(key, 300, JSON.stringify(data)); // 5 min TTL
    
    return data;
  }
  
  // Invalidate cache when content changes
  async invalidateContent(referenceName: string) {
    const pattern = `content:${referenceName}:*`;
    const keys = await this.redisCache.keys(pattern);
    
    if (keys.length > 0) {
      await this.redisCache.del(...keys);
    }
    
    // Clear memory cache
    for (const [key] of this.memoryCache.entries()) {
      if (key.startsWith(`content:${referenceName}:`)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
```

### **Request Optimization**
```typescript
// Batch related requests
async function getPageData(pageID: number) {
  // ✅ Good: Execute requests in parallel
  const [page, sitemap, navigation] = await Promise.all([
    api.getPage({ pageID, languageCode: 'en-us' }),
    api.getSitemapFlat({ channelName: 'website', languageCode: 'en-us' }),
    api.getContentList({ referenceName: 'navigation', languageCode: 'en-us' })
  ]);
  
  return { page, sitemap, navigation };
}

// ❌ Bad: Sequential requests
async function getPageDataSlow(pageID: number) {
  const page = await api.getPage({ pageID, languageCode: 'en-us' });
  const sitemap = await api.getSitemapFlat({ channelName: 'website', languageCode: 'en-us' });
  const navigation = await api.getContentList({ referenceName: 'navigation', languageCode: 'en-us' });
  
  return { page, sitemap, navigation };
}
```

### **Pagination Patterns**
```typescript
// Efficient pagination with cursor-based approach
class ContentPaginator {
  async getPage(referenceName: string, cursor?: string, pageSize: number = 20) {
    const result = await api.getContentList({
      referenceName,
      languageCode: 'en-us',
      take: pageSize + 1, // Fetch one extra to check if there's more
      skip: cursor ? this.decodeCursor(cursor) : 0
    });
    
    const hasMore = result.length > pageSize;
    const items = hasMore ? result.slice(0, -1) : result;
    const nextCursor = hasMore ? this.encodeCursor(items.length + (cursor ? this.decodeCursor(cursor) : 0)) : null;
    
    return {
      items,
      hasMore,
      nextCursor,
      totalCount: result.totalCount
    };
  }
  
  private encodeCursor(offset: number): string {
    return Buffer.from(offset.toString()).toString('base64');
  }
  
  private decodeCursor(cursor: string): number {
    return parseInt(Buffer.from(cursor, 'base64').toString());
  }
}
```

---

## 🔒 **Security Best Practices**

### **Environment Configuration**
```typescript
// ✅ Good: Secure environment setup
const config = {
  guid: process.env.AGILITY_GUID,
  apiKey: process.env.AGILITY_API_KEY,
  previewKey: process.env.AGILITY_PREVIEW_KEY,
  isPreview: process.env.NODE_ENV === 'development' || process.env.PREVIEW_MODE === 'true'
};

// Validate required environment variables
if (!config.guid || !config.apiKey) {
  throw new Error('Missing required Agility CMS credentials');
}

const api = agility.getApi(config);
```

### **API Key Management**
```typescript
// Use different keys for different environments
const getApiConfig = () => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        guid: process.env.AGILITY_PROD_GUID,
        apiKey: process.env.AGILITY_PROD_API_KEY,
        isPreview: false
      };
    case 'staging':
      return {
        guid: process.env.AGILITY_STAGING_GUID,
        apiKey: process.env.AGILITY_STAGING_API_KEY,
        isPreview: false
      };
    default:
      return {
        guid: process.env.AGILITY_DEV_GUID,
        apiKey: process.env.AGILITY_DEV_API_KEY,
        isPreview: true
      };
  }
};
```

### **Content Sanitization**
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content from CMS
function sanitizeContent(htmlContent: string): string {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false
  });
}

// Use with content fields
function renderContent(content: any) {
  return {
    ...content,
    fields: {
      ...content.fields,
      content: content.fields.content ? sanitizeContent(content.fields.content) : '',
      excerpt: content.fields.excerpt ? sanitizeContent(content.fields.excerpt) : ''
    }
  };
}
```

### **Rate Limiting**
```typescript
import { RateLimiter } from 'limiter';

class AgilityRateLimiter {
  private limiter = new RateLimiter({
    tokensPerInterval: 100, // 100 requests
    interval: 'minute' // per minute
  });
  
  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const remainingRequests = await this.limiter.removeTokens(1);
    
    if (remainingRequests < 0) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return requestFn();
  }
}

const rateLimiter = new AgilityRateLimiter();

// Use with API calls
const content = await rateLimiter.makeRequest(() =>
  api.getContentList({ referenceName: 'posts', languageCode: 'en-us' })
);
```

---

## 🛡️ **Error Handling Best Practices**

### **Comprehensive Error Handling**
```typescript
class AgilityError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public operation?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AgilityError';
  }
}

async function safeApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`Agility API Error [${operation}]:`, error);
    
    // Log to monitoring service
    logError(new AgilityError(
      `Failed to ${operation}`,
      error.response?.status,
      operation,
      error
    ));
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    throw new AgilityError(
      `Failed to ${operation}`,
      error.response?.status,
      operation,
      error
    );
  }
}

// Usage with fallbacks
const posts = await safeApiCall(
  'fetch blog posts',
  () => api.getContentList({ referenceName: 'posts', languageCode: 'en-us' }),
  [] // Empty array as fallback
);
```

### **Retry Logic**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError;
}

// Usage
const content = await withRetry(() =>
  api.getContentItem({ contentID: 123, languageCode: 'en-us' })
);
```

### **Circuit Breaker Pattern**
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

const circuitBreaker = new CircuitBreaker();

// Usage
const data = await circuitBreaker.execute(() =>
  api.getContentList({ referenceName: 'posts', languageCode: 'en-us' })
);
```

---

## 📊 **Monitoring and Logging**

### **Performance Monitoring**
```typescript
class AgilityPerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      this.recordMetric(operationName, Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordError(operationName, error);
      throw error;
    }
  }
  
  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const durations = this.metrics.get(operation)!;
    durations.push(duration);
    
    // Keep only last 100 measurements
    if (durations.length > 100) {
      durations.shift();
    }
    
    // Log slow operations
    if (duration > 5000) { // 5 seconds
      console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }
  }
  
  private recordError(operation: string, error: Error) {
    console.error(`Operation failed: ${operation}`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
  
  getMetrics() {
    const stats = new Map();
    
    for (const [operation, durations] of this.metrics.entries()) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      stats.set(operation, { avg, min, max, count: durations.length });
    }
    
    return stats;
  }
}

const monitor = new AgilityPerformanceMonitor();

// Usage
const posts = await monitor.measureOperation('fetch-posts', () =>
  api.getContentList({ referenceName: 'posts', languageCode: 'en-us' })
);
```

### **Structured Logging**
```typescript
interface LogContext {
  operation: string;
  contentType?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

class AgilityLogger {
  log(level: 'info' | 'warn' | 'error', message: string, context: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'agility-cms',
      ...context
    };
    
    // Send to logging service (e.g., Winston, Pino, etc.)
    console.log(JSON.stringify(logEntry));
    
    // Send to monitoring service (e.g., DataDog, New Relic)
    if (level === 'error' && context.error) {
      this.sendToMonitoring(logEntry);
    }
  }
  
  private sendToMonitoring(logEntry: any) {
    // Implementation depends on your monitoring service
    // Example: DataDog, New Relic, Sentry, etc.
  }
}

const logger = new AgilityLogger();

// Usage in API calls
try {
  const startTime = Date.now();
  const posts = await api.getContentList({ referenceName: 'posts', languageCode: 'en-us' });
  
  logger.log('info', 'Successfully fetched content', {
    operation: 'getContentList',
    contentType: 'posts',
    duration: Date.now() - startTime,
    metadata: { count: posts.length }
  });
  
  return posts;
} catch (error) {
  logger.log('error', 'Failed to fetch content', {
    operation: 'getContentList',
    contentType: 'posts',
    error
  });
  throw error;
}
```

---

## 🚢 **Production Deployment**

### **Environment-Specific Configuration**
```typescript
// config/agility.ts
interface AgilityConfig {
  guid: string;
  apiKey: string;
  previewKey?: string;
  isPreview: boolean;
  cacheConfig: {
    defaultTTL: number;
    maxMemoryItems: number;
    redisUrl?: string;
  };
  rateLimiting: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}

const configs: Record<string, AgilityConfig> = {
  production: {
    guid: process.env.AGILITY_PROD_GUID!,
    apiKey: process.env.AGILITY_PROD_API_KEY!,
    isPreview: false,
    cacheConfig: {
      defaultTTL: 300000, // 5 minutes
      maxMemoryItems: 1000,
      redisUrl: process.env.REDIS_URL
    },
    rateLimiting: {
      requestsPerMinute: 100,
      burstLimit: 20
    }
  },
  staging: {
    guid: process.env.AGILITY_STAGING_GUID!,
    apiKey: process.env.AGILITY_STAGING_API_KEY!,
    isPreview: false,
    cacheConfig: {
      defaultTTL: 60000, // 1 minute
      maxMemoryItems: 500,
      redisUrl: process.env.REDIS_URL
    },
    rateLimiting: {
      requestsPerMinute: 200,
      burstLimit: 50
    }
  },
  development: {
    guid: process.env.AGILITY_DEV_GUID!,
    apiKey: process.env.AGILITY_DEV_API_KEY!,
    previewKey: process.env.AGILITY_PREVIEW_KEY,
    isPreview: true,
    cacheConfig: {
      defaultTTL: 10000, // 10 seconds
      maxMemoryItems: 100
    },
    rateLimiting: {
      requestsPerMinute: 500,
      burstLimit: 100
    }
  }
};

export const getConfig = (): AgilityConfig => {
  const env = process.env.NODE_ENV || 'development';
  return configs[env];
};
```

### **Health Checks**
```typescript
// Health check endpoint for monitoring
export async function healthCheck() {
  const checks = {
    agility: false,
    cache: false,
    database: false
  };
  
  try {
    // Test Agility CMS connection
    await api.getContentList({
      referenceName: 'posts',
      languageCode: 'en-us',
      take: 1
    });
    checks.agility = true;
  } catch (error) {
    console.error('Agility health check failed:', error);
  }
  
  try {
    // Test cache connection
    if (redis) {
      await redis.ping();
      checks.cache = true;
    }
  } catch (error) {
    console.error('Cache health check failed:', error);
  }
  
  const isHealthy = Object.values(checks).every(check => check);
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

### **Graceful Shutdown**
```typescript
class AgilityService {
  private isShuttingDown = false;
  private activeRequests = new Set<Promise<any>>();
  
  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Service is shutting down');
    }
    
    const request = requestFn();
    this.activeRequests.add(request);
    
    try {
      return await request;
    } finally {
      this.activeRequests.delete(request);
    }
  }
  
  async shutdown(timeout: number = 30000): Promise<void> {
    this.isShuttingDown = true;
    
    console.log('Shutting down Agility service...');
    console.log(`Waiting for ${this.activeRequests.size} active requests to complete`);
    
    // Wait for active requests to complete or timeout
    const shutdownPromise = Promise.all(this.activeRequests);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
    );
    
    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      console.log('All requests completed successfully');
    } catch (error) {
      console.warn('Some requests did not complete before timeout');
    }
    
    console.log('Agility service shutdown complete');
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await agilityService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await agilityService.shutdown();
  process.exit(0);
});
```

---

## 🔗 **Related Documentation**

- **Core APIs**: `fetch-sdk/core-apis.md`
- **Content Operations**: `fetch-sdk/content-operations.md`
- **Page Operations**: `fetch-sdk/page-operations.md`
- **Sitemap Operations**: `fetch-sdk/sitemap-operations.md`
- **Advanced Features**: `fetch-sdk/advanced-features.md`

---

This comprehensive guide ensures your Agility CMS implementation follows production-ready best practices for performance, security, and reliability.
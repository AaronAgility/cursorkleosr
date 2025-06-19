# Agility CMS Sync SDK - Performance Optimization

This document covers performance optimization strategies for the Agility Sync SDK including caching, parallel processing, and memory management.

---

## ⚡ **Caching Strategies**

### **Multi-Layer Caching**
```typescript
export class SyncCache {
  private memoryCache = new Map();
  private diskCache: string;
  private contentHashes = new Map();

  constructor(outputPath: string) {
    this.diskCache = path.join(outputPath, '.cache');
    this.ensureCacheDir();
    this.loadContentHashes();
  }

  async getContent(key: string, fetcher: () => Promise<any>): Promise<any> {
    // 1. Check memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // 2. Check disk cache (fast)
    const diskPath = path.join(this.diskCache, `${key}.json`);
    if (fs.existsSync(diskPath)) {
      const content = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
      this.memoryCache.set(key, content); // Populate memory cache
      return content;
    }

    // 3. Fetch from API (slowest)
    const content = await fetcher();
    
    // Cache at both levels
    this.memoryCache.set(key, content);
    fs.writeFileSync(diskPath, JSON.stringify(content, null, 2));
    
    return content;
  }

  shouldSync(contentID: number, modified: string): boolean {
    const key = `content_${contentID}`;
    const cachedHash = this.contentHashes.get(key);
    const currentHash = this.generateHash(modified);
    
    return cachedHash !== currentHash;
  }

  updateHash(contentID: number, modified: string): void {
    const key = `content_${contentID}`;
    const hash = this.generateHash(modified);
    this.contentHashes.set(key, hash);
  }

  private generateHash(input: string): string {
    return require('crypto').createHash('md5').update(input).digest('hex');
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.diskCache)) {
      fs.mkdirSync(this.diskCache, { recursive: true });
    }
  }

  private loadContentHashes(): void {
    const hashFile = path.join(this.diskCache, 'hashes.json');
    if (fs.existsSync(hashFile)) {
      const hashes = JSON.parse(fs.readFileSync(hashFile, 'utf8'));
      this.contentHashes = new Map(hashes);
    }
  }

  async saveHashes(): Promise<void> {
    const hashFile = path.join(this.diskCache, 'hashes.json');
    const hashes = Array.from(this.contentHashes.entries());
    fs.writeFileSync(hashFile, JSON.stringify(hashes, null, 2));
  }

  clearCache(): void {
    this.memoryCache.clear();
    if (fs.existsSync(this.diskCache)) {
      fs.rmSync(this.diskCache, { recursive: true });
    }
  }
}
```

### **Smart Cache Invalidation**
```typescript
export class CacheInvalidator {
  constructor(private cache: SyncCache) {}

  async invalidateByContentType(contentType: string): Promise<void> {
    // Invalidate all content of a specific type
    const pattern = `${contentType}_*`;
    await this.cache.invalidatePattern(pattern);
    console.log(`Cache invalidated for content type: ${contentType}`);
  }

  async invalidateByDate(since: Date): Promise<void> {
    // Invalidate content modified since a specific date
    const timestamp = since.getTime();
    await this.cache.invalidateWhere((key, content) => {
      return new Date(content.properties.modified).getTime() > timestamp;
    });
    console.log(`Cache invalidated for content modified since ${since.toISOString()}`);
  }

  async invalidateLinkedContent(contentID: number): Promise<void> {
    // Invalidate content that links to the specified content
    await this.cache.invalidateWhere((key, content) => {
      return this.hasLinkedContent(content, contentID);
    });
  }

  private hasLinkedContent(content: any, targetID: number): boolean {
    const checkObject = (obj: any): boolean => {
      if (Array.isArray(obj)) {
        return obj.some(item => checkObject(item));
      }
      
      if (obj && typeof obj === 'object') {
        if (obj.contentID === targetID) return true;
        return Object.values(obj).some(value => checkObject(value));
      }
      
      return false;
    };

    return checkObject(content.fields);
  }
}
```

---

## 🚀 **Parallel Processing**

### **Concurrent Content Sync**
```typescript
export class ParallelSyncProcessor {
  constructor(
    private syncClient: SyncClient,
    private maxConcurrency: number = 5,
    private rateLimitDelay: number = 100
  ) {}

  async syncContentTypesParallel(
    contentTypes: string[],
    outputPath: string
  ): Promise<ParallelSyncResult> {
    const semaphore = new Semaphore(this.maxConcurrency);
    const results: ContentTypeSyncResult[] = [];
    
    const syncPromises = contentTypes.map(async (contentType) => {
      return semaphore.acquire(async () => {
        await this.rateLimitDelay && new Promise(r => setTimeout(r, this.rateLimitDelay));
        
        const startTime = Date.now();
        try {
          const result = await this.syncClient.syncContentType({
            referenceName: contentType,
            outputPath: path.join(outputPath, 'content', contentType)
          });
          
          return {
            contentType,
            itemCount: result.itemCount,
            duration: Date.now() - startTime,
            success: true
          };
        } catch (error) {
          return {
            contentType,
            itemCount: 0,
            duration: Date.now() - startTime,
            success: false,
            error: error.message
          };
        }
      });
    });
    
    const results = await Promise.all(syncPromises);
    
    return {
      results,
      totalItems: results.reduce((sum, r) => sum + r.itemCount, 0),
      totalDuration: Math.max(...results.map(r => r.duration)),
      successCount: results.filter(r => r.success).length
    };
  }
}

class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    await this.waitForPermit();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private async waitForPermit(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  private release(): void {
    const next = this.waitQueue.shift();
    if (next) {
      next();
    } else {
      this.permits++;
    }
  }
}
```

### **Batch Processing**
```typescript
export class BatchProcessor {
  constructor(
    private batchSize: number = 50,
    private concurrency: number = 3
  ) {}

  async processBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const batches = this.createBatches(items, this.batchSize);
    const results: R[] = [];
    
    // Process batches in parallel with concurrency limit
    for (let i = 0; i < batches.length; i += this.concurrency) {
      const concurrentBatches = batches.slice(i, i + this.concurrency);
      
      const batchPromises = concurrentBatches.map(async (batch, index) => {
        console.log(`Processing batch ${i + index + 1}/${batches.length} (${batch.length} items)`);
        return processor(batch);
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
      
      // Small delay between batch groups
      if (i + this.concurrency < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}
```

---

## 🧠 **Memory Management**

### **Memory-Efficient Streaming**
```typescript
export class StreamingSyncProcessor {
  private readonly MAX_MEMORY_MB = 512;
  private readonly BATCH_SIZE = 100;
  
  constructor(private syncClient: SyncClient) {}

  async syncLargeContentType(
    contentType: string,
    outputPath: string
  ): Promise<void> {
    let skip = 0;
    let hasMore = true;
    let processedCount = 0;

    while (hasMore) {
      // Monitor memory usage
      await this.checkMemoryUsage();
      
      console.log(`Processing ${contentType}: ${skip}-${skip + this.BATCH_SIZE}`);
      
      const batch = await this.syncClient.getContentBatch({
        referenceName: contentType,
        take: this.BATCH_SIZE,
        skip,
        includeLinkedContent: false // Reduce memory footprint
      });

      if (batch.items.length === 0) break;

      // Process and immediately write to disk
      await this.processBatchStreaming(batch.items, outputPath, contentType);
      
      processedCount += batch.items.length;
      skip += this.BATCH_SIZE;
      hasMore = batch.items.length === this.BATCH_SIZE;
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      console.log(`✓ Processed ${processedCount} ${contentType} items`);
    }
  }

  private async processBatchStreaming(
    items: any[],
    outputPath: string,
    contentType: string
  ): Promise<void> {
    const organizer = new ContentFileOrganizer(outputPath);
    
    // Process items one by one to minimize memory usage
    for (const item of items) {
      await organizer.organizeContent(contentType, [item]);
      
      // Clear item reference
      Object.keys(item).forEach(key => delete item[key]);
    }
    
    // Clear the array
    items.length = 0;
  }

  private async checkMemoryUsage(): Promise<void> {
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    
    if (memUsageMB > this.MAX_MEMORY_MB) {
      console.warn(`High memory usage: ${memUsageMB.toFixed(2)}MB`);
      
      if (global.gc) {
        global.gc();
        console.log('Forced garbage collection');
      }
      
      // Wait for memory cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### **Memory Pool Management**
```typescript
export class MemoryPool {
  private pool: any[] = [];
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  acquire(): any {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  release(obj: any): void {
    if (this.pool.length < this.maxSize) {
      // Clear object properties
      Object.keys(obj).forEach(key => delete obj[key]);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  getStats(): { poolSize: number; maxSize: number } {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize
    };
  }
}
```

---

## 📊 **Performance Monitoring**

### **Real-time Metrics**
```typescript
export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  private startTime = Date.now();

  startOperation(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      memoryStart: process.memoryUsage().heapUsed,
      memoryEnd: 0,
      status: 'running'
    });
  }

  endOperation(name: string, itemCount?: number): void {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.memoryEnd = process.memoryUsage().heapUsed;
      metric.status = 'completed';
      metric.itemCount = itemCount;
      
      console.log(`✓ ${name}: ${metric.duration}ms${itemCount ? ` (${itemCount} items)` : ''}`);
    }
  }

  getMetrics(): PerformanceReport {
    const operations = Array.from(this.metrics.values());
    const totalDuration = Date.now() - this.startTime;
    
    return {
      totalDuration,
      operations,
      totalItems: operations.reduce((sum, op) => sum + (op.itemCount || 0), 0),
      memoryUsage: {
        peak: Math.max(...operations.map(op => op.memoryEnd)),
        current: process.memoryUsage().heapUsed,
        average: operations.reduce((sum, op) => sum + op.memoryEnd, 0) / operations.length
      },
      performance: {
        averageItemsPerSecond: this.calculateItemsPerSecond(operations),
        slowestOperation: operations.reduce((slowest, op) => 
          op.duration > (slowest?.duration || 0) ? op : slowest, null
        )
      }
    };
  }

  private calculateItemsPerSecond(operations: PerformanceMetric[]): number {
    const totalItems = operations.reduce((sum, op) => sum + (op.itemCount || 0), 0);
    const totalDuration = operations.reduce((sum, op) => sum + op.duration, 0);
    
    return totalDuration > 0 ? (totalItems / totalDuration) * 1000 : 0;
  }

  logReport(): void {
    const report = this.getMetrics();
    
    console.log('\n📊 Performance Report:');
    console.log(`Total Duration: ${report.totalDuration}ms`);
    console.log(`Total Items: ${report.totalItems}`);
    console.log(`Items/Second: ${report.performance.averageItemsPerSecond.toFixed(2)}`);
    console.log(`Memory Peak: ${(report.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`);
    
    if (report.performance.slowestOperation) {
      console.log(`Slowest Operation: ${report.performance.slowestOperation.name} (${report.performance.slowestOperation.duration}ms)`);
    }
  }
}

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryStart: number;
  memoryEnd: number;
  status: 'running' | 'completed' | 'failed';
  itemCount?: number;
}

interface PerformanceReport {
  totalDuration: number;
  operations: PerformanceMetric[];
  totalItems: number;
  memoryUsage: {
    peak: number;
    current: number;
    average: number;
  };
  performance: {
    averageItemsPerSecond: number;
    slowestOperation: PerformanceMetric | null;
  };
}
```

---

## 🔧 **Optimization Utilities**

### **Content Deduplication**
```typescript
export class ContentDeduplicator {
  private seenContent = new Set<string>();
  
  isDuplicate(content: any): boolean {
    const hash = this.generateContentHash(content);
    
    if (this.seenContent.has(hash)) {
      return true;
    }
    
    this.seenContent.add(hash);
    return false;
  }

  private generateContentHash(content: any): string {
    const crypto = require('crypto');
    const normalized = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  clear(): void {
    this.seenContent.clear();
  }

  getStats(): { uniqueItems: number } {
    return { uniqueItems: this.seenContent.size };
  }
}
```

---

## 🔗 **Related Documentation**

- **Sync Client Setup**: `sync-sdk/sync-client-setup.md`
- **Sync Operations**: `sync-sdk/sync-operations.md`
- **Build Integration**: `sync-sdk/build-integration.md`
- **Deployment**: `sync-sdk/deployment.md`

---

This comprehensive performance guide ensures optimal sync operations with the Agility Sync SDK through caching, parallel processing, and memory management strategies. 
# Agility CMS Sync SDK - Sync Operations

This document covers content synchronization patterns, incremental builds, and performance optimization for the Agility Sync SDK.

---

## 🔄 **Content Synchronization**

### **Full Content Sync**
```typescript
export async function fullContentSync(
  syncClient: SyncClient,
  outputPath: string
): Promise<SyncResult> {
  const startTime = Date.now();
  let totalItems = 0;
  const errors: SyncError[] = [];

  try {
    const contentTypes = ['posts', 'pages', 'products', 'categories'];
    
    for (const contentType of contentTypes) {
      console.log(`Syncing ${contentType}...`);
      
      const result = await syncClient.syncContentType({
        referenceName: contentType,
        outputPath: path.join(outputPath, 'content', contentType),
        includeLinkedContent: true,
        expandDepth: 2
      });
      
      totalItems += result.itemCount;
      console.log(`✓ Synced ${result.itemCount} ${contentType} items`);
    }

    // Sync sitemap and media
    await syncClient.syncSitemap({
      outputPath: path.join(outputPath, 'sitemap')
    });

    return {
      success: errors.length === 0,
      totalItems,
      duration: Date.now() - startTime,
      errors,
      timestamp: new Date()
    };
  } catch (error) {
    throw new Error(`Full sync failed: ${error.message}`);
  }
}
```

### **Incremental Sync**
```typescript
export class IncrementalSyncManager {
  private syncTokens: Map<string, string> = new Map();
  private lastSyncPath: string;

  constructor(private syncClient: SyncClient, private outputPath: string) {
    this.lastSyncPath = path.join(outputPath, '.sync-state.json');
    this.loadSyncState();
  }

  async performIncrementalSync(): Promise<IncrementalSyncResult> {
    const changes: ContentChange[] = [];
    const contentTypes = ['posts', 'pages', 'products'];

    for (const contentType of contentTypes) {
      const lastToken = this.syncTokens.get(contentType) || '0';
      
      const result = await this.syncClient.syncContentIncremental({
        referenceName: contentType,
        syncToken: lastToken,
        outputPath: path.join(this.outputPath, 'content', contentType)
      });

      if (result.hasChanges) {
        changes.push(...result.changes);
        this.syncTokens.set(contentType, result.newSyncToken);
      }
    }

    await this.saveSyncState();
    
    return {
      hasChanges: changes.length > 0,
      changes,
      duration: 0,
      timestamp: new Date()
    };
  }

  private async loadSyncState(): Promise<void> {
    try {
      if (fs.existsSync(this.lastSyncPath)) {
        const state = JSON.parse(fs.readFileSync(this.lastSyncPath, 'utf8'));
        this.syncTokens = new Map(state.syncTokens || []);
      }
    } catch (error) {
      console.warn('Starting fresh sync - no previous state found');
    }
  }

  private async saveSyncState(): Promise<void> {
    const state = {
      syncTokens: Array.from(this.syncTokens.entries()),
      lastSync: new Date().toISOString()
    };
    fs.writeFileSync(this.lastSyncPath, JSON.stringify(state, null, 2));
  }
}
```

---

## 📁 **File Organization**

### **Content File Structure**
```typescript
export class ContentFileOrganizer {
  constructor(private outputPath: string) {}

  async organizeContent(contentType: string, items: any[]): Promise<void> {
    const basePath = path.join(this.outputPath, 'content', contentType);
    await this.ensureDirectories(basePath);
    
    if (this.isTimeBasedContent(contentType)) {
      await this.organizeByDate(basePath, items);
    } else {
      await this.organizeByType(basePath, items);
    }
  }

  private async organizeByDate(basePath: string, items: any[]): Promise<void> {
    for (const item of items) {
      const date = new Date(item.fields.date || item.properties.modified);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      const monthPath = path.join(basePath, year.toString(), month);
      await this.ensureDirectories(monthPath);
      
      const fileName = `${item.fields.slug || item.contentID}.json`;
      await this.writeContentFile(path.join(monthPath, fileName), item);
    }
  }

  private async organizeByType(basePath: string, items: any[]): Promise<void> {
    for (const item of items) {
      const fileName = `${item.fields.slug || item.contentID}.json`;
      await this.writeContentFile(path.join(basePath, fileName), item);
    }
  }

  private async writeContentFile(filePath: string, item: any): Promise<void> {
    const content = {
      ...item,
      _syncMeta: {
        syncedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  }

  private async ensureDirectories(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private isTimeBasedContent(contentType: string): boolean {
    return ['posts', 'news', 'events'].includes(contentType);
  }
}
```

### **Index Generation**
```typescript
export class ContentIndexGenerator {
  constructor(private outputPath: string) {}

  async generateIndexes(): Promise<void> {
    await this.generateContentTypeIndexes();
    await this.generateMasterIndex();
  }

  private async generateContentTypeIndexes(): Promise<void> {
    const contentPath = path.join(this.outputPath, 'content');
    const contentTypes = fs.readdirSync(contentPath);

    for (const contentType of contentTypes) {
      const typePath = path.join(contentPath, contentType);
      const index = await this.buildContentTypeIndex(typePath);
      
      fs.writeFileSync(
        path.join(typePath, 'index.json'),
        JSON.stringify(index, null, 2)
      );
    }
  }

  private async buildContentTypeIndex(typePath: string): Promise<ContentIndex> {
    const items: ContentIndexItem[] = [];
    
    const processDirectory = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          processDirectory(fullPath);
        } else if (entry.name.endsWith('.json') && entry.name !== 'index.json') {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          
          items.push({
            contentID: content.contentID,
            slug: content.fields.slug,
            title: content.fields.title,
            modified: content.properties.modified,
            filePath: path.relative(typePath, fullPath)
          });
        }
      }
    };

    processDirectory(typePath);

    return {
      totalItems: items.length,
      items: items.sort((a, b) => 
        new Date(b.modified).getTime() - new Date(a.modified).getTime()
      ),
      generatedAt: new Date().toISOString()
    };
  }

  private async generateMasterIndex(): Promise<void> {
    const contentPath = path.join(this.outputPath, 'content');
    const contentTypes = fs.readdirSync(contentPath);
    
    const masterIndex = {
      contentTypes: {} as Record<string, ContentTypeSummary>,
      totalItems: 0,
      generatedAt: new Date().toISOString()
    };

    for (const contentType of contentTypes) {
      const indexPath = path.join(contentPath, contentType, 'index.json');
      
      if (fs.existsSync(indexPath)) {
        const typeIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        
        masterIndex.contentTypes[contentType] = {
          totalItems: typeIndex.totalItems,
          lastModified: typeIndex.items[0]?.modified || null
        };
        
        masterIndex.totalItems += typeIndex.totalItems;
      }
    }

    fs.writeFileSync(
      path.join(this.outputPath, 'index.json'),
      JSON.stringify(masterIndex, null, 2)
    );
  }
}
```

---

## ⚡ **Performance Optimization**

### **Parallel Processing**
```typescript
export class ParallelSyncProcessor {
  constructor(
    private syncClient: SyncClient,
    private maxConcurrency: number = 3
  ) {}

  async syncContentTypesParallel(
    contentTypes: string[],
    outputPath: string
  ): Promise<ParallelSyncResult> {
    const results: ContentTypeSyncResult[] = [];
    const batches = this.createBatches(contentTypes, this.maxConcurrency);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (contentType) => {
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
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      results,
      totalItems: results.reduce((sum, r) => sum + r.itemCount, 0),
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
    };
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

### **Memory Management**
```typescript
export class MemoryEfficientSync {
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
      const batch = await this.syncClient.getContentBatch({
        referenceName: contentType,
        take: this.BATCH_SIZE,
        skip
      });

      if (batch.items.length === 0) break;

      await this.processBatch(batch.items, outputPath, contentType);
      
      processedCount += batch.items.length;
      skip += this.BATCH_SIZE;
      hasMore = batch.items.length === this.BATCH_SIZE;
      
      // Force garbage collection if available
      if (global.gc) global.gc();
      
      console.log(`✓ Processed ${processedCount} ${contentType} items`);
    }
  }

  private async processBatch(
    items: any[],
    outputPath: string,
    contentType: string
  ): Promise<void> {
    const organizer = new ContentFileOrganizer(outputPath);
    await organizer.organizeContent(contentType, items);
    items.length = 0; // Clear memory
  }
}
```

---

## 📊 **Monitoring & Logging**

### **Sync Progress Tracking**
```typescript
export class SyncProgressTracker {
  private progress: Map<string, SyncProgress> = new Map();

  startSync(contentType: string, totalItems: number): void {
    this.progress.set(contentType, {
      contentType,
      totalItems,
      processedItems: 0,
      startTime: Date.now(),
      status: 'running'
    });
  }

  updateProgress(contentType: string, processedItems: number): void {
    const progress = this.progress.get(contentType);
    if (progress) {
      progress.processedItems = processedItems;
      
      const percentage = (processedItems / progress.totalItems) * 100;
      console.log(`${contentType}: ${percentage.toFixed(1)}% (${processedItems}/${progress.totalItems})`);
    }
  }

  completeSync(contentType: string): void {
    const progress = this.progress.get(contentType);
    if (progress) {
      progress.status = 'completed';
      progress.duration = Date.now() - progress.startTime;
      
      console.log(`✓ ${contentType} sync completed in ${progress.duration}ms`);
    }
  }

  getOverallProgress(): SyncOverallProgress {
    const syncs = Array.from(this.progress.values());
    const totalItems = syncs.reduce((sum, s) => sum + s.totalItems, 0);
    const processedItems = syncs.reduce((sum, s) => sum + s.processedItems, 0);
    
    return {
      totalItems,
      processedItems,
      percentage: totalItems > 0 ? (processedItems / totalItems) * 100 : 0,
      completedSyncs: syncs.filter(s => s.status === 'completed').length,
      totalSyncs: syncs.length
    };
  }
}
```

---

## 🔗 **Related Documentation**

- **Sync Client Setup**: `sync-sdk/sync-client-setup.md`
- **Build Integration**: `sync-sdk/build-integration.md`
- **Performance**: `sync-sdk/performance.md`
- **Deployment**: `sync-sdk/deployment.md`

---

## 📋 **Interface Definitions**

```typescript
interface SyncResult {
  success: boolean;
  totalItems: number;
  duration: number;
  errors: SyncError[];
  timestamp: Date;
}

interface SyncError {
  contentType: string;
  error: string;
  timestamp: Date;
}

interface ContentChange {
  contentType: string;
  contentID: number;
  action: 'created' | 'updated' | 'deleted';
  timestamp: Date;
}

interface ContentIndex {
  totalItems: number;
  items: ContentIndexItem[];
  generatedAt: string;
}

interface ContentIndexItem {
  contentID: number;
  slug: string;
  title: string;
  modified: string;
  filePath: string;
}

interface ParallelSyncResult {
  results: ContentTypeSyncResult[];
  totalItems: number;
  totalDuration: number;
}

interface ContentTypeSyncResult {
  contentType: string;
  itemCount: number;
  duration: number;
  success: boolean;
  error?: string;
}
```

This comprehensive guide covers all essential sync operations with the Agility Sync SDK, optimized for production use. 
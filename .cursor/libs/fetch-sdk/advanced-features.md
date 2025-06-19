# Agility CMS Fetch SDK - Advanced Features

This document covers advanced features including GraphQL support, media operations, sync operations, and performance optimization techniques.

---

## 📊 **GraphQL Support**

### **GraphQL Client Setup**
```typescript
// Initialize GraphQL-enabled client
const graphqlApi = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  isPreview: false,
  mode: 'graphql' // Enable GraphQL mode
});

// Alternative: Use dedicated GraphQL endpoint
const graphqlEndpoint = `https://api.aglty.io/graphql/${guid}`;
```

### **Custom GraphQL Queries**
```typescript
// Complex query with relationships and filtering
const query = `
  query GetBlogPosts($take: Int, $skip: Int, $categoryId: Int) {
    posts(
      take: $take
      skip: $skip
      filter: { categoryId: { eq: $categoryId } }
      sort: { date: DESC }
    ) {
      items {
        contentID
        properties {
          state
          modified
        }
        fields {
          title
          slug
          date
          excerpt
          content
          featuredImage {
            url
            label
            fileSize
            height
            width
          }
          category {
            fields {
              title
              slug
              description
            }
          }
          tags {
            fields {
              name
              slug
            }
          }
          author {
            fields {
              name
              email
              bio
              avatar {
                url
              }
            }
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Execute query with variables
const result = await graphqlApi.query({
  query,
  variables: {
    take: 10,
    skip: 0,
    categoryId: 5
  }
});
```

### **GraphQL Fragments**
```typescript
// Define reusable fragments
const fragments = {
  imageFragment: `
    fragment ImageFields on Image {
      url
      label
      fileSize
      height
      width
      altText
    }
  `,
  
  authorFragment: `
    fragment AuthorFields on Author {
      fields {
        name
        email
        bio
        avatar {
          ...ImageFields
        }
        socialLinks {
          twitter
          linkedin
          website
        }
      }
    }
  `
};

// Use fragments in queries
const queryWithFragments = `
  ${fragments.imageFragment}
  ${fragments.authorFragment}
  
  query GetPost($slug: String!) {
    post(filter: { slug: { eq: $slug } }) {
      fields {
        title
        content
        featuredImage {
          ...ImageFields
        }
        author {
          ...AuthorFields
        }
      }
    }
  }
`;
```

### **GraphQL Subscriptions**
```typescript
// Real-time content updates (if supported)
const subscription = `
  subscription ContentUpdated($referenceName: String!) {
    contentUpdated(referenceName: $referenceName) {
      contentID
      action
      fields {
        title
        modified
      }
    }
  }
`;

// Subscribe to changes
const unsubscribe = graphqlApi.subscribe({
  query: subscription,
  variables: { referenceName: 'posts' },
  callback: (data) => {
    console.log('Content updated:', data);
    // Invalidate cache, update UI, etc.
  }
});
```

---

## 🖼️ **Advanced Media Operations**

### **Gallery Management**
```typescript
const gallery = await api.getGallery({
  galleryID: 789
});

// Process gallery with metadata
interface ProcessedGalleryItem {
  id: string;
  url: string;
  optimizedUrl: string;
  title: string;
  description: string;
  altText: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  tags: string[];
}

function processGalleryItems(gallery: any): ProcessedGalleryItem[] {
  return gallery.media.map((item: any) => ({
    id: item.mediaID,
    url: item.url,
    optimizedUrl: optimizeImageUrl(item.url, { 
      width: 800, 
      quality: 80, 
      format: 'auto' 
    }),
    title: item.metaData.title || item.fileName,
    description: item.metaData.description || '',
    altText: item.metaData.altText || item.metaData.title,
    fileSize: item.size,
    dimensions: {
      width: item.width,
      height: item.height
    },
    tags: item.metaData.keywords?.split(',') || []
  }));
}

const processedGallery = processGalleryItems(gallery);
```

### **Advanced Image Optimization**
```typescript
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  fit?: 'crop' | 'bounds' | 'canvas';
  background?: string;
  blur?: number;
  sharpen?: boolean;
  progressive?: boolean;
}

function optimizeImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions
): string {
  if (!originalUrl.includes('cdn.aglty.io')) {
    return originalUrl;
  }
  
  const params = new URLSearchParams();
  
  // Size parameters
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  
  // Quality and format
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('format', options.format);
  
  // Fit and layout
  if (options.fit) params.set('fit', options.fit);
  if (options.background) params.set('bg', options.background);
  
  // Effects
  if (options.blur) params.set('blur', options.blur.toString());
  if (options.sharpen) params.set('sharpen', 'true');
  if (options.progressive) params.set('progressive', 'true');
  
  return `${originalUrl}?${params.toString()}`;
}

// Responsive image generation
function generateResponsiveImageSet(originalUrl: string) {
  const breakpoints = [320, 640, 768, 1024, 1280, 1920];
  
  return {
    srcSet: breakpoints
      .map(width => 
        `${optimizeImageUrl(originalUrl, { width, quality: 80, format: 'auto' })} ${width}w`
      )
      .join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    src: optimizeImageUrl(originalUrl, { width: 800, quality: 80, format: 'auto' })
  };
}
```

### **Media Lazy Loading**
```typescript
// React component for optimized image loading
import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  const responsiveSet = generateResponsiveImageSet(src);
  
  return (
    <div className={`image-container ${className || ''}`}>
      {!isLoaded && (
        <div className="image-placeholder" style={{ width, height }}>
          <div className="loading-spinner" />
        </div>
      )}
      
      {isInView && (
        <img
          ref={imgRef}
          src={responsiveSet.src}
          srcSet={responsiveSet.srcSet}
          sizes={responsiveSet.sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
}
```

---

## 🔄 **Advanced Sync Operations**

### **Incremental Content Sync**
```typescript
class AgilityContentSync {
  private contentSyncToken: string = '0';
  private pageSyncToken: string = '0';
  private lastSyncTime: Date = new Date(0);
  
  constructor(
    private api: any,
    private storage: SyncStorage // Custom storage interface
  ) {
    this.loadSyncState();
  }
  
  async syncAll(): Promise<SyncResult> {
    const results = await Promise.all([
      this.syncContent(),
      this.syncPages(),
      this.syncMedia()
    ]);
    
    await this.saveSyncState();
    
    return {
      content: results[0],
      pages: results[1],
      media: results[2],
      timestamp: new Date()
    };
  }
  
  async syncContent(): Promise<ContentSyncResult> {
    let totalProcessed = 0;
    let hasMore = true;
    
    while (hasMore) {
      const result = await this.api.getSyncContent({
        syncToken: this.contentSyncToken,
        languageCode: 'en-us',
        pageSize: 500
      });
      
      // Process content items
      for (const item of result.items) {
        await this.processContentItem(item);
        totalProcessed++;
      }
      
      this.contentSyncToken = result.syncToken;
      hasMore = result.items.length === 500; // More items available
      
      // Progress callback
      this.onProgress?.('content', totalProcessed);
    }
    
    return { processed: totalProcessed };
  }
  
  private async processContentItem(item: any) {
    const operation = item.properties.state === 'Deleted' ? 'delete' : 'upsert';
    
    switch (operation) {
      case 'upsert':
        await this.storage.upsertContent(item);
        break;
      case 'delete':
        await this.storage.deleteContent(item.contentID);
        break;
    }
  }
  
  private async loadSyncState() {
    const state = await this.storage.getSyncState();
    if (state) {
      this.contentSyncToken = state.contentSyncToken || '0';
      this.pageSyncToken = state.pageSyncToken || '0';
      this.lastSyncTime = state.lastSyncTime || new Date(0);
    }
  }
  
  private async saveSyncState() {
    await this.storage.setSyncState({
      contentSyncToken: this.contentSyncToken,
      pageSyncToken: this.pageSyncToken,
      lastSyncTime: new Date()
    });
  }
}

// Storage interface implementation
interface SyncStorage {
  upsertContent(item: any): Promise<void>;
  deleteContent(contentID: string): Promise<void>;
  getSyncState(): Promise<SyncState | null>;
  setSyncState(state: SyncState): Promise<void>;
}
```

### **Conflict Resolution**
```typescript
class ConflictResolver {
  async resolveContentConflict(
    localItem: any, 
    remoteItem: any
  ): Promise<'local' | 'remote' | 'merge'> {
    // Compare modification dates
    const localModified = new Date(localItem.properties.modified);
    const remoteModified = new Date(remoteItem.properties.modified);
    
    if (remoteModified > localModified) {
      return 'remote'; // Remote is newer
    }
    
    if (localModified > remoteModified) {
      // Check if local changes are significant
      const hasSignificantChanges = this.hasSignificantChanges(localItem, remoteItem);
      return hasSignificantChanges ? 'local' : 'remote';
    }
    
    // Same modification time - attempt merge
    return 'merge';
  }
  
  private hasSignificantChanges(local: any, remote: any): boolean {
    // Compare key fields for significant differences
    const keyFields = ['title', 'content', 'slug'];
    
    return keyFields.some(field => {
      const localValue = local.fields?.[field];
      const remoteValue = remote.fields?.[field];
      return localValue !== remoteValue;
    });
  }
  
  async mergeContent(localItem: any, remoteItem: any): Promise<any> {
    // Custom merge logic based on content type
    const merged = { ...remoteItem };
    
    // Preserve local customizations if they exist
    if (localItem.customData) {
      merged.customData = {
        ...remoteItem.customData,
        ...localItem.customData
      };
    }
    
    return merged;
  }
}
```

---

## ⚡ **Performance Optimization**

### **Request Batching**
```typescript
class BatchRequestManager {
  private requestQueue: Array<{
    operation: string;
    params: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 50; // ms
  
  async request(operation: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ operation, params, resolve, reject });
      this.scheduleBatch();
    });
  }
  
  private scheduleBatch() {
    if (this.batchTimeout) return;
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }
  
  private async processBatch() {
    if (this.requestQueue.length === 0) return;
    
    const batch = this.requestQueue.splice(0, this.BATCH_SIZE);
    this.batchTimeout = null;
    
    // Group requests by operation type
    const grouped = this.groupRequestsByOperation(batch);
    
    // Execute batched requests
    await Promise.all(
      Object.entries(grouped).map(([operation, requests]) =>
        this.executeBatchedOperation(operation, requests)
      )
    );
    
    // Process remaining requests
    if (this.requestQueue.length > 0) {
      this.scheduleBatch();
    }
  }
  
  private groupRequestsByOperation(batch: any[]) {
    return batch.reduce((groups, request) => {
      if (!groups[request.operation]) {
        groups[request.operation] = [];
      }
      groups[request.operation].push(request);
      return groups;
    }, {} as { [key: string]: any[] });
  }
  
  private async executeBatchedOperation(operation: string, requests: any[]) {
    try {
      switch (operation) {
        case 'getContentItem':
          await this.batchGetContentItems(requests);
          break;
        case 'getContentList':
          await this.batchGetContentLists(requests);
          break;
        default:
          // Execute individually for non-batchable operations
          await Promise.all(
            requests.map(req => this.executeSingleRequest(req))
          );
      }
    } catch (error) {
      // Reject all requests in the batch
      requests.forEach(req => req.reject(error));
    }
  }
  
  private async batchGetContentItems(requests: any[]) {
    const contentIDs = requests.map(req => req.params.contentID);
    
    // Use GraphQL to fetch multiple items
    const query = `
      query GetMultipleItems($ids: [Int!]!) {
        items: contentItems(filter: { contentID: { in: $ids } }) {
          contentID
          fields
          properties
        }
      }
    `;
    
    const result = await this.api.query({ query, variables: { ids: contentIDs } });
    
    // Resolve individual requests
    requests.forEach(req => {
      const item = result.items.find((item: any) => 
        item.contentID === req.params.contentID
      );
      req.resolve(item);
    });
  }
}
```

### **Intelligent Caching**
```typescript
class IntelligentCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes
  
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached, options.ttl)) {
      // Return cached value and optionally refresh in background
      if (options.staleWhileRevalidate && this.isStale(cached)) {
        this.refreshInBackground(key, fetcher, options);
      }
      return cached.value;
    }
    
    // Fetch fresh data
    const value = await fetcher();
    this.set(key, value, options);
    return value;
  }
  
  private set<T>(key: string, value: T, options: CacheOptions = {}) {
    const ttl = options.ttl || this.DEFAULT_TTL;
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      ttl,
      tags: options.tags || []
    };
    
    this.cache.set(key, entry);
    
    // Set expiration cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }
  
  invalidateByTag(tag: string) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }
  
  private isExpired(entry: CacheEntry, customTtl?: number): boolean {
    const ttl = customTtl || entry.ttl;
    return Date.now() - entry.timestamp > ttl;
  }
  
  private isStale(entry: CacheEntry): boolean {
    const staleThreshold = entry.ttl * 0.8; // 80% of TTL
    return Date.now() - entry.timestamp > staleThreshold;
  }
  
  private async refreshInBackground<T>(
    key: string, 
    fetcher: () => Promise<T>,
    options: CacheOptions
  ) {
    try {
      const value = await fetcher();
      this.set(key, value, options);
    } catch (error) {
      console.warn('Background refresh failed:', error);
    }
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  staleWhileRevalidate?: boolean;
}
```

### **Connection Pooling**
```typescript
class ConnectionPool {
  private pool: Array<{ connection: any; inUse: boolean }> = [];
  private readonly maxConnections = 10;
  private readonly connectionTimeout = 30000;
  
  async getConnection(): Promise<any> {
    // Find available connection
    let pooledConnection = this.pool.find(conn => !conn.inUse);
    
    if (pooledConnection) {
      pooledConnection.inUse = true;
      return pooledConnection.connection;
    }
    
    // Create new connection if under limit
    if (this.pool.length < this.maxConnections) {
      const connection = await this.createConnection();
      const pooledConn = { connection, inUse: true };
      this.pool.push(pooledConn);
      return connection;
    }
    
    // Wait for available connection
    return this.waitForConnection();
  }
  
  releaseConnection(connection: any) {
    const pooledConn = this.pool.find(conn => conn.connection === connection);
    if (pooledConn) {
      pooledConn.inUse = false;
    }
  }
  
  private async createConnection(): Promise<any> {
    // Create new API client instance
    return agility.getApi({
      guid: process.env.AGILITY_GUID,
      apiKey: process.env.AGILITY_API_KEY,
      isPreview: false
    });
  }
  
  private async waitForConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.connectionTimeout);
      
      const checkForConnection = () => {
        const available = this.pool.find(conn => !conn.inUse);
        if (available) {
          clearTimeout(timeout);
          available.inUse = true;
          resolve(available.connection);
        } else {
          setTimeout(checkForConnection, 100);
        }
      };
      
      checkForConnection();
    });
  }
}
```

---

## 🔗 **Related Documentation**

- **Core APIs**: `fetch-sdk/core-apis.md`
- **Content Operations**: `fetch-sdk/content-operations.md`
- **Page Operations**: `fetch-sdk/page-operations.md`
- **Sitemap Operations**: `fetch-sdk/sitemap-operations.md`
- **Best Practices**: `fetch-sdk/best-practices.md`

---

This guide covers advanced features and optimization techniques for the Agility Fetch SDK, enabling high-performance, scalable applications.
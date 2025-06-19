---
title: "Agility Fetch SDK - Core APIs"
description: "Client initialization, configuration, and core API setup for Agility CMS Fetch SDK"
type: "sdk-documentation"
category: "fetch-sdk"
tags: ["agility-fetch", "api-client", "initialization", "configuration", "cdn"]
sdk: "fetch"
complexity: "beginner"
lines: 385
version: "1.0"
last_updated: "2024-12-19"
related_files: ["content-operations.md", "page-operations.md", "best-practices.md"]
keywords: ["AgilityFetch", "client setup", "API keys", "regional endpoints"]
---

# Agility CMS Fetch SDK - Core APIs

This document covers the fundamental APIs and configuration options for the Agility Content Fetch SDK (`@agility/content-fetch`).

---

## 📦 **SDK Installation & Import**

### **Installation**
```bash
npm install @agility/content-fetch
# or
yarn add @agility/content-fetch
```

### **Import Patterns**
```typescript
// Default import (recommended)
import agility from '@agility/content-fetch';

// Named import
import { getApi } from '@agility/content-fetch';

// TypeScript interfaces
import { 
  ContentItem, 
  ContentList, 
  Page, 
  SitemapFlat,
  ApiClient 
} from '@agility/content-fetch';
```

---

## 🔧 **API Client Initialization**

### **Basic Configuration**
```typescript
import agility from '@agility/content-fetch';

const api = agility.getApi({
  guid: 'your-instance-guid',
  apiKey: 'your-api-key',
  isPreview: false // true for preview content, false for published
});
```

### **Environment-Based Setup**
```typescript
// Automatic environment detection
const api = agility.getApi({
  guid: process.env.AGILITY_GUID!,
  apiKey: process.env.NODE_ENV === 'development' 
    ? process.env.AGILITY_API_PREVIEW_KEY!
    : process.env.AGILITY_API_FETCH_KEY!,
  isPreview: process.env.NODE_ENV === 'development'
});
```

### **Advanced Configuration**
```typescript
const api = agility.getApi({
  guid: 'your-instance-guid',
  apiKey: 'your-api-key',
  isPreview: false,
  
  // Caching configuration
  caching: {
    maxAge: 300,              // Cache duration in seconds
    mustRevalidate: true      // Force revalidation
  },
  
  // Regional endpoint
  baseURL: 'https://api-ca.aglty.io', // Canadian endpoint
  
  // Request timeout
  timeout: 30000,             // 30 seconds
  
  // Custom headers
  headers: {
    'User-Agent': 'MyApp/1.0.0'
  }
});
```

---

## 🌍 **Regional Endpoints**

### **Available Regions**
```typescript
const regionEndpoints = {
  usa: 'https://api.aglty.io',           // Default (US East)
  canada: 'https://api-ca.aglty.io',     // Canada
  europe: 'https://api-eu.aglty.io',     // Europe
  australia: 'https://api-aus.aglty.io'  // Australia
};

// Select based on user location or configuration
const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  baseURL: regionEndpoints.canada
});
```

### **Dynamic Region Selection**
```typescript
function getRegionalEndpoint(userRegion: string): string {
  const regionMap: Record<string, string> = {
    'US': 'https://api.aglty.io',
    'CA': 'https://api-ca.aglty.io',
    'GB': 'https://api-eu.aglty.io',
    'DE': 'https://api-eu.aglty.io',
    'AU': 'https://api-aus.aglty.io'
  };
  
  return regionMap[userRegion] || regionMap['US'];
}

const api = agility.getApi({
  guid: process.env.AGILITY_GUID!,
  apiKey: process.env.AGILITY_API_KEY!,
  baseURL: getRegionalEndpoint('CA')
});
```

---

## ⚙️ **Configuration Options**

### **Preview vs Published Content**
```typescript
// Published content (production)
const liveApi = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-fetch-key',    // Fetch API key
  isPreview: false
});

// Preview content (development/staging)
const previewApi = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-preview-key',  // Preview API key
  isPreview: true
});

// Environment-based switching
const api = agility.getApi({
  guid: process.env.AGILITY_GUID!,
  apiKey: process.env.NODE_ENV === 'production'
    ? process.env.AGILITY_API_FETCH_KEY!
    : process.env.AGILITY_API_PREVIEW_KEY!,
  isPreview: process.env.NODE_ENV !== 'production'
});
```

### **Caching Configuration**
```typescript
const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  caching: {
    maxAge: 300,              // Cache for 5 minutes
    mustRevalidate: true,     // Always check for updates
    
    // Custom cache key function
    getCacheKey: (url: string, params: any) => {
      return `agility-${url}-${JSON.stringify(params)}`;
    }
  }
});
```

### **Error Handling Configuration**
```typescript
const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,              // 1 second between retries
    backoff: 2                // Exponential backoff multiplier
  },
  
  // Timeout configuration
  timeout: 30000,             // 30 seconds
  
  // Error handler
  onError: (error: any) => {
    console.error('Agility API Error:', error);
    // Custom error tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_error', {
        error_message: error.message,
        error_code: error.response?.status
      });
    }
  }
});
```

---

## 🔍 **API Client Methods**

### **Core API Surface**
```typescript
interface ApiClient {
  // Content operations
  getContentList(options: ContentListOptions): Promise<ContentList>;
  getContentItem(options: ContentItemOptions): Promise<ContentItem>;
  
  // Page operations
  getPage(options: PageOptions): Promise<Page>;
  getPageByPath(options: PageByPathOptions): Promise<PageResult>;
  
  // Sitemap operations
  getSitemapFlat(options: SitemapOptions): Promise<SitemapFlat>;
  getSitemapNested(options: SitemapOptions): Promise<SitemapNested>;
  
  // URL generation
  getUrlPath(options: UrlPathOptions): string;
  
  // Sync operations
  getSyncContent(options: SyncOptions): Promise<SyncResult>;
}
```

### **Common Options Interface**
```typescript
interface BaseOptions {
  languageCode: string;       // Required: 'en-us', 'fr-ca', etc.
  contentLinkDepth?: number;  // 0-10, default: 2
  expandAllContentLinks?: boolean; // Default: false
}

interface ContentListOptions extends BaseOptions {
  referenceName: string;      // Content definition reference name
  take?: number;              // Limit results (default: 50, max: 250)
  skip?: number;              // Pagination offset
  sort?: string;              // Sort expression
  filter?: string;            // OData filter expression
}

interface ContentItemOptions extends BaseOptions {
  contentID: number;          // Content item ID
}

interface PageOptions extends BaseOptions {
  pageID: number;             // Page ID
}
```

---

## 🚀 **Performance Optimization**

### **Connection Pooling**
```typescript
// For Node.js environments, configure connection pooling
import https from 'https';

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5
});

const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  httpAgent: agent  // Use connection pooling
});
```

### **Request Batching**
```typescript
// Batch multiple API calls efficiently
async function getBatchedContent() {
  const [posts, pages, sitemap] = await Promise.all([
    api.getContentList({
      referenceName: 'posts',
      languageCode: 'en-us',
      take: 10
    }),
    api.getContentList({
      referenceName: 'pages',
      languageCode: 'en-us',
      take: 5
    }),
    api.getSitemapFlat({
      channelName: 'website',
      languageCode: 'en-us'
    })
  ]);

  return { posts, pages, sitemap };
}
```

### **Conditional Requests**
```typescript
// Use ETags for conditional requests
let lastETag: string | null = null;

async function getContentWithETag() {
  try {
    const response = await api.getContentList({
      referenceName: 'posts',
      languageCode: 'en-us'
    }, {
      headers: lastETag ? { 'If-None-Match': lastETag } : {}
    });
    
    lastETag = response.headers?.etag;
    return response.data;
  } catch (error) {
    if (error.response?.status === 304) {
      console.log('Content not modified, using cached version');
      return null; // Use cached content
    }
    throw error;
  }
}
```

---

## 🔧 **Debugging & Logging**

### **Debug Mode**
```typescript
const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  debug: process.env.NODE_ENV === 'development',
  
  // Custom logger
  logger: {
    info: (message: string, data?: any) => console.log(`[Agility] ${message}`, data),
    warn: (message: string, data?: any) => console.warn(`[Agility] ${message}`, data),
    error: (message: string, data?: any) => console.error(`[Agility] ${message}`, data)
  }
});
```

### **Request Interceptors**
```typescript
const api = agility.getApi({
  guid: 'your-guid',
  apiKey: 'your-key',
  
  // Request interceptor
  onRequest: (config: any) => {
    console.log('Making request to:', config.url);
    config.metadata = { startTime: Date.now() };
    return config;
  },
  
  // Response interceptor
  onResponse: (response: any) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`Request completed in ${duration}ms`);
    return response;
  }
});
```

---

## 🔗 **Related Documentation**

- **Content Operations**: `fetch-sdk/content-operations.md`
- **Page Operations**: `fetch-sdk/page-operations.md`
- **Sitemap Operations**: `fetch-sdk/sitemap-operations.md`
- **Advanced Features**: `fetch-sdk/advanced-features.md`
- **Best Practices**: `fetch-sdk/best-practices.md`

---

This core API reference provides the foundation for all content fetching operations in Agility CMS. Continue to the specific operation guides for detailed implementation examples. 
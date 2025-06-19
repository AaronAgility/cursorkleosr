# Management SDK - API Client Setup

This guide covers the initialization and configuration of the Agility Management SDK API client for server-side content management operations.

---

## 📦 **SDK Installation & Import**

### **Installation**

```bash
npm install @agility/management-sdk
```

### **Import Pattern**

```typescript
import * as mgmtApi from '@agility/management-sdk';
```

---

## 🔧 **API Client Initialization**

### **Basic Setup**

```typescript
const apiClient = new mgmtApi.ApiClient({
  token: process.env.AGILITY_MANAGEMENT_TOKEN!,
  baseUrl: 'https://mgmt.aglty.io' // Optional override
});
```

### **Configuration Options**

```typescript
interface Options {
  token: string;        // Management API token (required)
  baseUrl?: string;     // Optional base URL override
  timeout?: number;     // Request timeout in milliseconds
  retries?: number;     // Number of retry attempts
}

const apiClient = new mgmtApi.ApiClient({
  token: process.env.AGILITY_MANAGEMENT_TOKEN!,
  baseUrl: 'https://mgmt.aglty.io',
  timeout: 30000,       // 30 seconds
  retries: 3
});
```

---

## 🔑 **Authentication Setup**

### **Management API Token**

```typescript
// Environment variables
AGILITY_MANAGEMENT_TOKEN=your-management-api-token
AGILITY_GUID=your-instance-guid
```

### **Token Validation**

```typescript
// Validate API client connection
async function validateConnection(apiClient: mgmtApi.ApiClient, guid: string) {
  try {
    const containers = await apiClient.containerMethods.getContainerList(guid);
    console.log('✅ Management API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Management API connection failed:', error);
    return false;
  }
}
```

---

## 🏗️ **API Client Structure**

### **Method Categories**

The Management SDK organizes methods into logical categories:

```typescript
const apiClient = new mgmtApi.ApiClient(options);

// Available method categories:
apiClient.modelMethods      // Content model operations
apiClient.contentMethods    // Content item operations
apiClient.containerMethods  // Container (content list) operations
apiClient.assetMethods      // Media and asset operations
apiClient.pageMethods       // Page and sitemap operations
```

### **Common Usage Pattern**

```typescript
// Standard workflow
const guid = process.env.AGILITY_GUID!;
const locale = 'en-us';

// 1. Get or create content model
const model = await apiClient.modelMethods.getModelByReferenceName('blog-posts', guid);

// 2. Get or create container
const container = await apiClient.containerMethods.getContainerByReferenceName('posts', guid);

// 3. Create content item
const contentPayload = {
  contentID: -1, // -1 for new content
  properties: {
    definitionName: 'BlogPost',
    referenceName: 'blog-posts'
  },
  fields: {
    title: 'My Blog Post',
    content: 'Post content here...'
  }
};

const contentID = await apiClient.contentMethods.saveContentItem(contentPayload, guid, locale);
```

---

## 🛠️ **Configuration Utilities**

### **Environment Configuration Helper**

```typescript
// lib/management-config.ts
import { z } from 'zod';

const managementConfigSchema = z.object({
  token: z.string().min(1),
  guid: z.string().min(1),
  baseUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().min(0).optional(),
});

export function getManagementConfig() {
  return managementConfigSchema.parse({
    token: process.env.AGILITY_MANAGEMENT_TOKEN,
    guid: process.env.AGILITY_GUID,
    baseUrl: process.env.AGILITY_MANAGEMENT_BASE_URL,
    timeout: process.env.AGILITY_MANAGEMENT_TIMEOUT ? parseInt(process.env.AGILITY_MANAGEMENT_TIMEOUT) : undefined,
    retries: process.env.AGILITY_MANAGEMENT_RETRIES ? parseInt(process.env.AGILITY_MANAGEMENT_RETRIES) : undefined,
  });
}

export function createManagementClient() {
  const config = getManagementConfig();
  return new mgmtApi.ApiClient({
    token: config.token,
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    retries: config.retries,
  });
}
```

### **Client Factory with Caching**

```typescript
// lib/management-client.ts
let cachedClient: mgmtApi.ApiClient | null = null;

export function getManagementClient(): mgmtApi.ApiClient {
  if (!cachedClient) {
    cachedClient = createManagementClient();
  }
  return cachedClient;
}

export function resetManagementClient(): void {
  cachedClient = null;
}
```

---

## 🔍 **Error Handling**

### **Common Error Patterns**

```typescript
// Error handling wrapper
async function safeApiCall<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    
    // Handle specific error types
    if (error.response?.status === 401) {
      throw new Error('Invalid management API token');
    } else if (error.response?.status === 404) {
      console.warn(`${operationName}: Resource not found`);
      return null;
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    
    throw error;
  }
}

// Usage
const model = await safeApiCall(
  () => apiClient.modelMethods.getModelByReferenceName('blog-posts', guid),
  'Get blog post model'
);
```

### **Retry Logic**

```typescript
// Retry wrapper for transient failures
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
}
```

---

## 🔗 **Related Documentation**

- [Content Operations](./content-operations.md) - Content management
- [Model Management](./model-management.md) - Content model operations
- [Container Management](./container-management.md) - Container operations
- [Asset Management](./asset-management.md) - Media operations
- [Page Management](./page-management.md) - Page and sitemap operations 
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

### **Prerequisites**

Before using the Management SDK, you must authenticate against the Agility Management API to obtain a valid access token. This token is required for all subsequent API requests.

### **OAuth 2.0 Authentication Flow**

The authentication process uses OAuth 2.0 and requires multiple steps:

#### **Step 1: Initiate Authorization Flow**

```typescript
// Authorization endpoint
const authUrl = 'https://mgmt.aglty.io/oauth/authorize';

// For offline access using refresh tokens, use this URL:
// const authUrl = 'https://mgmt.aglty.io/oauth/authorize?scope=offline-access';

const params = new URLSearchParams({
  response_type: 'code',
  redirect_uri: 'YOUR_REDIRECT_URI',
  state: 'YOUR_STATE',
  scope: 'openid profile email offline_access'
});

// Redirect the user to the authorization URL
window.location.href = `${authUrl}?${params.toString()}`;
```

#### **Step 2: Exchange Authorization Code for Access Token**

After successful authentication, you'll receive an authorization code at your redirect URI. Use this code to obtain an access token:

```typescript
const response = await fetch('https://mgmt.aglty.io/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    code: 'YOUR_AUTHORIZATION_CODE'
  })
});

const { access_token, refresh_token, expires_in } = await response.json();
```

#### **Step 3: Initialize SDK with Access Token**

```typescript
import * as mgmtApi from "@agility/management-sdk";

// Initialize the Options Class with your authentication token
let options = new mgmtApi.Options();
options.token = access_token; // Use the token obtained from authentication

// Initialize the APIClient Class
let apiClient = new mgmtApi.ApiClient(options);

let guid = "<<Provide the Guid of the Website>>";
let locale = "<<Provide the locale of the Website>>"; // Example: en-us

// Now you can make authenticated requests
var contentItem = await apiClient.contentMethods.getContentItem(22, guid, locale);
console.log(JSON.stringify(contentItem));
```

#### **Step 4: Refresh Token When Expired**

When the access token expires, use the refresh token to obtain a new access token:

```typescript
const response = await fetch('https://mgmt.aglty.io/oauth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refresh_token: 'YOUR_REFRESH_TOKEN'
  })
});

const { access_token, refresh_token, expires_in } = await response.json();

// Update your API client with the new token
options.token = access_token;
apiClient = new mgmtApi.ApiClient(options);
```

### **Environment Variables Setup**

For production applications, store your tokens securely:

```typescript
// Environment variables
AGILITY_MANAGEMENT_TOKEN=your-access-token
AGILITY_REFRESH_TOKEN=your-refresh-token
AGILITY_GUID=your-instance-guid
```

### **Token Management Helper**

```typescript
// lib/token-manager.ts
interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
}

class TokenManager {
  private tokenData: TokenData | null = null;

  async getValidToken(): Promise<string> {
    if (!this.tokenData || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.tokenData!.access_token;
  }

  private isTokenExpired(): boolean {
    if (!this.tokenData) return true;
    return Date.now() >= this.tokenData.expires_at;
  }

  private async refreshToken(): Promise<void> {
    const response = await fetch('https://mgmt.aglty.io/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: process.env.AGILITY_REFRESH_TOKEN
      })
    });

    const tokenData = await response.json();
    this.tokenData = {
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    };
  }
}

export const tokenManager = new TokenManager();
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

### **Important Notes**

- The access token has a limited lifetime (typically 1 hour)
- Always store refresh tokens securely
- Use HTTPS for all redirect URIs in production
- The `state` parameter should be used to prevent CSRF attacks
- Tokens should never be exposed in client-side code

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
import { tokenManager } from './token-manager';

const managementConfigSchema = z.object({
  token: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
  guid: z.string().min(1),
  baseUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().min(0).optional(),
});

export function getManagementConfig() {
  return managementConfigSchema.parse({
    token: process.env.AGILITY_MANAGEMENT_TOKEN,
    refreshToken: process.env.AGILITY_REFRESH_TOKEN,
    guid: process.env.AGILITY_GUID,
    baseUrl: process.env.AGILITY_MANAGEMENT_BASE_URL,
    timeout: process.env.AGILITY_MANAGEMENT_TIMEOUT ? parseInt(process.env.AGILITY_MANAGEMENT_TIMEOUT) : undefined,
    retries: process.env.AGILITY_MANAGEMENT_RETRIES ? parseInt(process.env.AGILITY_MANAGEMENT_RETRIES) : undefined,
  });
}

export async function createManagementClient() {
  const config = getManagementConfig();
  
  // Use token manager if refresh token is available, otherwise use direct token
  const token = config.refreshToken 
    ? await tokenManager.getValidToken()
    : config.token;
    
  if (!token) {
    throw new Error('No access token available. Please complete the OAuth authentication flow.');
  }
  
  return new mgmtApi.ApiClient({
    token: token,
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    retries: config.retries,
  });
}

export async function createManagementClientFromOptions(options: mgmtApi.Options) {
  return new mgmtApi.ApiClient(options);
}
```

### **Client Factory with Caching**

```typescript
// lib/management-client.ts
let cachedClient: mgmtApi.ApiClient | null = null;
let tokenExpiry: number = 0;

export async function getManagementClient(): Promise<mgmtApi.ApiClient> {
  // Reset cache if token has expired or is about to expire (within 5 minutes)
  if (cachedClient && Date.now() >= tokenExpiry - 300000) {
    cachedClient = null;
  }
  
  if (!cachedClient) {
    cachedClient = await createManagementClient();
    // Assume token is valid for 1 hour (default OAuth token lifetime)
    tokenExpiry = Date.now() + 3600000;
  }
  return cachedClient;
}

export function resetManagementClient(): void {
  cachedClient = null;
  tokenExpiry = 0;
}

// Alternative: Create client directly from OAuth response
export async function createClientFromOAuthResponse(tokenResponse: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}): Promise<mgmtApi.ApiClient> {
  const options = new mgmtApi.Options();
  options.token = tokenResponse.access_token;
  
  return new mgmtApi.ApiClient(options);
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
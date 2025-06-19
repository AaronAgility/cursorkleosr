# Sync SDK - Client Setup

This guide covers the initialization and configuration of the Agility Content Sync SDK for build-time content synchronization.

---

## 📦 **SDK Installation & Import**

### **Installation**

```bash
npm install @agility/content-sync
```

### **Import Pattern**

```typescript
import * as agilitySync from "@agility/content-sync";
```

---

## 🔧 **Sync Client Initialization**

### **Basic Configuration**

```typescript
const syncClient = agilitySync.getSyncClient({
  guid: process.env.AGILITY_GUID!,
  apiKey: process.env.AGILITY_SYNC_KEY!,
  languages: ['en-us'],
  channels: ['website'],
  isPreview: false,
  store: {
    interface: storeInterfaceFileSystem,
    options: {
      rootPath: 'agility-files',
      forceOverwrite: false
    }
  }
});
```

### **Configuration Options**

```typescript
interface SyncClientConfig {
  guid: string;           // Instance GUID
  apiKey: string;         // Sync API key
  languages: string[];    // Locale codes
  channels: string[];     // Channel names
  isPreview: boolean;     // Preview vs live content
  store: {
    interface: StoreInterface;
    options: StoreOptions;
  };
}
```

---

## 🗄️ **Store Interface**

### **File System Store**

```typescript
import { storeInterfaceFileSystem } from './store-interface-filesystem';

const storeOptions = {
  rootPath: 'agility-content',
  forceOverwrite: false
};

const syncClient = agilitySync.getSyncClient({
  // ... other config
  store: {
    interface: storeInterfaceFileSystem,
    options: storeOptions
  }
});
```

### **Custom Store Interface**

```typescript
interface StoreInterface {
  saveItem(params: SaveItemParams): Promise<void>;
  getItem(params: GetItemParams): Promise<any | null>;
  deleteItem(params: DeleteItemParams): Promise<void>;
  mergeItemToList(params: MergeItemParams): Promise<void>;
  clearItems(params: ClearItemsParams): Promise<void>;
  mutexLock(): Promise<any>;
}
```

---

## 🔄 **Running Sync**

### **Basic Sync Operation**

```typescript
// Execute full content synchronization
const syncResult = await syncClient.runSync();
console.log('Sync completed successfully');
```

### **Sync with Progress Tracking**

```typescript
async function syncWithProgress() {
  console.log('Starting content sync...');
  
  try {
    await syncClient.runSync();
    
    // Get sync statistics
    const stats = storeInterfaceFileSystem.getAndClearSavedItemStats();
    
    stats.forEach(stat => {
      console.log(`✓ Synced ${stat.itemType} (ID: ${stat.itemID})`);
    });
    
    console.log('✅ Sync completed successfully');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}
```

---

## 📁 **File Organization**

### **Directory Structure**

```
agility-files/
├── {guid}/
│   ├── {locale}/
│   │   ├── preview/
│   │   │   ├── item/         # Individual content items
│   │   │   ├── list/         # Content lists
│   │   │   ├── page/         # Page definitions
│   │   │   ├── sitemap/      # Site structure
│   │   │   └── state/        # Sync state
│   │   └── live/
│   │       └── [same structure]
```

### **Content Access**

```typescript
// Read synced content
const fs = require('fs');
const path = require('path');

function getContentItem(contentID: number, locale: string, isPreview: boolean) {
  const mode = isPreview ? 'preview' : 'live';
  const filePath = path.join(
    'agility-files',
    process.env.AGILITY_GUID!,
    locale,
    mode,
    'item',
    `${contentID}.json`
  );
  
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  return null;
}

function getContentList(referenceName: string, locale: string, isPreview: boolean) {
  const mode = isPreview ? 'preview' : 'live';
  const filePath = path.join(
    'agility-files',
    process.env.AGILITY_GUID!,
    locale,
    mode,
    'list',
    `${referenceName}.json`
  );
  
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  return { items: [], totalCount: 0 };
}
```

---

## 🔗 **Related Documentation**

- [Sync Operations](./sync-operations.md) - Content synchronization
- [File System Store](./file-system-store.md) - Storage implementation
- [Content Access](./content-access.md) - Reading synced content 
# Management SDK - Asset Management

This guide covers media and asset operations using the Agility Management SDK, including uploading, organizing, and managing digital assets.

---

## 📁 **Asset Operations**

### **Get Media List**

```typescript
// Get paginated media list
const mediaList = await apiClient.assetMethods.getMediaList(
  50,   // pageSize
  0,    // recordOffset
  guid  // instance GUID
);

console.log('Total media items:', mediaList.length);
mediaList.forEach(media => {
  console.log(`- ${media.fileName} (${media.size} bytes)`);
});
```

### **Get Asset by URL**

```typescript
// Find asset by URL
const asset = await apiClient.assetMethods.getAssetByUrl(
  'https://cdn.aglty.io/your-guid/media/image.jpg',
  guid
);

if (asset) {
  console.log('Found asset:', asset.fileName);
}
```

---

## ⬆️ **File Upload**

### **Basic File Upload**

```typescript
const FormData = require('form-data');
const fs = require('fs');

// Create form data
const form = new FormData();
form.append('files', fs.createReadStream('path/to/image.jpg'), 'image.jpg');

// Upload to default folder
const uploadedAssets = await apiClient.assetMethods.upload(
  form,
  '',    // folderPath (empty for root)
  guid,
  -1     // galleryId (-1 for no gallery)
);

console.log('Uploaded assets:', uploadedAssets);
```

### **Upload to Specific Folder**

```typescript
// Upload to organized folder structure
const form = new FormData();
form.append('files', fs.createReadStream('hero-image.jpg'), 'hero-image.jpg');

const uploadedAssets = await apiClient.assetMethods.upload(
  form,
  'images/heroes', // Organized folder path
  guid,
  -1
);

const uploadedAsset = uploadedAssets[0];
console.log('Asset URL:', uploadedAsset.url);
console.log('Media ID:', uploadedAsset.mediaID);
```

---

## 🗂️ **Gallery Management**

### **Get Galleries**

```typescript
// Get all galleries
const galleries = await apiClient.assetMethods.getGalleries(
  guid,
  '',     // searchTerm
  50,     // pageSize
  0       // rowIndex
);

galleries.forEach(gallery => {
  console.log(`Gallery: ${gallery.galleryName} (${gallery.mediaCount} items)`);
});
```

### **Get Gallery by Name**

```typescript
// Find specific gallery
const gallery = await apiClient.assetMethods.getGalleryByName(
  guid,
  'Product Images'
);

if (gallery) {
  console.log('Gallery ID:', gallery.galleryID);
  console.log('Media count:', gallery.mediaCount);
}
```

---

## 🗑️ **Asset Deletion**

### **Delete File**

```typescript
// Delete asset by media ID
await apiClient.assetMethods.deleteFile(mediaId, guid);
console.log('Asset deleted successfully');
```

### **Delete Folder**

```typescript
// Delete entire folder
await apiClient.assetMethods.deleteFolder(
  'images/old-folder', // originKey (folder path)
  guid,
  null // mediaId (null for folder deletion)
);
console.log('Folder deleted successfully');
```

---

## 🔧 **Advanced Asset Operations**

### **Bulk Upload**

```typescript
async function uploadMultipleFiles(
  filePaths: string[],
  folderPath: string,
  guid: string
) {
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const form = new FormData();
      const fileName = path.basename(filePath);
      form.append('files', fs.createReadStream(filePath), fileName);
      
      const uploadedAssets = await apiClient.assetMethods.upload(
        form,
        folderPath,
        guid,
        -1
      );
      
      results.push({
        success: true,
        fileName,
        asset: uploadedAssets[0]
      });
    } catch (error) {
      results.push({
        success: false,
        fileName: path.basename(filePath),
        error: error.message
      });
    }
  }
  
  return results;
}
```

### **Asset Organization**

```typescript
// Organize assets by type and date
async function organizeAssetUpload(
  filePath: string,
  guid: string
) {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName).toLowerCase();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Determine folder based on file type
  let folderPath = '';
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExt)) {
    folderPath = `images/${year}/${month}`;
  } else if (['.pdf', '.doc', '.docx'].includes(fileExt)) {
    folderPath = `documents/${year}/${month}`;
  } else if (['.mp4', '.mov', '.avi'].includes(fileExt)) {
    folderPath = `videos/${year}/${month}`;
  } else {
    folderPath = `other/${year}/${month}`;
  }
  
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath), fileName);
  
  return await apiClient.assetMethods.upload(form, folderPath, guid, -1);
}
```

---

## 🔗 **Related Documentation**

- [API Client Setup](./api-client-setup.md) - Client initialization
- [Content Operations](./content-operations.md) - Using assets in content 
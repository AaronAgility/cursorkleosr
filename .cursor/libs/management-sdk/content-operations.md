# Management SDK - Content Operations

This guide covers content item CRUD operations using the Agility Management SDK, including creating, reading, updating, and deleting content items.

---

## 📝 **Content Item Structure**

### **Basic Content Payload**

```typescript
interface ContentItemPayload {
  contentID: number;        // -1 for new, existing ID for updates
  properties: {
    definitionName: string;
    referenceName: string;
    itemOrder?: number;
  };
  fields: { [key: string]: any };
  seo?: mgmtApi.SeoProperties;
  scripts?: mgmtApi.ContentScripts;
}
```

---

## 🔍 **Reading Content**

### **Get Single Content Item**

```typescript
// Get content by ID
const content = await apiClient.contentMethods.getContentItem(
  contentId,  // Content ID
  guid,       // Instance GUID
  locale      // Locale (e.g., 'en-us')
);

console.log('Content title:', content.fields.title);
console.log('Content properties:', content.properties);
```

### **Get Content List**

```typescript
// Get all content from a container
const contentList = await apiClient.contentMethods.getContentList(
  'posts',    // Container reference name
  guid,       // Instance GUID
  locale,     // Locale
  null        // Additional filters (optional)
);

console.log('Total items:', contentList.length);
contentList.forEach(item => {
  console.log(`- ${item.fields.title} (ID: ${item.contentID})`);
});
```

---

## ✏️ **Creating Content**

### **Basic Content Creation**

```typescript
const newBlogPost = {
  contentID: -1, // -1 indicates new content
  properties: {
    definitionName: 'BlogPost',
    referenceName: 'blog-posts'
  },
  fields: {
    title: 'My First Blog Post',
    content: '<p>This is the content of my blog post.</p>',
    publishDate: new Date().toISOString(),
    featured: false
  }
};

const contentID = await apiClient.contentMethods.saveContentItem(
  newBlogPost,
  guid,
  locale
);

console.log('Created content with ID:', contentID);
```

### **Content with Media**

```typescript
// First upload an image
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('files', fs.createReadStream('path/to/image.jpg'), 'image.jpg');

const uploadedMedia = await apiClient.assetMethods.upload(
  form,
  'blog-images', // Folder path
  guid,
  -1 // No gallery
);

// Then create content with the image
const contentWithImage = {
  contentID: -1,
  properties: {
    definitionName: 'BlogPost',
    referenceName: 'blog-posts'
  },
  fields: {
    title: 'Post with Image',
    content: '<p>This post has a featured image.</p>',
    featuredImage: {
      mediaID: uploadedMedia[0].mediaID,
      url: uploadedMedia[0].url,
      label: uploadedMedia[0].fileName
    }
  }
};

const contentID = await apiClient.contentMethods.saveContentItem(
  contentWithImage,
  guid,
  locale
);
```

---

## 🔄 **Updating Content**

### **Update Existing Content**

```typescript
// Get existing content
const existingContent = await apiClient.contentMethods.getContentItem(
  contentId,
  guid,
  locale
);

// Modify fields
existingContent.fields.title = 'Updated Title';
existingContent.fields.content = '<p>Updated content here.</p>';
existingContent.fields.lastModified = new Date().toISOString();

// Save updates
const updatedContentID = await apiClient.contentMethods.saveContentItem(
  existingContent,
  guid,
  locale
);

console.log('Updated content ID:', updatedContentID);
```

### **Partial Updates**

```typescript
// Update only specific fields
async function updateContentFields(
  contentId: number,
  updates: Record<string, any>,
  guid: string,
  locale: string
) {
  const content = await apiClient.contentMethods.getContentItem(contentId, guid, locale);
  
  // Apply updates
  Object.assign(content.fields, updates);
  
  // Save
  return await apiClient.contentMethods.saveContentItem(content, guid, locale);
}

// Usage
await updateContentFields(123, {
  title: 'New Title',
  featured: true
}, guid, locale);
```

---

## 🗑️ **Deleting Content**

### **Delete Content Item**

```typescript
// Delete by content ID
await apiClient.contentMethods.deleteContent(contentId, guid, locale);
console.log('Content deleted successfully');
```

### **Safe Delete with Validation**

```typescript
async function safeDeleteContent(contentId: number, guid: string, locale: string) {
  try {
    // Check if content exists
    const content = await apiClient.contentMethods.getContentItem(contentId, guid, locale);
    if (!content) {
      console.log('Content not found');
      return false;
    }
    
    // Perform delete
    await apiClient.contentMethods.deleteContent(contentId, guid, locale);
    console.log(`Deleted content: ${content.fields.title}`);
    return true;
  } catch (error) {
    console.error('Error deleting content:', error);
    return false;
  }
}
```

---

## 🔧 **Advanced Operations**

### **Bulk Content Creation**

```typescript
async function createBulkContent(
  contentItems: any[],
  guid: string,
  locale: string
) {
  const results = [];
  
  for (const item of contentItems) {
    try {
      const contentID = await apiClient.contentMethods.saveContentItem(
        item,
        guid,
        locale
      );
      results.push({ success: true, contentID, title: item.fields.title });
    } catch (error) {
      results.push({ success: false, error: error.message, title: item.fields.title });
    }
  }
  
  return results;
}

// Usage
const bulkContent = [
  {
    contentID: -1,
    properties: { definitionName: 'BlogPost', referenceName: 'blog-posts' },
    fields: { title: 'Post 1', content: 'Content 1' }
  },
  {
    contentID: -1,
    properties: { definitionName: 'BlogPost', referenceName: 'blog-posts' },
    fields: { title: 'Post 2', content: 'Content 2' }
  }
];

const results = await createBulkContent(bulkContent, guid, locale);
console.log('Bulk creation results:', results);
```

### **Content Migration**

```typescript
async function migrateContent(
  sourceGuid: string,
  targetGuid: string,
  locale: string,
  containerName: string
) {
  // Get content from source
  const sourceContent = await apiClient.contentMethods.getContentList(
    containerName,
    sourceGuid,
    locale,
    null
  );
  
  // Migrate to target
  const migrationResults = [];
  
  for (const item of sourceContent) {
    // Reset ID for new content
    item.contentID = -1;
    
    try {
      const newContentID = await apiClient.contentMethods.saveContentItem(
        item,
        targetGuid,
        locale
      );
      
      migrationResults.push({
        originalID: item.contentID,
        newID: newContentID,
        title: item.fields.title,
        success: true
      });
    } catch (error) {
      migrationResults.push({
        originalID: item.contentID,
        title: item.fields.title,
        success: false,
        error: error.message
      });
    }
  }
  
  return migrationResults;
}
```

---

## 🎯 **SEO & Metadata**

### **Adding SEO Properties**

```typescript
const contentWithSEO = {
  contentID: -1,
  properties: {
    definitionName: 'BlogPost',
    referenceName: 'blog-posts'
  },
  fields: {
    title: 'SEO Optimized Post',
    content: '<p>This post has SEO metadata.</p>'
  },
  seo: {
    metaDescription: 'This is a great blog post about SEO optimization.',
    metaKeywords: 'seo, blog, optimization',
    metaHTML: '<meta name="robots" content="index,follow">'
  }
};

const contentID = await apiClient.contentMethods.saveContentItem(
  contentWithSEO,
  guid,
  locale
);
```

### **Content Scripts**

```typescript
const contentWithScripts = {
  contentID: -1,
  properties: {
    definitionName: 'BlogPost',
    referenceName: 'blog-posts'
  },
  fields: {
    title: 'Post with Custom Scripts',
    content: '<p>This post has custom scripts.</p>'
  },
  scripts: {
    excludeFromOutputCache: false,
    top: '<script>console.log("Top script");</script>',
    bottom: '<script>console.log("Bottom script");</script>'
  }
};
```

---

## 🔍 **Error Handling**

### **Content Save Error Handling**

```typescript
async function saveContentWithErrorHandling(
  content: any,
  guid: string,
  locale: string
) {
  try {
    const result = await apiClient.contentMethods.saveContentItem(content, guid, locale);
    
    // Check if result is an error object
    if (typeof result === 'object' && result.error) {
      throw new Error(result.error);
    }
    
    return result; // Content ID on success
  } catch (error) {
    console.error('Content save failed:', error);
    
    // Handle specific error types
    if (error.message.includes('validation')) {
      throw new Error('Content validation failed');
    } else if (error.message.includes('permission')) {
      throw new Error('Insufficient permissions');
    }
    
    throw error;
  }
}
```

---

## 🔗 **Related Documentation**

- [API Client Setup](./api-client-setup.md) - Client initialization
- [Model Management](./model-management.md) - Content model operations
- [Container Management](./container-management.md) - Container operations
- [Asset Management](./asset-management.md) - Media operations 
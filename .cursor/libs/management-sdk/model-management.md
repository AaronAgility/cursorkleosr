# Management SDK - Model Management

This guide covers content model operations using the Agility Management SDK, including creating, updating, and managing content models.

---

## 📋 **Model Types**

### **Content Models vs Page Models**

```typescript
// Content Models - for content items
const contentModels = await apiClient.modelMethods.getContentModules(true, guid, false);

// Page Models - for page components/modules
const pageModels = await apiClient.modelMethods.getPageModules(true, guid);
```

---

## 🔍 **Retrieving Models**

### **Get All Models (Summary)**

```typescript
// Get content model summaries
const contentModels = await apiClient.modelMethods.getContentModules(
  true,  // includeShared
  guid,  // instance GUID
  false  // includeDeleted
);

// Get page model summaries
const pageModels = await apiClient.modelMethods.getPageModules(
  true,  // includeShared
  guid   // instance GUID
);
```

### **Get Model Details**

```typescript
// Get full model with field definitions
const modelDetails = await apiClient.modelMethods.getContentModel(modelId, guid);

console.log('Model fields:', modelDetails.fields);
console.log('Model settings:', modelDetails.settings);
```

### **Get Model by Reference Name**

```typescript
// Primary method for finding existing models
const model = await apiClient.modelMethods.getModelByReferenceName('blog-posts', guid);

if (model) {
  console.log('Found model:', model.displayName);
} else {
  console.log('Model not found');
}
```

---

## 🔧 **Creating Models**

### **Basic Content Model**

```typescript
const blogPostModel = {
  id: -1, // -1 for new models
  displayName: 'Blog Post',
  referenceName: 'blog-posts',
  description: 'Blog post content model',
  fields: [
    {
      name: 'Title',
      referenceName: 'title',
      type: 'text',
      required: true,
      settings: {
        maxLength: 200
      }
    },
    {
      name: 'Content',
      referenceName: 'content',
      type: 'html',
      required: true,
      settings: {
        toolbar: 'full'
      }
    },
    {
      name: 'Featured Image',
      referenceName: 'featuredImage',
      type: 'image',
      required: false
    },
    {
      name: 'Publish Date',
      referenceName: 'publishDate',
      type: 'date',
      required: true
    }
  ]
};

const savedModel = await apiClient.modelMethods.saveModel(blogPostModel, guid);
console.log('Created model with ID:', savedModel.id);
```

### **Advanced Field Types**

```typescript
const advancedModel = {
  id: -1,
  displayName: 'Advanced Content',
  referenceName: 'advanced-content',
  fields: [
    // Rich text with custom toolbar
    {
      name: 'Rich Content',
      referenceName: 'richContent',
      type: 'html',
      settings: {
        toolbar: 'basic',
        allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li']
      }
    },
    
    // Number field with validation
    {
      name: 'Price',
      referenceName: 'price',
      type: 'number',
      settings: {
        min: 0,
        max: 10000,
        decimalPlaces: 2
      }
    },
    
    // Choice field (dropdown)
    {
      name: 'Category',
      referenceName: 'category',
      type: 'choice',
      required: true,
      settings: {
        choices: [
          { value: 'technology', label: 'Technology' },
          { value: 'business', label: 'Business' },
          { value: 'lifestyle', label: 'Lifestyle' }
        ]
      }
    },
    
    // Boolean field
    {
      name: 'Featured',
      referenceName: 'featured',
      type: 'boolean',
      defaultValue: false
    },
    
    // Content reference
    {
      name: 'Related Posts',
      referenceName: 'relatedPosts',
      type: 'contentreference',
      settings: {
        contentDefinitionReferenceName: 'blog-posts',
        multiple: true,
        maxItems: 5
      }
    }
  ]
};
```

---

## ✏️ **Updating Models**

### **Update Existing Model**

```typescript
// Get existing model
const existingModel = await apiClient.modelMethods.getModelByReferenceName('blog-posts', guid);

if (existingModel) {
  // Add new field
  existingModel.fields.push({
    name: 'Tags',
    referenceName: 'tags',
    type: 'text',
    settings: {
      maxLength: 500
    }
  });
  
  // Update the model
  const updatedModel = await apiClient.modelMethods.saveModel(existingModel, guid);
  console.log('Updated model:', updatedModel.displayName);
}
```

### **Field Modification Patterns**

```typescript
// Find and update specific field
const model = await apiClient.modelMethods.getContentModel(modelId, guid);

const titleField = model.fields.find(f => f.referenceName === 'title');
if (titleField) {
  titleField.settings.maxLength = 300;
  titleField.required = true;
}

// Save updated model
await apiClient.modelMethods.saveModel(model, guid);
```

---

## 🗑️ **Deleting Models**

### **Delete Model**

```typescript
// Delete by model ID
await apiClient.modelMethods.deleteModel(modelId, guid);
console.log('Model deleted successfully');
```

### **Safe Delete with Validation**

```typescript
async function safeDeleteModel(modelId: number, guid: string) {
  try {
    // Check if model exists
    const model = await apiClient.modelMethods.getContentModel(modelId, guid);
    if (!model) {
      console.log('Model not found');
      return;
    }
    
    // Check for dependent containers
    const containers = await apiClient.containerMethods.getContainerList(guid);
    const dependentContainers = containers.filter(c => c.contentDefinitionID === modelId);
    
    if (dependentContainers.length > 0) {
      console.warn('Cannot delete model - containers depend on it:', 
        dependentContainers.map(c => c.referenceName));
      return;
    }
    
    // Safe to delete
    await apiClient.modelMethods.deleteModel(modelId, guid);
    console.log('Model deleted successfully');
  } catch (error) {
    console.error('Error deleting model:', error);
  }
}
```

---

## 🔧 **Field Type Reference**

### **Common Field Types**

```typescript
// Text field
{
  name: 'Title',
  referenceName: 'title',
  type: 'text',
  settings: {
    maxLength: 200,
    placeholder: 'Enter title...'
  }
}

// HTML/Rich text
{
  name: 'Content',
  referenceName: 'content',
  type: 'html',
  settings: {
    toolbar: 'full' | 'basic' | 'minimal'
  }
}

// Image field
{
  name: 'Image',
  referenceName: 'image',
  type: 'image',
  settings: {
    maxWidth: 1920,
    maxHeight: 1080,
    allowedTypes: ['jpg', 'png', 'webp']
  }
}

// Date field
{
  name: 'Date',
  referenceName: 'date',
  type: 'date',
  settings: {
    includeTime: true,
    format: 'MM/DD/YYYY'
  }
}

// Number field
{
  name: 'Price',
  referenceName: 'price',
  type: 'number',
  settings: {
    min: 0,
    max: 99999,
    decimalPlaces: 2
  }
}
```

---

## 🎯 **Best Practices**

### **Model Design Principles**

```typescript
// ✅ Good: Clear, descriptive names
const goodModel = {
  displayName: 'Blog Post',
  referenceName: 'blog-posts', // kebab-case
  fields: [
    {
      name: 'Title',
      referenceName: 'title', // camelCase for fields
      type: 'text'
    }
  ]
};

// ❌ Avoid: Unclear or inconsistent naming
const badModel = {
  displayName: 'BP',
  referenceName: 'BlogPost', // Inconsistent casing
  fields: [
    {
      name: 'T',
      referenceName: 'Title', // Inconsistent casing
      type: 'text'
    }
  ]
};
```

### **Field Validation**

```typescript
// Validate model before saving
function validateModel(model: any): string[] {
  const errors: string[] = [];
  
  if (!model.displayName) {
    errors.push('Display name is required');
  }
  
  if (!model.referenceName) {
    errors.push('Reference name is required');
  }
  
  if (!model.fields || model.fields.length === 0) {
    errors.push('At least one field is required');
  }
  
  model.fields?.forEach((field: any, index: number) => {
    if (!field.name) {
      errors.push(`Field ${index + 1}: Name is required`);
    }
    if (!field.referenceName) {
      errors.push(`Field ${index + 1}: Reference name is required`);
    }
    if (!field.type) {
      errors.push(`Field ${index + 1}: Type is required`);
    }
  });
  
  return errors;
}
```

---

## 🔗 **Related Documentation**

- [API Client Setup](./api-client-setup.md) - Client initialization
- [Container Management](./container-management.md) - Content containers
- [Content Operations](./content-operations.md) - Content management
- [Asset Management](./asset-management.md) - Media operations 
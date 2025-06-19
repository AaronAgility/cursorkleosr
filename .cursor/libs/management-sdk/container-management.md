# Management SDK - Container Management

This guide covers container operations using the Agility Management SDK, including creating, managing, and organizing content containers (content lists).

---

## 📋 **Container Concepts**

### **What are Containers?**

Containers (also called Content Views) are collections that hold content items of a specific model type. They act as the "lists" that organize your content.

```typescript
// Container links content model to content items
Content Model (blog-posts) → Container (posts) → Content Items
```

---

## 🔍 **Reading Containers**

### **Get All Containers**

```typescript
// Get list of all containers
const containers = await apiClient.containerMethods.getContainerList(guid);

containers.forEach(container => {
  console.log(`Container: ${container.referenceName}`);
  console.log(`- Model ID: ${container.contentDefinitionID}`);
  console.log(`- Container ID: ${container.contentViewID}`);
});
```

### **Get Container by ID**

```typescript
// Get specific container by ID
const container = await apiClient.containerMethods.getContainerByID(
  contentViewID, // Container ID
  guid          // Instance GUID
);

console.log('Container details:', container);
```

### **Get Container by Reference Name**

```typescript
// Primary method for finding containers
const container = await apiClient.containerMethods.getContainerByReferenceName(
  'posts', // Container reference name
  guid     // Instance GUID
);

if (container) {
  console.log('Found container:', container.referenceName);
} else {
  console.log('Container not found');
}
```

---

## ✏️ **Creating Containers**

### **Basic Container Creation**

```typescript
// First, get the content model
const model = await apiClient.modelMethods.getModelByReferenceName('blog-posts', guid);

if (!model) {
  throw new Error('Content model not found');
}

// Create container payload
const containerPayload = {
  contentViewID: -1, // -1 for new containers
  referenceName: 'posts',
  contentDefinitionID: model.id, // Link to model
  contentDefinitionType: 1,      // Content type
  contentDefinitionTypeID: model.id
};

// Save container
const savedContainer = await apiClient.containerMethods.saveContainer(
  containerPayload,
  guid,
  false // forceReferenceName
);

console.log('Created container:', savedContainer.referenceName);
```

### **Container with Custom Settings**

```typescript
const advancedContainer = {
  contentViewID: -1,
  referenceName: 'featured-posts',
  contentDefinitionID: model.id,
  contentDefinitionType: 1,
  contentDefinitionTypeID: model.id,
  settings: {
    defaultSort: 'publishDate',
    defaultSortDirection: 'desc',
    itemsPerPage: 10
  }
};

const container = await apiClient.containerMethods.saveContainer(
  advancedContainer,
  guid,
  true // Force specific reference name
);
```

---

## 🔄 **Updating Containers**

### **Update Container Properties**

```typescript
// Get existing container
const existingContainer = await apiClient.containerMethods.getContainerByReferenceName(
  'posts',
  guid
);

if (existingContainer) {
  // Update properties
  existingContainer.displayName = 'Updated Posts Container';
  existingContainer.description = 'Updated description';
  
  // Save updates
  const updatedContainer = await apiClient.containerMethods.saveContainer(
    existingContainer,
    guid,
    false
  );
  
  console.log('Updated container:', updatedContainer.referenceName);
}
```

### **Change Container Model**

```typescript
// Get new model
const newModel = await apiClient.modelMethods.getModelByReferenceName('articles', guid);

// Update container to use new model
existingContainer.contentDefinitionID = newModel.id;
existingContainer.contentDefinitionTypeID = newModel.id;

// Save changes
await apiClient.containerMethods.saveContainer(existingContainer, guid, false);

console.log('Container now uses new model');
```

---

## 🗑️ **Deleting Containers**

### **Delete Container**

```typescript
// Delete by container ID
await apiClient.containerMethods.deleteContainer(contentViewID, guid);
console.log('Container deleted successfully');
```

### **Safe Delete with Content Check**

```typescript
async function safeDeleteContainer(containerName: string, guid: string, locale: string) {
  try {
    // Get container
    const container = await apiClient.containerMethods.getContainerByReferenceName(
      containerName,
      guid
    );
    
    if (!container) {
      console.log('Container not found');
      return false;
    }
    
    // Check for existing content
    const contentList = await apiClient.contentMethods.getContentList(
      containerName,
      guid,
      locale,
      null
    );
    
    if (contentList.length > 0) {
      console.warn(`Cannot delete container - contains ${contentList.length} content items`);
      return false;
    }
    
    // Safe to delete
    await apiClient.containerMethods.deleteContainer(container.contentViewID, guid);
    console.log('Container deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting container:', error);
    return false;
  }
}
```

---

## 🔧 **Advanced Container Operations**

### **Container Validation**

```typescript
function validateContainer(container: any): string[] {
  const errors: string[] = [];
  
  if (!container.referenceName) {
    errors.push('Reference name is required');
  }
  
  if (!container.contentDefinitionID || container.contentDefinitionID <= 0) {
    errors.push('Valid content definition ID is required');
  }
  
  // Check reference name format
  if (container.referenceName && !/^[a-z][a-z0-9-]*$/.test(container.referenceName)) {
    errors.push('Reference name must be lowercase, start with letter, and contain only letters, numbers, and hyphens');
  }
  
  return errors;
}

// Usage
const errors = validateContainer(containerPayload);
if (errors.length > 0) {
  console.error('Container validation failed:', errors);
} else {
  // Proceed with save
}
```

### **Container and Model Synchronization**

```typescript
async function createContainerForModel(
  modelReferenceName: string,
  containerReferenceName: string,
  guid: string
) {
  // Get the model
  const model = await apiClient.modelMethods.getModelByReferenceName(
    modelReferenceName,
    guid
  );
  
  if (!model) {
    throw new Error(`Model '${modelReferenceName}' not found`);
  }
  
  // Check if container already exists
  const existingContainer = await apiClient.containerMethods.getContainerByReferenceName(
    containerReferenceName,
    guid
  );
  
  if (existingContainer) {
    console.log('Container already exists:', existingContainer.referenceName);
    return existingContainer;
  }
  
  // Create new container
  const containerPayload = {
    contentViewID: -1,
    referenceName: containerReferenceName,
    contentDefinitionID: model.id,
    contentDefinitionType: 1,
    contentDefinitionTypeID: model.id
  };
  
  const container = await apiClient.containerMethods.saveContainer(
    containerPayload,
    guid,
    true
  );
  
  console.log(`Created container '${container.referenceName}' for model '${model.referenceName}'`);
  return container;
}
```

### **Bulk Container Operations**

```typescript
async function createMultipleContainers(
  containerConfigs: Array<{
    containerName: string;
    modelName: string;
  }>,
  guid: string
) {
  const results = [];
  
  for (const config of containerConfigs) {
    try {
      const container = await createContainerForModel(
        config.modelName,
        config.containerName,
        guid
      );
      
      results.push({
        success: true,
        containerName: config.containerName,
        modelName: config.modelName,
        containerID: container.contentViewID
      });
    } catch (error) {
      results.push({
        success: false,
        containerName: config.containerName,
        modelName: config.modelName,
        error: error.message
      });
    }
  }
  
  return results;
}

// Usage
const containerConfigs = [
  { containerName: 'posts', modelName: 'blog-posts' },
  { containerName: 'pages', modelName: 'static-pages' },
  { containerName: 'products', modelName: 'product-catalog' }
];

const results = await createMultipleContainers(containerConfigs, guid);
console.log('Container creation results:', results);
```

---

## 🎯 **Best Practices**

### **Naming Conventions**

```typescript
// ✅ Good: Clear, consistent naming
const goodContainerNames = [
  'blog-posts',      // Matches model name
  'featured-posts',  // Descriptive purpose
  'product-catalog', // Clear function
  'news-articles'    // Descriptive content
];

// ❌ Avoid: Unclear or inconsistent naming
const badContainerNames = [
  'container1',      // Not descriptive
  'BlogPosts',       // Inconsistent casing
  'posts_list',      // Mixed conventions
  'p'                // Too short
];
```

### **Container Organization**

```typescript
// Organize containers by purpose
const containerStructure = {
  content: ['posts', 'articles', 'news'],
  products: ['catalog', 'featured-products', 'categories'],
  pages: ['static-pages', 'landing-pages'],
  media: ['images', 'documents', 'videos']
};

// Create organized container hierarchy
async function createOrganizedContainers(guid: string) {
  for (const [category, containers] of Object.entries(containerStructure)) {
    console.log(`Creating ${category} containers...`);
    
    for (const containerName of containers) {
      // Implementation depends on your model structure
      await createContainerForModel(`${category}-model`, containerName, guid);
    }
  }
}
```

---

## 🔗 **Related Documentation**

- [API Client Setup](./api-client-setup.md) - Client initialization
- [Model Management](./model-management.md) - Content model operations
- [Content Operations](./content-operations.md) - Content management
- [Asset Management](./asset-management.md) - Media operations 
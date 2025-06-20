# Management SDK - Page Management

This guide covers page and page template operations using the Agility Management SDK, including creating, updating, publishing, and managing pages and templates.

---

## 📄 **Sitemap & Page Models**
Page Models are also referred to as Page Templates.  We will use the terminology interchangeable here.

### **Get Sitemap**

```typescript
// Get the sitemap for a website and locale
const sitemap = await apiClient.pageMethods.getSitemap(
  guid,   // instance GUID
  locale  // locale (e.g., 'en-us')
);
console.log('Sitemap:', sitemap);
```

### **Get All Page Models**

```typescript
// Get all page templates
const pageTemplates = await apiClient.pageMethods.getPageTemplates(
  guid,              // instance GUID
  locale,            // locale
  true,              // includeModuleZones
  ''                 // searchFilter (optional)
);
console.log('Page templates:', pageTemplates);
```

### **Get Page Model by ID**

```typescript
// Get a specific page template by ID
const pageTemplate = await apiClient.pageMethods.getPageTemplate(
  guid,
  locale,
  pageTemplateId     // template ID
);
console.log('Page template:', pageTemplate);
```

### **Get Page Model by Name**

```typescript
// Get a page template by name
const pageTemplateByName = await apiClient.pageMethods.getPageTemplateName(
  guid,
  locale,
  'Home Page'        // template name
);
console.log('Page template by name:', pageTemplateByName);
```

### **Delete Page Model**

```typescript
// Delete a page template by ID
await apiClient.pageMethods.deletePageTemplate(
  guid,
  locale,
  pageTemplateId
);
console.log('Page template deleted.');
```

### **Get Page Item Templates**
PageItemTemplate is the section where components can be added into a page model.

```typescript
// Get item templates for a page template
const itemTemplates = await apiClient.pageMethods.getPageItemTemplates(
  guid,
  locale,
  pageTemplateId
);
console.log('Item templates:', itemTemplates);
```

### **Save (Create/Update) Page Model**

```typescript
// Save (create or update) a page template
const savedPageTemplate = await apiClient.pageMethods.savePageTemplate(
  guid,
  locale,
  pageModel          // PageModel object
);
console.log('Saved page template:', savedPageTemplate);
```

---

## 📃 **Page Operations**

### **Get Page by ID**

```typescript
// Get a page by its ID
const page = await apiClient.pageMethods.getPage(
  pageID,  // page ID
  guid,
  locale
);
console.log('Page:', page);
```

### **Publish Page**

```typescript
// Publish a page
const publishedPageIDs = await apiClient.pageMethods.publishPage(
  pageID,
  guid,
  locale,
  'Publishing page'  // comments (optional)
);
console.log('Published page IDs:', publishedPageIDs);
```

### **Unpublish Page**

```typescript
// Unpublish a page
const unpublishedPageIDs = await apiClient.pageMethods.unPublishPage(
  pageID,
  guid,
  locale,
  'Unpublishing page' // comments (optional)
);
console.log('Unpublished page IDs:', unpublishedPageIDs);
```

### **Delete Page**

```typescript
// Delete a page
const deletedPageIDs = await apiClient.pageMethods.deletePage(
  pageID,
  guid,
  locale,
  'Deleting page'    // comments (optional)
);
console.log('Deleted page IDs:', deletedPageIDs);
```

### **Approve Page**

```typescript
// Approve a page
const approvedPageIDs = await apiClient.pageMethods.approvePage(
  pageID,
  guid,
  locale,
  'Approving page'   // comments (optional)
);
console.log('Approved page IDs:', approvedPageIDs);
```

### **Decline Page**

```typescript
// Decline a page
const declinedPageIDs = await apiClient.pageMethods.declinePage(
  pageID,
  guid,
  locale,
  'Declining page'   // comments (optional)
);
console.log('Declined page IDs:', declinedPageIDs);
```

### **Request Approval for Page**

```typescript
// Request approval for a page
const approvalRequestedPageIDs = await apiClient.pageMethods.pageRequestApproval(
  pageID,
  guid,
  locale,
  'Requesting approval' // comments (optional)
);
console.log('Approval requested for page IDs:', approvalRequestedPageIDs);
```

### **Save (Create/Update) Page**

```typescript
// Save (create or update) a page
const savedPageIDs = await apiClient.pageMethods.savePage(
  pageItem,              // PageItem object
  guid,
  locale,
  parentPageID,          // parent page ID (optional)
  placeBeforePageItemID  // place before page ID (optional)
);
console.log('Saved page IDs:', savedPageIDs);
```

---

## 🕓 **Page History**

### **Get Page History**

```typescript
// Get history for a page
const pageHistory = await apiClient.pageMethods.getPageHistory(
  locale,
  guid,
  pageID,
  50,   // take (number of items)
  0     // skip (offset)
);
console.log('Page history:', pageHistory);
```

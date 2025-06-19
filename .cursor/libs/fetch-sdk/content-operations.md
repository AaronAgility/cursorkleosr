# Agility CMS Fetch SDK - Content Operations

This document covers all content-related operations including content lists, individual items, filtering, sorting, and content relationships.

---

## 📋 **Content Lists**

### **Basic Content List**
```typescript
// Get a list of content items
const contentList = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us'
});

console.log(contentList.items);      // Array of content items
console.log(contentList.totalCount); // Total number of items
```

### **Paginated Content List**
```typescript
// Implement pagination
async function getPaginatedPosts(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;
  
  const result = await api.getContentList({
    referenceName: 'posts',
    languageCode: 'en-us',
    take: pageSize,
    skip: skip,
    sort: 'fields.date desc'
  });
  
  return {
    items: result.items,
    totalCount: result.totalCount,
    currentPage: page,
    totalPages: Math.ceil(result.totalCount / pageSize),
    hasMore: skip + pageSize < result.totalCount
  };
}

// Usage
const page1 = await getPaginatedPosts(1, 10);
const page2 = await getPaginatedPosts(2, 10);
```

### **Content List with Linked Content**
```typescript
// Expand linked content automatically
const postsWithAuthors = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  contentLinkDepth: 2,           // Expand 2 levels deep
  expandAllContentLinks: true,   // Expand all linked content
  take: 20
});

// Access linked content
postsWithAuthors.items.forEach(post => {
  console.log(post.fields.title);
  console.log(post.fields.author?.fields.name); // Linked author
  console.log(post.fields.category?.fields.title); // Linked category
});
```

---

## 🔍 **Filtering Content**

### **Basic Filters**
```typescript
// Filter by equality
const featuredPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: 'fields.featured eq true'
});

// Filter by category
const techPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.categoryID eq '123'"
});
```

### **Comparison Filters**
```typescript
// Date range filtering
const recentPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.publishDate gt '2023-01-01' and fields.publishDate lt '2024-01-01'"
});

// Numeric comparisons
const popularPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: 'fields.viewCount gt 1000'
});
```

### **String Operations**
```typescript
// String contains
const reactPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "contains(fields.title, 'React')"
});

// String starts with
const howToPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "startswith(fields.title, 'How to')"
});

// String ends with
const guidePosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "endswith(fields.title, 'Guide')"
});
```

### **Complex Filters**
```typescript
// Multiple conditions with AND
const complexFilter = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.featured eq true and fields.publishDate gt '2023-01-01' and fields.status eq 'published'"
});

// Multiple conditions with OR
const categoryFilter = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "(fields.categoryID eq '123' or fields.categoryID eq '456')"
});

// Nested conditions
const advancedFilter = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.featured eq true and (fields.category/fields.title eq 'Technology' or fields.category/fields.title eq 'Development')"
});
```

### **Array and Collection Filters**
```typescript
// Filter by tags (array field)
const taggedPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.tags/any(t: t/fields.name eq 'JavaScript')"
});

// Multiple tag conditions
const multiTagPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.tags/any(t: t/fields.name eq 'React') and fields.tags/any(t: t/fields.name eq 'TypeScript')"
});

// Check if array contains any of multiple values
const categoryPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  filter: "fields.categories/any(c: c/fields.slug eq 'web-development' or c/fields.slug eq 'mobile-development')"
});
```

---

## 📊 **Sorting Content**

### **Basic Sorting**
```typescript
// Sort by date (newest first)
const latestPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'fields.publishDate desc'
});

// Sort by title alphabetically
const alphabeticalPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'fields.title asc'
});
```

### **Multiple Sort Fields**
```typescript
// Sort by featured status first, then by date
const prioritizedPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'fields.featured desc, fields.publishDate desc'
});

// Sort by category, then by order, then by date
const organizedPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'fields.category/fields.title asc, fields.order asc, fields.publishDate desc'
});
```

### **System Property Sorting**
```typescript
// Sort by item order (manual ordering in CMS)
const manualOrder = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'properties.itemOrder asc'
});

// Sort by last modified date
const recentlyModified = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'properties.modified desc'
});

// Sort by content ID
const chronologicalPosts = await api.getContentList({
  referenceName: 'posts',
  languageCode: 'en-us',
  sort: 'contentID asc'
});
```

---

## 📄 **Individual Content Items**

### **Get Content Item by ID**
```typescript
const contentItem = await api.getContentItem({
  contentID: 123,
  languageCode: 'en-us',
  contentLinkDepth: 2,
  expandAllContentLinks: true
});

// Access content fields
console.log(contentItem.fields.title);
console.log(contentItem.fields.content);
console.log(contentItem.properties.modified);
```

### **Safe Content Retrieval**
```typescript
async function getContentSafely(contentID: number) {
  try {
    const content = await api.getContentItem({
      contentID,
      languageCode: 'en-us',
      contentLinkDepth: 2,
      expandAllContentLinks: true
    });
    
    return content;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`Content item ${contentID} not found`);
      return null;
    }
    
    console.error('Error fetching content:', error);
    throw error;
  }
}

// Usage with fallback
const post = await getContentSafely(123);
if (post) {
  console.log(post.fields.title);
} else {
  console.log('Post not available');
}
```

### **Content Item with Caching**
```typescript
// Implement simple in-memory caching
const contentCache = new Map();

async function getCachedContent(contentID: number, ttl: number = 300000) { // 5 minutes
  const cacheKey = `content-${contentID}`;
  const cached = contentCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const content = await api.getContentItem({
    contentID,
    languageCode: 'en-us',
    contentLinkDepth: 2,
    expandAllContentLinks: true
  });
  
  contentCache.set(cacheKey, {
    data: content,
    timestamp: Date.now()
  });
  
  return content;
}
```

---

## 🔗 **Content Relationships**

### **Working with Linked Content**
```typescript
// Content with multiple levels of linking
const postWithFullContext = await api.getContentItem({
  contentID: 123,
  languageCode: 'en-us',
  contentLinkDepth: 3,           // Go 3 levels deep
  expandAllContentLinks: true
});

// Navigate through linked content
const post = postWithFullContext;
const author = post.fields.author;
const authorCompany = author?.fields.company;
const companyLocation = authorCompany?.fields.location;

console.log(`Post: ${post.fields.title}`);
console.log(`Author: ${author?.fields.name}`);
console.log(`Company: ${authorCompany?.fields.name}`);
console.log(`Location: ${companyLocation?.fields.city}`);
```

### **Handling Circular References**
```typescript
// Be careful with circular references in linked content
async function getContentWithSafeLinks(contentID: number) {
  const content = await api.getContentItem({
    contentID,
    languageCode: 'en-us',
    contentLinkDepth: 2,  // Limit depth to avoid infinite loops
    expandAllContentLinks: false // Only expand specific links
  });
  
  // Manually expand only the links you need
  if (content.fields.authorID) {
    content.fields.author = await api.getContentItem({
      contentID: content.fields.authorID,
      languageCode: 'en-us',
      contentLinkDepth: 1
    });
  }
  
  return content;
}
```

### **Batch Loading Related Content**
```typescript
// Efficiently load related content in batches
async function getPostsWithAuthors(postIds: number[]) {
  // Get all posts
  const posts = await Promise.all(
    postIds.map(id => api.getContentItem({
      contentID: id,
      languageCode: 'en-us'
    }))
  );
  
  // Extract unique author IDs
  const authorIds = [...new Set(
    posts
      .map(post => post.fields.authorID)
      .filter(Boolean)
  )];
  
  // Batch load authors
  const authors = await Promise.all(
    authorIds.map(id => api.getContentItem({
      contentID: id,
      languageCode: 'en-us'
    }))
  );
  
  // Create author lookup map
  const authorMap = new Map(
    authors.map(author => [author.contentID, author])
  );
  
  // Attach authors to posts
  return posts.map(post => ({
    ...post,
    fields: {
      ...post.fields,
      author: authorMap.get(post.fields.authorID)
    }
  }));
}
```

---

## 🏷️ **Content Types & Field Access**

### **Typed Content Access**
```typescript
// Define TypeScript interfaces for your content
interface BlogPost {
  contentID: number;
  fields: {
    title: string;
    content: string;
    publishDate: string;
    featured: boolean;
    author: Author;
    category: Category;
    tags: Tag[];
    metaDescription?: string;
  };
  properties: {
    state: string;
    modified: string;
    versionID: number;
  };
}

interface Author {
  contentID: number;
  fields: {
    name: string;
    bio: string;
    avatar: any; // Media field
    socialLinks: {
      twitter?: string;
      linkedin?: string;
    };
  };
}

// Use typed content
const typedPost = await api.getContentItem({
  contentID: 123,
  languageCode: 'en-us',
  contentLinkDepth: 2,
  expandAllContentLinks: true
}) as BlogPost;

console.log(typedPost.fields.title);
console.log(typedPost.fields.author.fields.name);
```

### **Media Field Handling**
```typescript
// Work with media fields (images, files)
function getImageUrl(mediaField: any, width?: number, height?: number): string {
  if (!mediaField?.url) return '';
  
  let url = mediaField.url;
  
  // Add image transformation parameters if needed
  if (width || height) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    url += `?${params.toString()}`;
  }
  
  return url;
}

// Usage
const post = await api.getContentItem({
  contentID: 123,
  languageCode: 'en-us'
});

const featuredImageUrl = getImageUrl(post.fields.featuredImage, 800, 400);
const thumbnailUrl = getImageUrl(post.fields.featuredImage, 200, 200);
```

---

## 🔗 **Related Documentation**

- **Core APIs**: `fetch-sdk/core-apis.md`
- **Page Operations**: `fetch-sdk/page-operations.md`
- **Sitemap Operations**: `fetch-sdk/sitemap-operations.md`
- **Advanced Features**: `fetch-sdk/advanced-features.md`
- **Best Practices**: `fetch-sdk/best-practices.md`

---

This comprehensive guide covers all content operations available in the Agility Fetch SDK. Use these patterns to efficiently retrieve and work with your content data. 
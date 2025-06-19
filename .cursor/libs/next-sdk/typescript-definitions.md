# Next.js SDK - TypeScript Definitions

This guide provides comprehensive TypeScript definitions and interfaces for Agility CMS with Next.js, ensuring type safety throughout your application.

---

## 🏗️ **Core Agility Types**

### **Content Item Structure**

```typescript
// lib/types/agility.ts

export interface AgilityContentItem {
  contentID: number;
  properties: {
    state: number;
    modified: string;
    versionID: number;
    referenceName: string;
    definitionName: string;
    itemOrder: number;
  };
  fields: { [key: string]: any };
  seo?: AgilityContentSEO;
}

export interface AgilityContentSEO {
  metaDescription?: string;
  metaKeywords?: string;
  metaHTML?: string;
}

export interface AgilityContentList<T = AgilityContentItem> {
  items: T[];
  totalCount: number;
}
```

### **Page Structure**

```typescript
export interface AgilityPage {
  pageID: number;
  name: string;
  path: string;
  title: string;
  menuText: string;
  pageType: string;
  templateName: string;
  visible: {
    menu: boolean;
    sitemap: boolean;
  };
  seo: AgilityContentSEO;
  zones: { [zoneName: string]: AgilityModuleInstance[] };
}

export interface AgilityModuleInstance {
  module: string;
  item: AgilityContentItem;
  customData?: any;
}
```

### **Component Props**

```typescript
export interface AgilityModuleProps {
  module?: string;
  contentID?: number;
  item?: AgilityContentItem;
  customData?: any;
  page?: AgilityPage;
  sitemap?: any;
  isDevelopmentMode?: boolean;
}

export interface AgilityPageProps {
  page: AgilityPage;
  sitemapNode: any;
  sitemap: any;
  isDevelopmentMode?: boolean;
  locale: string;
  channelName: string;
}
```

---

## 🖼️ **Image & Media Types**

```typescript
export interface AgilityImage {
  url: string;
  label?: string;
  filesize?: number;
  pixelHeight?: number;
  pixelWidth?: number;
  height?: number;
  width?: number;
}

export interface AgilityImageProps {
  image: AgilityImage;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
}
```

---

## 🗺️ **Sitemap Types**

```typescript
export interface AgilitySitemapNode {
  pageID: number;
  name: string;
  path: string;
  title: string;
  menuText: string;
  visible: {
    menu: boolean;
    sitemap: boolean;
  };
  isFolder?: boolean;
  children?: AgilitySitemapNode[];
}

export interface AgilitySitemapFlat {
  [path: string]: AgilitySitemapNode;
}
```

---

## 🎯 **Content Model Types**

### **Generic Content Models**

```typescript
// Example: Blog Post
export interface BlogPost extends AgilityContentItem {
  fields: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: AgilityImage;
    author?: string;
    publishDate: string;
    category?: string;
    tags?: string[];
  };
}

// Example: Hero Section
export interface HeroSection extends AgilityContentItem {
  fields: {
    title: string;
    subtitle?: string;
    backgroundImage?: AgilityImage;
    ctaText?: string;
    ctaLink?: string;
  };
}
```

### **Component Type Registry**

```typescript
export interface ComponentTypeMap {
  'RichTextArea': AgilityModuleProps;
  'PostsListing': AgilityModuleProps & { posts?: BlogPost[] };
  'FeaturedPost': AgilityModuleProps & { post?: BlogPost };
  'HeroSection': AgilityModuleProps & { hero?: HeroSection };
}

export type ComponentType = keyof ComponentTypeMap;
```

---

## 🔧 **API Response Types**

```typescript
export interface AgilityApiResponse<T = any> {
  data: T;
  totalCount?: number;
  success: boolean;
  message?: string;
}

export interface AgilityPageResponse {
  page: AgilityPage;
  sitemapNode: AgilitySitemapNode;
}

export interface AgilityContentResponse<T = AgilityContentItem> {
  items: T[];
  totalCount: number;
}
```

---

## ⚙️ **Configuration Types**

```typescript
export interface AgilityConfig {
  guid: string;
  apiKey: string;
  isPreview: boolean;
  locale: string;
  channelName: string;
  caching?: {
    maxAge: number;
  };
}

export interface NextAgilityConfig {
  agility: AgilityConfig;
  revalidate?: number;
  images?: {
    domains: string[];
    formats: string[];
  };
}
```

---

## 🔗 **Related Documentation**

- [App Router Setup](./app-router-setup.md) - Project setup
- [Component Development](./component-development.md) - Building components
- [Data Fetching](./data-fetching.md) - Fetching typed data
- [Image Optimization](./image-optimization.md) - AgilityPic types 
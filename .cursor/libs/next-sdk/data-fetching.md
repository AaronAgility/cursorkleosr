# Agility CMS Next.js SDK - Data Fetching

This document covers data fetching patterns for Agility CMS in Next.js applications, including server components, caching strategies, and content utilities.

---

## 🔧 **Core Data Fetching Functions**

### **getAgilityPageProps Implementation**
```typescript
// lib/cms/getAgilityPageProps.ts
import { getApi } from '@agility/content-fetch';
import { cache } from 'react';
import { agilityConfig } from './agility-client';

interface AgilityPagePropsParams {
  params: { slug?: string[] };
  preview?: boolean;
  locale: string;
  sitemap: string;
}

interface AgilityPageProps {
  page: any;
  sitemapNode: any;
  sitemap: any;
  isDevelopmentMode: boolean;
  locale: string;
  channelName: string;
  notFound?: boolean;
}

// Cache the API client per preview mode
const getAgilityApi = cache((preview: boolean) => {
  return getApi({
    guid: agilityConfig.guid,
    apiKey: preview ? agilityConfig.previewKey : agilityConfig.apiKey,
    isPreview: preview,
    caching: {
      maxAge: agilityConfig.cacheDuration
    }
  });
});

export async function getAgilityPageProps({ 
  params, 
  preview = false, 
  locale, 
  sitemap 
}: AgilityPagePropsParams): Promise<AgilityPageProps | { notFound: true }> {
  const api = getAgilityApi(preview);
  
  // Construct path from slug
  const path = params.slug ? `/${params.slug.join('/')}` : '/';
  
  try {
    // Fetch page data and sitemap in parallel
    const [pageInSitemap, sitemapFlat] = await Promise.all([
      api.getPageByPath({
        pagePath: path,
        channelName: sitemap,
        languageCode: locale
      }),
      api.getSitemapFlat({
        channelName: sitemap,
        languageCode: locale
      })
    ]);

    if (!pageInSitemap?.page) {
      return { notFound: true };
    }

    return {
      page: pageInSitemap.page,
      sitemapNode: pageInSitemap.sitemapNode,
      sitemap: sitemapFlat,
      isDevelopmentMode: preview,
      locale,
      channelName: sitemap
    };
  } catch (error) {
    console.error('Error fetching Agility page props:', error);
    return { notFound: true };
  }
}

// Generate static paths for all pages
export async function getAgilityPaths({ 
  preview = false, 
  locale, 
  sitemap 
}: Omit<AgilityPagePropsParams, 'params'>): Promise<string[]> {
  const api = getAgilityApi(preview);
  
  try {
    const sitemapFlat = await api.getSitemapFlat({
      channelName: sitemap,
      languageCode: locale
    });

    return Object.keys(sitemapFlat).filter(path => 
      sitemapFlat[path].visible.sitemap && !sitemapFlat[path].redirectUrl
    );
  } catch (error) {
    console.error('Error fetching Agility paths:', error);
    return [];
  }
}
```

---

## 📦 **Content Fetching Utilities**

### **Content Utilities (`lib/cms/cms-content.ts`)**
```typescript
import { getApi } from '@agility/content-fetch';
import { cache } from 'react';
import { agilityConfig } from './agility-client';

// Cached API client
const getAgilityApi = cache((preview: boolean) => {
  return getApi({
    guid: agilityConfig.guid,
    apiKey: preview ? agilityConfig.previewKey : agilityConfig.apiKey,
    isPreview: preview,
    caching: {
      maxAge: agilityConfig.cacheDuration
    }
  });
});

// Generic content fetching with caching
export const getContentList = cache(async (
  referenceName: string,
  options: {
    take?: number;
    skip?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    filter?: string;
    fields?: string[];
    preview?: boolean;
    locale?: string;
  } = {}
) => {
  const {
    take = 20,
    skip = 0,
    sort,
    direction = 'desc',
    filter,
    fields,
    preview = false,
    locale = agilityConfig.locale
  } = options;

  const api = getAgilityApi(preview);

  try {
    const contentList = await api.getContentList({
      referenceName,
      languageCode: locale,
      take,
      skip,
      sort: sort ? `${sort} ${direction}` : undefined,
      filter,
      fields
    });

    return contentList;
  } catch (error) {
    console.error(`Error fetching content list "${referenceName}":`, error);
    return [];
  }
});

// Get single content item
export const getContentItem = cache(async (
  contentID: number,
  options: {
    preview?: boolean;
    locale?: string;
  } = {}
) => {
  const {
    preview = false,
    locale = agilityConfig.locale
  } = options;

  const api = getAgilityApi(preview);

  try {
    const contentItem = await api.getContentItem({
      contentID,
      languageCode: locale
    });

    return contentItem;
  } catch (error) {
    console.error(`Error fetching content item ${contentID}:`, error);
    return null;
  }
});

// Get content by slug (for dynamic routing)
export const getContentBySlug = cache(async (
  referenceName: string,
  slug: string,
  options: {
    preview?: boolean;
    locale?: string;
  } = {}
) => {
  const {
    preview = false,
    locale = agilityConfig.locale
  } = options;

  try {
    const contentList = await getContentList(referenceName, {
      filter: `fields.slug eq '${slug}'`,
      take: 1,
      preview,
      locale
    });

    return contentList.length > 0 ? contentList[0] : null;
  } catch (error) {
    console.error(`Error fetching content by slug "${slug}":`, error);
    return null;
  }
});

// Get gallery
export const getGallery = cache(async (
  galleryID: number,
  options: {
    preview?: boolean;
  } = {}
) => {
  const { preview = false } = options;
  const api = getAgilityApi(preview);

  try {
    const gallery = await api.getGallery({
      galleryID
    });

    return gallery;
  } catch (error) {
    console.error(`Error fetching gallery ${galleryID}:`, error);
    return null;
  }
});
```

---

## 🖥️ **Server Component Patterns**

### **Content List Server Component**
```typescript
// components/agility-components/PostsListing.tsx
import { getContentList } from '@/lib/cms/cms-content';
import Link from 'next/link';
import { AgilityPic } from '@/components/common/AgilityPic';

interface PostsListingProps {
  customData?: {
    referenceName?: string;
    take?: number;
    category?: string;
    showExcerpt?: boolean;
    showDate?: boolean;
  };
  isDevelopmentMode?: boolean;
}

export default async function PostsListing({ 
  customData = {}, 
  isDevelopmentMode = false 
}: PostsListingProps) {
  const {
    referenceName = 'posts',
    take = 10,
    category,
    showExcerpt = true,
    showDate = true
  } = customData;

  // Build filter for category
  const filter = category ? `fields.category.fields.slug eq '${category}'` : undefined;

  // Fetch posts on server
  const posts = await getContentList(referenceName, {
    take,
    filter,
    sort: 'fields.date',
    direction: 'desc',
    preview: isDevelopmentMode
  });

  if (!posts || posts.length === 0) {
    return (
      <div className="posts-listing">
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <div className="posts-listing">
      <div className="posts-grid">
        {posts.map((post: any) => (
          <article key={post.contentID} className="post-card">
            {post.fields.featuredImage && (
              <Link href={`/blog/${post.fields.slug}`}>
                <AgilityPic
                  image={post.fields.featuredImage}
                  alt={post.fields.title}
                  className="post-image"
                  fallbackWidth={400}
                  fallbackHeight={250}
                />
              </Link>
            )}
            
            <div className="post-content">
              <h2 className="post-title">
                <Link href={`/blog/${post.fields.slug}`}>
                  {post.fields.title}
                </Link>
              </h2>
              
              {showDate && post.fields.date && (
                <time className="post-date">
                  {new Date(post.fields.date).toLocaleDateString()}
                </time>
              )}
              
              {showExcerpt && post.fields.excerpt && (
                <p className="post-excerpt">{post.fields.excerpt}</p>
              )}
              
              <Link href={`/blog/${post.fields.slug}`} className="read-more">
                Read More
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
```

### **Featured Content Server Component**
```typescript
// components/agility-components/FeaturedPost.tsx
import { getContentList } from '@/lib/cms/cms-content';
import Link from 'next/link';
import { AgilityPic } from '@/components/common/AgilityPic';

interface FeaturedPostProps {
  customData?: {
    referenceName?: string;
    postSlug?: string;
    showLatest?: boolean;
  };
  isDevelopmentMode?: boolean;
}

export default async function FeaturedPost({ 
  customData = {}, 
  isDevelopmentMode = false 
}: FeaturedPostProps) {
  const {
    referenceName = 'posts',
    postSlug,
    showLatest = true
  } = customData;

  let post;

  if (postSlug) {
    // Get specific post by slug
    const posts = await getContentList(referenceName, {
      filter: `fields.slug eq '${postSlug}'`,
      take: 1,
      preview: isDevelopmentMode
    });
    post = posts[0];
  } else if (showLatest) {
    // Get latest post
    const posts = await getContentList(referenceName, {
      take: 1,
      sort: 'fields.date',
      direction: 'desc',
      preview: isDevelopmentMode
    });
    post = posts[0];
  }

  if (!post) {
    return (
      <div className="featured-post">
        <p>No featured post found.</p>
      </div>
    );
  }

  return (
    <div className="featured-post">
      <div className="featured-post-content">
        {post.fields.featuredImage && (
          <div className="featured-image">
            <AgilityPic
              image={post.fields.featuredImage}
              alt={post.fields.title}
              fallbackWidth={800}
              fallbackHeight={400}
              priority
            />
          </div>
        )}
        
        <div className="featured-text">
          <h2 className="featured-title">
            <Link href={`/blog/${post.fields.slug}`}>
              {post.fields.title}
            </Link>
          </h2>
          
          {post.fields.date && (
            <time className="featured-date">
              {new Date(post.fields.date).toLocaleDateString()}
            </time>
          )}
          
          {post.fields.excerpt && (
            <p className="featured-excerpt">{post.fields.excerpt}</p>
          )}
          
          <Link href={`/blog/${post.fields.slug}`} className="featured-link">
            Read Full Article
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 **Dynamic Content Loading**

### **Client-Side Data Fetching Hook**
```typescript
// hooks/useAgilityContent.ts
'use client';

import { useState, useEffect } from 'react';

interface UseAgilityContentOptions {
  referenceName: string;
  take?: number;
  skip?: number;
  filter?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export function useAgilityContent(options: UseAgilityContentOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const content = await response.json();
        setData(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [JSON.stringify(options)]);

  return { data, loading, error };
}
```

### **Content API Route**
```typescript
// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getContentList } from '@/lib/cms/cms-content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      referenceName,
      take = 20,
      skip = 0,
      filter,
      sort,
      direction = 'desc'
    } = body;

    if (!referenceName) {
      return NextResponse.json(
        { error: 'referenceName is required' },
        { status: 400 }
      );
    }

    const content = await getContentList(referenceName, {
      take,
      skip,
      filter,
      sort,
      direction,
      preview: false // Client-side requests use published content
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
```

---

## 📊 **Content Filtering & Searching**

### **Advanced Content Filtering**
```typescript
// lib/cms/content-filters.ts
export interface ContentFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'startswith' | 'endswith';
  value: string | number | boolean;
}

export function buildFilterString(filters: ContentFilter[]): string {
  return filters
    .map(filter => {
      const { field, operator, value } = filter;
      const fieldPath = field.startsWith('fields.') ? field : `fields.${field}`;
      
      if (typeof value === 'string') {
        return `${fieldPath} ${operator} '${value}'`;
      }
      
      return `${fieldPath} ${operator} ${value}`;
    })
    .join(' and ');
}

// Usage example
export async function getFilteredPosts(filters: {
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  tag?: string;
}) {
  const contentFilters: ContentFilter[] = [];

  if (filters.category) {
    contentFilters.push({
      field: 'category.fields.slug',
      operator: 'eq',
      value: filters.category
    });
  }

  if (filters.author) {
    contentFilters.push({
      field: 'author.fields.name',
      operator: 'eq',
      value: filters.author
    });
  }

  if (filters.dateFrom) {
    contentFilters.push({
      field: 'date',
      operator: 'gt',
      value: filters.dateFrom
    });
  }

  if (filters.dateTo) {
    contentFilters.push({
      field: 'date',
      operator: 'lt',
      value: filters.dateTo
    });
  }

  if (filters.tag) {
    contentFilters.push({
      field: 'tags',
      operator: 'contains',
      value: filters.tag
    });
  }

  const filterString = buildFilterString(contentFilters);

  return getContentList('posts', {
    filter: filterString,
    sort: 'fields.date',
    direction: 'desc'
  });
}
```

### **Search Functionality**
```typescript
// lib/cms/content-search.ts
export async function searchContent(
  query: string,
  contentTypes: string[] = ['posts', 'pages'],
  options: {
    take?: number;
    preview?: boolean;
  } = {}
) {
  const { take = 10, preview = false } = options;
  
  const searchPromises = contentTypes.map(async (referenceName) => {
    try {
      const results = await getContentList(referenceName, {
        filter: `fields.title contains '${query}' or fields.content contains '${query}'`,
        take,
        preview
      });

      return results.map((item: any) => ({
        ...item,
        contentType: referenceName
      }));
    } catch (error) {
      console.error(`Error searching ${referenceName}:`, error);
      return [];
    }
  });

  const allResults = await Promise.all(searchPromises);
  
  // Flatten and sort by relevance (you can implement custom scoring)
  return allResults
    .flat()
    .sort((a, b) => {
      // Simple relevance scoring based on title match
      const aInTitle = a.fields.title?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bInTitle = b.fields.title?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return bInTitle - aInTitle;
    })
    .slice(0, take);
}
```

---

## 🔗 **Related Documentation**

- **App Router Setup**: `next-sdk/app-router-setup.md`
- **Component Development**: `next-sdk/component-development.md`
- **Image Optimization**: `next-sdk/image-optimization.md`
- **Caching Strategies**: `next-sdk/caching-strategies.md`
- **Preview Mode**: `next-sdk/preview-mode.md`
- **Best Practices**: `next-sdk/best-practices.md`

---

This guide provides comprehensive patterns for fetching and managing Agility CMS content in Next.js applications using server components and modern data fetching techniques. 
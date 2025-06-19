# Next.js SDK - Advanced Patterns

This guide covers advanced implementation patterns for Agility CMS with Next.js, including search integration, multi-language support, and complex data relationships.

---

## 🔍 **Search Integration**

### **FlexSearch Implementation**

```typescript
// components/agility-components/Search.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="search-component">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {loading && <div className="mt-2">Searching...</div>}
      
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result: any) => (
            <div key={result.id} className="p-3 border rounded-lg">
              <h3 className="font-semibold">{result.title}</h3>
              <p className="text-gray-600 text-sm">{result.excerpt}</p>
              <button
                onClick={() => router.push(result.url)}
                className="text-blue-600 text-sm hover:underline"
              >
                Read more
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### **Search API Route**

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getApi } from '@agility/content-fetch';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const api = getApi({
      guid: process.env.AGILITY_GUID!,
      apiKey: process.env.AGILITY_API_FETCH_KEY!,
      isPreview: false
    });

    // Search across multiple content types
    const [posts, pages] = await Promise.all([
      api.getContentList({
        referenceName: 'posts',
        locale: 'en-us',
        take: 10,
        filters: [
          {
            property: 'fields.title',
            operator: 'contains',
            value: query
          }
        ]
      }),
      api.getContentList({
        referenceName: 'pages',
        locale: 'en-us',
        take: 10,
        filters: [
          {
            property: 'fields.title',
            operator: 'contains',
            value: query
          }
        ]
      })
    ]);

    const results = [
      ...posts.items.map(item => ({
        id: item.contentID,
        title: item.fields.title,
        excerpt: item.fields.excerpt || '',
        url: `/blog/${item.fields.slug}`,
        type: 'post'
      })),
      ...pages.items.map(item => ({
        id: item.contentID,
        title: item.fields.title,
        excerpt: item.fields.excerpt || '',
        url: item.fields.path || '/',
        type: 'page'
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
```

---

## 🌐 **Multi-Language Support**

### **Language Switcher**

```typescript
// components/common/LanguageSwitcher.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';

const languages = [
  { code: 'en-us', name: 'English' },
  { code: 'fr-ca', name: 'Français' },
  { code: 'es-mx', name: 'Español' }
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <select 
      value={currentLocale}
      onChange={(e) => switchLanguage(e.target.value)}
      className="border rounded px-2 py-1"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### **Localized Content Fetching**

```typescript
// lib/cms/localized-content.ts
import { getApi } from '@agility/content-fetch';

export async function getLocalizedContent(
  referenceName: string,
  locale: string,
  contentID?: number
) {
  const api = getApi({
    guid: process.env.AGILITY_GUID!,
    apiKey: process.env.AGILITY_API_FETCH_KEY!,
    isPreview: false
  });

  if (contentID) {
    return api.getContentItem({
      contentID,
      locale
    });
  }

  return api.getContentList({
    referenceName,
    locale,
    take: 50
  });
}
```

---

## 🔗 **Complex Data Relationships**

### **Related Content Component**

```typescript
// components/agility-components/RelatedContent.tsx
import { getApi } from '@agility/content-fetch';

interface RelatedContentProps {
  contentID: number;
  contentType: string;
  locale: string;
  limit?: number;
}

export default async function RelatedContent({
  contentID,
  contentType,
  locale,
  limit = 3
}: RelatedContentProps) {
  const api = getApi({
    guid: process.env.AGILITY_GUID!,
    apiKey: process.env.AGILITY_API_FETCH_KEY!,
    isPreview: false
  });

  // Fetch current content to get categories/tags
  const currentContent = await api.getContentItem({
    contentID,
    locale
  });

  if (!currentContent?.fields?.category) {
    return <div>No related content found</div>;
  }

  // Fetch related content by category
  const relatedContent = await api.getContentList({
    referenceName: contentType,
    locale,
    take: limit + 1, // Get one extra to exclude current
    filters: [
      {
        property: 'fields.category',
        operator: 'eq',
        value: currentContent.fields.category
      }
    ]
  });

  // Exclude current content
  const filteredContent = relatedContent.items
    .filter(item => item.contentID !== contentID)
    .slice(0, limit);

  return (
    <div className="related-content">
      <h3 className="text-xl font-bold mb-4">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredContent.map(item => (
          <div key={item.contentID} className="border rounded-lg p-4">
            <h4 className="font-semibold">{item.fields.title}</h4>
            <p className="text-sm text-gray-600 mt-2">
              {item.fields.excerpt}
            </p>
            <a
              href={`/blog/${item.fields.slug}`}
              className="text-blue-600 text-sm hover:underline mt-2 inline-block"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 **Dynamic Content Loading**

### **Infinite Scroll Component**

```typescript
// components/agility-components/InfiniteScroll.tsx
'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollProps {
  initialContent: any[];
  contentType: string;
  locale: string;
}

export default function InfiniteScroll({
  initialContent,
  contentType,
  locale
}: InfiniteScrollProps) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content/${contentType}?locale=${locale}&page=${page + 1}`
      );
      const data = await response.json();
      
      if (data.items.length === 0) {
        setHasMore(false);
      } else {
        setContent(prev => [...prev, ...data.items]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map(item => (
          <div key={item.contentID} className="border rounded-lg p-4">
            <h3 className="font-semibold">{item.fields.title}</h3>
            <p className="text-gray-600 mt-2">{item.fields.excerpt}</p>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          ) : (
            <div>Load more...</div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 **Performance Patterns**

### **Smart Prefetching**

```typescript
// hooks/usePrefetch.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function usePrefetchPages(paths: string[]) {
  const router = useRouter();
  
  useEffect(() => {
    const prefetchPaths = paths.slice(0, 5); // Limit prefetching
    prefetchPaths.forEach(path => {
      router.prefetch(path);
    });
  }, [paths, router]);
}
```

### **Optimistic Updates**

```typescript
// hooks/useOptimisticContent.ts
'use client';

import { useState, useTransition } from 'react';

export function useOptimisticContent<T>(initialContent: T[]) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  const addOptimistic = (newItem: T) => {
    startTransition(() => {
      setContent(prev => [newItem, ...prev]);
    });
  };

  const updateOptimistic = (id: number, updates: Partial<T>) => {
    startTransition(() => {
      setContent(prev => prev.map(item => 
        (item as any).contentID === id ? { ...item, ...updates } : item
      ));
    });
  };

  return {
    content,
    addOptimistic,
    updateOptimistic,
    isPending
  };
}
```

---

## 🔗 **Related Documentation**

- [Component Development](./component-development.md) - Building components
- [Data Fetching](./data-fetching.md) - Content fetching patterns
- [TypeScript Definitions](./typescript-definitions.md) - Type definitions
- [Caching & Performance](./caching-performance.md) - Performance optimization 
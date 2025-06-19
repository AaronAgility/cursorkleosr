# Next.js SDK - Caching & Performance

This guide covers advanced caching strategies, performance optimization, and on-demand revalidation patterns for Agility CMS with Next.js.

---

## ⚡ **On-Demand Revalidation**

### **Revalidation API Route**

Create a webhook endpoint to handle content updates from Agility CMS:

```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // Validate secret key
  if (secret !== process.env.AGILITY_SECURITY_KEY) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'content-item':
        // Revalidate specific content item
        revalidateTag(`agility-content-item-${data.contentID}`);
        revalidateTag(`agility-locale-${data.locale}`);
        break;
        
      case 'content-list':
        // Revalidate content list
        revalidateTag(`agility-content-list-${data.referenceName}`);
        revalidateTag(`agility-locale-${data.locale}`);
        break;
        
      case 'page':
        // Revalidate specific page
        revalidatePath(data.path);
        revalidateTag(`agility-sitemap-${data.channelName}`);
        break;
        
      case 'sitemap':
        // Revalidate entire sitemap
        revalidateTag(`agility-sitemap-${data.channelName}`);
        revalidateTag(`agility-locale-${data.locale}`);
        break;
        
      default:
        // Full revalidation
        revalidateTag('agility');
    }

    return NextResponse.json({ 
      revalidated: true, 
      type,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error.message }, 
      { status: 500 }
    );
  }
}
```

### **Manual Revalidation Triggers**

For development and testing purposes:

```typescript
// lib/revalidation.ts
export async function triggerRevalidation(type: string, data: any) {
  const response = await fetch(`/api/revalidate?secret=${process.env.AGILITY_SECURITY_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger revalidation');
  }

  return response.json();
}

// Usage examples
export const revalidationHelpers = {
  // Revalidate specific content item
  revalidateContent: (contentID: number, locale: string) => 
    triggerRevalidation('content-item', { contentID, locale }),
  
  // Revalidate content list
  revalidateContentList: (referenceName: string, locale: string) => 
    triggerRevalidation('content-list', { referenceName, locale }),
  
  // Revalidate page
  revalidatePage: (path: string, channelName: string) => 
    triggerRevalidation('page', { path, channelName }),
  
  // Revalidate sitemap
  revalidateSitemap: (channelName: string, locale: string) => 
    triggerRevalidation('sitemap', { channelName, locale }),
};
```

---

## 🚀 **Caching Configuration**

### **Next.js Configuration**

Optimize your Next.js configuration for Agility CMS:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable app directory
    appDir: true,
    
    // Optimize server components
    serverComponentsExternalPackages: ['@agility/content-fetch'],
  },
  
  images: {
    // Configure image domains
    domains: [
      'cdn.aglty.io',
      'agilitycms.com'
    ],
    
    // Image optimization
    formats: ['image/webp', 'image/avif'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Agility-specific redirects and rewrites
  async redirects() {
    return [
      // Add any necessary redirects
    ];
  },
  
  async rewrites() {
    return [
      // Add any necessary rewrites
    ];
  },
  
  // Environment variables
  env: {
    AGILITY_GUID: process.env.AGILITY_GUID,
    AGILITY_FETCH_CACHE_DURATION: process.env.AGILITY_FETCH_CACHE_DURATION,
    AGILITY_PATH_REVALIDATE_DURATION: process.env.AGILITY_PATH_REVALIDATE_DURATION,
  },
  
  // Optimize build output
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Power By header
  poweredByHeader: false,
};

module.exports = nextConfig;
```

### **Data Fetching Caching**

Implement strategic caching for Agility data:

```typescript
// lib/cms/cache-config.ts
import { cache } from 'react';
import { getApi } from '@agility/content-fetch';

// Cache the API client
export const getAgilityApi = cache((preview: boolean) => {
  return getApi({
    guid: process.env.AGILITY_GUID!,
    apiKey: preview 
      ? process.env.AGILITY_API_PREVIEW_KEY! 
      : process.env.AGILITY_API_FETCH_KEY!,
    isPreview: preview,
    caching: {
      maxAge: parseInt(process.env.AGILITY_FETCH_CACHE_DURATION || '3600')
    }
  });
});

// Cache page data with tags
export const getCachedPageData = cache(async (path: string, preview: boolean, locale: string, sitemap: string) => {
  const api = getAgilityApi(preview);
  
  const pageData = await api.getPageByPath({
    pagePath: path,
    channelName: sitemap,
    locale
  });
  
  // Add cache tags for revalidation
  if (pageData?.page) {
    const tags = [
      `agility-page-${pageData.page.pageID}`,
      `agility-locale-${locale}`,
      `agility-sitemap-${sitemap}`,
      'agility'
    ];
    
    // Note: In a real implementation, you'd use Next.js cache tags
    // This is a conceptual example
  }
  
  return pageData;
});

// Cache content lists with tags
export const getCachedContentList = cache(async (referenceName: string, locale: string, preview: boolean) => {
  const api = getAgilityApi(preview);
  
  const contentList = await api.getContentList({
    referenceName,
    locale,
    take: 50,
    skip: 0
  });
  
  return contentList;
});
```

---

## 📊 **Performance Monitoring**

### **Web Vitals Tracking**

Monitor Core Web Vitals and Agility-specific metrics:

```typescript
// lib/performance.ts
export function trackWebVitals(metric: any) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.label,
        custom_parameter_3: metric.id,
      });
    }
    
    // Example: Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', metric.name, {
        value: metric.value,
        label: metric.label,
        id: metric.id,
      });
    }
  }
  
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, metric);
  }
}

// Track Agility-specific metrics
export function trackAgilityMetrics(metricName: string, value: number, labels?: Record<string, string>) {
  const metric = {
    name: `agility_${metricName}`,
    value,
    labels,
    timestamp: Date.now(),
  };
  
  // Send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example implementation
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }
}

// Usage in components
export const performanceHelpers = {
  // Track content load time
  trackContentLoad: (contentType: string, loadTime: number) => 
    trackAgilityMetrics('content_load_time', loadTime, { contentType }),
  
  // Track page render time
  trackPageRender: (pageId: string, renderTime: number) => 
    trackAgilityMetrics('page_render_time', renderTime, { pageId }),
  
  // Track API response time
  trackApiResponse: (endpoint: string, responseTime: number) => 
    trackAgilityMetrics('api_response_time', responseTime, { endpoint }),
};
```

### **Bundle Analysis**

Add scripts to analyze bundle size:

```json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "analyze:server": "cross-env BUNDLE_ANALYZE=server next build",
    "analyze:browser": "cross-env BUNDLE_ANALYZE=browser next build"
  }
}
```

---

## ⚙️ **Advanced Caching Strategies**

### **Incremental Static Regeneration (ISR)**

Configure ISR for Agility pages:

```typescript
// app/[...slug]/page.tsx
export const revalidate = parseInt(process.env.AGILITY_PATH_REVALIDATE_DURATION || '86400'); // 24 hours

export default async function Page({ params, searchParams }: PageProps) {
  const { preview } = searchParams;
  const isPreview = preview === 'true';
  
  // For preview mode, don't use ISR
  if (isPreview) {
    const agilityProps = await getAgilityPageProps({
      params,
      preview: true,
      locale: process.env.AGILITY_LOCALE || 'en-us',
      sitemap: process.env.AGILITY_SITEMAP || 'website'
    });
    
    return <AgilityPageTemplate {...agilityProps} />;
  }
  
  // For production, use cached data
  const agilityProps = await getCachedPageData(
    params.slug ? `/${params.slug.join('/')}` : '/',
    false,
    process.env.AGILITY_LOCALE || 'en-us',
    process.env.AGILITY_SITEMAP || 'website'
  );

  if (!agilityProps.page) {
    return <div>Page not found</div>;
  }

  return <AgilityPageTemplate {...agilityProps} />;
}
```

### **Client-Side Caching**

Implement client-side caching for dynamic content:

```typescript
// lib/client-cache.ts
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
}

export const clientCache = new ClientCache();

// Usage in components
export function useCachedContent(key: string, fetcher: () => Promise<any>, ttl?: number) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const cachedData = clientCache.get(key);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    
    fetcher().then(result => {
      clientCache.set(key, result, ttl);
      setData(result);
      setLoading(false);
    });
  }, [key]);
  
  return { data, loading };
}
```

---

## 🔧 **Performance Optimization Techniques**

### **Code Splitting**

Optimize component loading:

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Disable SSR for client-only components
});

// Lazy load Agility modules
const moduleComponents = {
  RichTextArea: dynamic(() => import('./RichTextArea')),
  PostsListing: dynamic(() => import('./PostsListing')),
  FeaturedPost: dynamic(() => import('./FeaturedPost')),
};
```

### **Image Optimization**

Optimize images with AgilityPic:

```typescript
// Use AgilityPic for all Agility images
import { AgilityPic } from '@agility/nextjs';

function OptimizedImage({ image, alt, className }: { image: any; alt: string; className?: string }) {
  return (
    <AgilityPic
      image={image}
      alt={alt}
      className={className}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### **Prefetching Strategies**

Implement smart prefetching:

```typescript
// lib/prefetch.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function usePrefetchPages(paths: string[]) {
  const router = useRouter();
  
  useEffect(() => {
    paths.forEach(path => {
      router.prefetch(path);
    });
  }, [paths, router]);
}

// Usage in navigation components
export function NavigationWithPrefetch({ sitemap }: { sitemap: any[] }) {
  const visiblePaths = sitemap
    .filter(item => item.visible.menu)
    .map(item => item.path)
    .slice(0, 5); // Limit prefetching
  
  usePrefetchPages(visiblePaths);
  
  return (
    <nav>
      {sitemap.map(item => (
        <Link key={item.pageID} href={item.path}>
          {item.menuText}
        </Link>
      ))}
    </nav>
  );
}
```

---

## 🔗 **Related Documentation**

- [App Router Setup](./app-router-setup.md) - Basic Next.js configuration
- [Data Fetching](./data-fetching.md) - Content fetching patterns
- [Image Optimization](./image-optimization.md) - AgilityPic usage
- [Preview Mode](./preview-middleware.md) - Preview and middleware setup
- [Deployment](./deployment-production.md) - Production deployment guide 
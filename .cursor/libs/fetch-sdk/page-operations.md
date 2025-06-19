# Agility CMS Fetch SDK - Page Operations

This document covers all page-related operations including page retrieval, module processing, zone handling, and page-based routing patterns.

---

## 📄 **Basic Page Operations**

### **Get Page by ID**
```typescript
const page = await api.getPage({
  pageID: 456,
  languageCode: 'en-us'
});

// Access page properties
console.log(page.name);           // Internal page name
console.log(page.title);          // Page title (SEO)
console.log(page.pageTemplate);   // Template reference name
console.log(page.zones);          // Content zones with modules
console.log(page.seo);            // SEO metadata
console.log(page.scripts);        // Custom scripts
console.log(page.visible);        // Visibility settings
```

### **Get Page by Path**
```typescript
const pageResult = await api.getPageByPath({
  pagePath: '/blog/my-awesome-post',
  channelName: 'website',
  languageCode: 'en-us'
});

console.log(pageResult.page);        // Page data
console.log(pageResult.sitemapNode); // Sitemap node info

// Access sitemap node properties
const node = pageResult.sitemapNode;
console.log(node.title);          // Page title in sitemap
console.log(node.menuText);       // Menu text override
console.log(node.visible.menu);   // Visible in menu
console.log(node.visible.sitemap); // Visible in sitemap
```

### **Safe Page Retrieval**
```typescript
async function getPageSafely(pagePath: string) {
  try {
    const result = await api.getPageByPath({
      pagePath,
      channelName: 'website',
      languageCode: 'en-us'
    });
    
    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`Page not found: ${pagePath}`);
      return null;
    }
    
    console.error('Error fetching page:', error);
    throw error;
  }
}

// Usage with fallback
const pageData = await getPageSafely('/about-us');
if (!pageData) {
  // Handle 404 - redirect to error page
  return { notFound: true };
}
```

---

## 🏗️ **Page Modules & Zones**

### **Processing Page Modules**
```typescript
// Extract all modules from page zones
function extractPageModules(page: any) {
  const modules = [];
  
  // Iterate through all zones
  Object.keys(page.zones).forEach(zoneName => {
    const zoneModules = page.zones[zoneName];
    
    zoneModules.forEach((moduleInstance: any, index: number) => {
      modules.push({
        zone: zoneName,
        index,
        module: moduleInstance.module,        // Module definition name
        contentID: moduleInstance.item?.contentID,
        fields: moduleInstance.item?.fields,
        customData: moduleInstance.customData,
        sortOrder: moduleInstance.sortOrder
      });
    });
  });
  
  return modules.sort((a, b) => a.sortOrder - b.sortOrder);
}

const page = await api.getPage({ pageID: 123, languageCode: 'en-us' });
const modules = extractPageModules(page);
```

### **Zone-Specific Module Processing**
```typescript
// Process modules by zone
function getModulesByZone(page: any, zoneName: string) {
  const zoneModules = page.zones[zoneName] || [];
  
  return zoneModules.map((moduleInstance: any, index: number) => ({
    index,
    module: moduleInstance.module,
    content: moduleInstance.item,
    customData: moduleInstance.customData,
    sortOrder: moduleInstance.sortOrder
  }));
}

// Get specific zone modules
const headerModules = getModulesByZone(page, 'Header');
const mainModules = getModulesByZone(page, 'Main');
const sidebarModules = getModulesByZone(page, 'Sidebar');
```

### **Module Type Detection**
```typescript
// Create module type handlers
const moduleHandlers = {
  'RichTextArea': (moduleData: any) => ({
    type: 'rich-text',
    content: moduleData.fields.textblob
  }),
  
  'ImageGallery': (moduleData: any) => ({
    type: 'gallery',
    images: moduleData.fields.images,
    title: moduleData.fields.title
  }),
  
  'PostsListing': (moduleData: any) => ({
    type: 'posts-listing',
    referenceName: moduleData.customData?.referenceName || 'posts',
    take: moduleData.customData?.take || 10,
    category: moduleData.customData?.category
  }),
  
  'CallToAction': (moduleData: any) => ({
    type: 'cta',
    title: moduleData.fields.title,
    text: moduleData.fields.text,
    buttonText: moduleData.fields.buttonText,
    buttonLink: moduleData.fields.buttonLink
  })
};

// Process modules with type detection
function processPageModules(page: any) {
  const modules = extractPageModules(page);
  
  return modules.map(moduleInstance => {
    const handler = moduleHandlers[moduleInstance.module];
    
    if (handler && moduleInstance.fields) {
      return {
        ...handler(moduleInstance),
        zone: moduleInstance.zone,
        index: moduleInstance.index
      };
    }
    
    // Fallback for unknown modules
    return {
      type: 'unknown',
      module: moduleInstance.module,
      zone: moduleInstance.zone,
      index: moduleInstance.index,
      data: moduleInstance
    };
  });
}
```

---

## 🎯 **Dynamic Page Routing**

### **Next.js Dynamic Routes**
```typescript
// pages/[...slug].tsx - Catch-all dynamic routing
import { GetStaticPaths, GetStaticProps } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  const sitemap = await api.getSitemapFlat({
    channelName: 'website',
    languageCode: 'en-us'
  });
  
  const paths = Object.keys(sitemap)
    .filter(path => sitemap[path].visible.sitemap)
    .map(path => ({
      params: {
        slug: path === '/' ? [] : path.split('/').filter(Boolean)
      }
    }));
    
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string[] || [];
  const pagePath = '/' + slug.join('/');
  
  try {
    const pageResult = await api.getPageByPath({
      pagePath: pagePath || '/',
      channelName: 'website',
      languageCode: 'en-us'
    });
    
    return {
      props: {
        page: pageResult.page,
        sitemapNode: pageResult.sitemapNode,
        modules: processPageModules(pageResult.page)
      },
      revalidate: 60 // Revalidate every minute
    };
  } catch (error) {
    return { notFound: true };
  }
};
```

### **App Router Implementation**
```typescript
// app/[...slug]/page.tsx - Next.js 13+ App Router
interface PageProps {
  params: { slug?: string[] };
}

export default async function DynamicPage({ params }: PageProps) {
  const slug = params.slug || [];
  const pagePath = '/' + slug.join('/');
  
  try {
    const pageResult = await api.getPageByPath({
      pagePath: pagePath || '/',
      channelName: 'website',
      languageCode: 'en-us'
    });
    
    const modules = processPageModules(pageResult.page);
    
    return (
      <div>
        <h1>{pageResult.page.title}</h1>
        {modules.map((module, index) => (
          <ModuleRenderer key={index} module={module} />
        ))}
      </div>
    );
  } catch (error) {
    notFound();
  }
}

// Generate static params for App Router
export async function generateStaticParams() {
  const sitemap = await api.getSitemapFlat({
    channelName: 'website',
    languageCode: 'en-us'
  });
  
  return Object.keys(sitemap)
    .filter(path => sitemap[path].visible.sitemap)
    .map(path => ({
      slug: path === '/' ? [] : path.split('/').filter(Boolean)
    }));
}
```

---

## 🔍 **Page SEO & Metadata**

### **SEO Data Extraction**
```typescript
function extractPageSEO(page: any, sitemapNode: any) {
  return {
    title: page.seo?.metaTitle || page.title || sitemapNode.title,
    description: page.seo?.metaDescription || '',
    keywords: page.seo?.metaKeywords || '',
    canonicalUrl: page.seo?.canonicalUrl || '',
    robots: {
      index: !page.seo?.noIndex,
      follow: !page.seo?.noFollow
    },
    openGraph: {
      title: page.seo?.ogTitle || page.title,
      description: page.seo?.ogDescription || page.seo?.metaDescription,
      image: page.seo?.ogImage?.url || '',
      type: page.seo?.ogType || 'website'
    },
    twitter: {
      card: page.seo?.twitterCard || 'summary',
      title: page.seo?.twitterTitle || page.title,
      description: page.seo?.twitterDescription || page.seo?.metaDescription,
      image: page.seo?.twitterImage?.url || page.seo?.ogImage?.url
    }
  };
}

// Usage in Next.js
export async function generateMetadata({ params }: PageProps) {
  const slug = params.slug || [];
  const pagePath = '/' + slug.join('/');
  
  const pageResult = await api.getPageByPath({
    pagePath,
    channelName: 'website',
    languageCode: 'en-us'
  });
  
  const seo = extractPageSEO(pageResult.page, pageResult.sitemapNode);
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: seo.robots,
    openGraph: seo.openGraph,
    twitter: seo.twitter
  };
}
```

### **Structured Data Generation**
```typescript
function generateStructuredData(page: any, sitemapNode: any) {
  const baseUrl = 'https://yoursite.com';
  
  // Basic page structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.seo?.metaDescription,
    url: `${baseUrl}${sitemapNode.path}`,
    dateModified: page.properties?.modified,
    inLanguage: 'en-US'
  };
  
  // Add breadcrumbs if available
  if (sitemapNode.breadcrumbs?.length > 0) {
    structuredData['breadcrumb'] = {
      '@type': 'BreadcrumbList',
      itemListElement: sitemapNode.breadcrumbs.map((crumb: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.title,
        item: `${baseUrl}${crumb.path}`
      }))
    };
  }
  
  return structuredData;
}
```

---

## 🎨 **Page Templates & Layouts**

### **Template-Based Rendering**
```typescript
// Define template components
const templateComponents = {
  'HomePage': HomePageTemplate,
  'BlogPost': BlogPostTemplate,
  'ProductPage': ProductPageTemplate,
  'ContactPage': ContactPageTemplate,
  'LandingPage': LandingPageTemplate
};

// Template renderer component
function PageTemplateRenderer({ page, modules }: any) {
  const TemplateComponent = templateComponents[page.pageTemplate];
  
  if (!TemplateComponent) {
    console.warn(`Template not found: ${page.pageTemplate}`);
    return <DefaultTemplate page={page} modules={modules} />;
  }
  
  return <TemplateComponent page={page} modules={modules} />;
}

// Template-specific module rendering
function HomePageTemplate({ page, modules }: any) {
  const heroModules = modules.filter((m: any) => m.zone === 'Hero');
  const mainModules = modules.filter((m: any) => m.zone === 'Main');
  const footerModules = modules.filter((m: any) => m.zone === 'Footer');
  
  return (
    <div className="home-page">
      <section className="hero">
        {heroModules.map((module: any, index: number) => (
          <ModuleRenderer key={index} module={module} />
        ))}
      </section>
      
      <main className="main-content">
        {mainModules.map((module: any, index: number) => (
          <ModuleRenderer key={index} module={module} />
        ))}
      </main>
      
      <footer className="footer">
        {footerModules.map((module: any, index: number) => (
          <ModuleRenderer key={index} module={module} />
        ))}
      </footer>
    </div>
  );
}
```

### **Layout Inheritance**
```typescript
// Base layout component
function BaseLayout({ children, page }: any) {
  return (
    <html lang="en">
      <head>
        <title>{page.title}</title>
        <meta name="description" content={page.seo?.metaDescription} />
        {page.scripts?.head && (
          <script dangerouslySetInnerHTML={{ __html: page.scripts.head }} />
        )}
      </head>
      <body>
        <div id="page-wrapper" className={`template-${page.pageTemplate}`}>
          {children}
        </div>
        {page.scripts?.body && (
          <script dangerouslySetInnerHTML={{ __html: page.scripts.body }} />
        )}
      </body>
    </html>
  );
}

// Template-specific layouts
function BlogLayout({ children, page }: any) {
  return (
    <BaseLayout page={page}>
      <header className="blog-header">
        <Navigation />
      </header>
      <div className="blog-container">
        <aside className="sidebar">
          <BlogSidebar />
        </aside>
        <main className="blog-content">
          {children}
        </main>
      </div>
    </BaseLayout>
  );
}
```

---

## 🔄 **Page Caching Strategies**

### **Static Generation with Revalidation**
```typescript
// Incremental Static Regeneration (ISR)
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pagePath = generatePathFromParams(params);
  
  try {
    const pageResult = await api.getPageByPath({
      pagePath,
      channelName: 'website',
      languageCode: 'en-us'
    });
    
    return {
      props: {
        page: pageResult.page,
        sitemapNode: pageResult.sitemapNode,
        modules: processPageModules(pageResult.page),
        generatedAt: new Date().toISOString()
      },
      revalidate: 60 // Revalidate every minute
    };
  } catch (error) {
    return { notFound: true };
  }
};
```

### **Server-Side Caching**
```typescript
// Redis-based page caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedPage(pagePath: string) {
  const cacheKey = `page:${pagePath}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const pageResult = await api.getPageByPath({
    pagePath,
    channelName: 'website',
    languageCode: 'en-us'
  });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(pageResult));
  
  return pageResult;
}
```

---

## 🔗 **Related Documentation**

- **Core APIs**: `fetch-sdk/core-apis.md`
- **Content Operations**: `fetch-sdk/content-operations.md`
- **Sitemap Operations**: `fetch-sdk/sitemap-operations.md`
- **Advanced Features**: `fetch-sdk/advanced-features.md`
- **Best Practices**: `fetch-sdk/best-practices.md`

---

This comprehensive guide covers all page operations in the Agility Fetch SDK, providing patterns for dynamic routing, module processing, and template-based rendering. 
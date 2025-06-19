# Agility CMS Fetch SDK - Sitemap Operations

This document covers sitemap operations including flat and nested sitemap retrieval, navigation building, breadcrumb generation, and URL redirection management.

---

## 🗺️ **Flat Sitemap Operations**

### **Basic Flat Sitemap Retrieval**
```typescript
const sitemapFlat = await api.getSitemapFlat({
  channelName: 'website',
  languageCode: 'en-us'
});

// Sitemap structure: { [path: string]: SitemapNode }
console.log(Object.keys(sitemapFlat)); // All page paths
```

### **Sitemap Node Properties**
```typescript
// Each sitemap node contains:
Object.keys(sitemapFlat).forEach(path => {
  const node = sitemapFlat[path];
  
  console.log({
    path: path,                    // URL path
    pageID: node.pageID,          // Page ID
    title: node.title,            // Page title
    name: node.name,              // Internal name
    menuText: node.menuText,      // Menu text override
    visible: {
      menu: node.visible.menu,        // Show in menu
      sitemap: node.visible.sitemap   // Show in sitemap
    },
    templateName: node.templateName,  // Page template
    redirectUrl: node.redirectUrl,    // Redirect target
    isFolder: node.isFolder,          // Is folder page
    parentID: node.parentID,          // Parent page ID
    sortOrder: node.sortOrder         // Sort order
  });
});
```

### **Next.js Static Path Generation**
```typescript
// Generate static paths for Next.js
export async function getStaticPaths() {
  const sitemap = await api.getSitemapFlat({
    channelName: 'website',
    languageCode: 'en-us'
  });
  
  const paths = Object.keys(sitemap)
    .filter(path => {
      const node = sitemap[path];
      return node.visible.sitemap && !node.redirectUrl;
    })
    .map(path => ({
      params: {
        slug: path === '/' ? [] : path.split('/').filter(Boolean)
      }
    }));
    
  return { 
    paths, 
    fallback: 'blocking' // Enable ISR for new pages
  };
}
```

### **Route Validation**
```typescript
// Check if a route exists in sitemap
function isValidRoute(path: string, sitemap: any): boolean {
  const normalizedPath = path === '' ? '/' : path;
  const node = sitemap[normalizedPath];
  
  return node && node.visible.sitemap && !node.redirectUrl;
}

// Get route metadata
function getRouteMetadata(path: string, sitemap: any) {
  const normalizedPath = path === '' ? '/' : path;
  const node = sitemap[normalizedPath];
  
  if (!node) {
    return null;
  }
  
  return {
    exists: true,
    visible: node.visible,
    isRedirect: !!node.redirectUrl,
    redirectUrl: node.redirectUrl,
    pageID: node.pageID,
    title: node.title,
    templateName: node.templateName
  };
}
```

---

## 🌳 **Nested Sitemap Operations**

### **Basic Nested Sitemap Retrieval**
```typescript
const sitemapNested = await api.getSitemapNested({
  channelName: 'website',
  languageCode: 'en-us'
});

// Nested structure with children arrays
console.log(sitemapNested); // Array of top-level pages with nested children
```

### **Navigation Menu Building**
```typescript
interface NavigationItem {
  title: string;
  path: string;
  children: NavigationItem[];
  visible: boolean;
  isActive?: boolean;
}

function buildNavigation(
  sitemapNodes: any[], 
  currentPath?: string,
  maxDepth: number = 3,
  currentDepth: number = 0
): NavigationItem[] {
  if (currentDepth >= maxDepth) {
    return [];
  }
  
  return sitemapNodes
    .filter(node => node.visible.menu && !node.redirectUrl)
    .map(node => ({
      title: node.menuText || node.title,
      path: node.path,
      visible: node.visible.menu,
      isActive: currentPath === node.path,
      children: node.children 
        ? buildNavigation(node.children, currentPath, maxDepth, currentDepth + 1)
        : []
    }))
    .sort((a, b) => (a as any).sortOrder - (b as any).sortOrder);
}

// Usage
const navigation = buildNavigation(sitemapNested, '/current-page');
```

### **Multi-Level Navigation Component**
```typescript
// React navigation component
function NavigationMenu({ items, level = 0 }: { items: NavigationItem[], level?: number }) {
  return (
    <ul className={`nav-level-${level}`}>
      {items.map((item, index) => (
        <li key={index} className={item.isActive ? 'active' : ''}>
          <a href={item.path}>{item.title}</a>
          {item.children.length > 0 && (
            <NavigationMenu items={item.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// Usage
<NavigationMenu items={navigation} />
```

### **Breadcrumb Generation**
```typescript
function generateBreadcrumbs(
  targetPath: string, 
  sitemapFlat: any
): Array<{ title: string; path: string }> {
  const breadcrumbs = [];
  const pathSegments = targetPath.split('/').filter(Boolean);
  
  let currentPath = '';
  
  // Add home if not root
  if (targetPath !== '/') {
    const homeNode = sitemapFlat['/'];
    if (homeNode) {
      breadcrumbs.push({
        title: homeNode.title,
        path: '/'
      });
    }
  }
  
  // Build breadcrumbs from path segments
  pathSegments.forEach((segment, index) => {
    currentPath += '/' + segment;
    const node = sitemapFlat[currentPath];
    
    if (node && node.visible.sitemap) {
      breadcrumbs.push({
        title: node.title,
        path: currentPath
      });
    }
  });
  
  return breadcrumbs;
}

// Usage
const breadcrumbs = generateBreadcrumbs('/blog/category/post', sitemapFlat);

// React breadcrumb component
function Breadcrumbs({ items }: { items: Array<{ title: string; path: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index === items.length - 1 ? (
              <span aria-current="page">{item.title}</span>
            ) : (
              <a href={item.path}>{item.title}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## 🎯 **Advanced Navigation Patterns**

### **Mega Menu Builder**
```typescript
interface MegaMenuItem extends NavigationItem {
  description?: string;
  image?: string;
  featured?: boolean;
  category?: string;
}

function buildMegaMenu(
  sitemapNested: any[],
  currentPath?: string
): MegaMenuItem[] {
  return sitemapNested
    .filter(node => node.visible.menu)
    .map(node => {
      const item: MegaMenuItem = {
        title: node.menuText || node.title,
        path: node.path,
        visible: node.visible.menu,
        isActive: currentPath === node.path,
        children: [],
        description: node.metaDescription,
        image: node.image?.url,
        featured: node.customData?.featured === true,
        category: node.customData?.category
      };
      
      // Process children for mega menu columns
      if (node.children && node.children.length > 0) {
        item.children = buildMegaMenu(node.children, currentPath);
      }
      
      return item;
    });
}

// Group mega menu items by category
function groupMegaMenuByCategory(items: MegaMenuItem[]) {
  const grouped: { [key: string]: MegaMenuItem[] } = {};
  
  items.forEach(item => {
    const category = item.category || 'default';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return grouped;
}
```

### **Sidebar Navigation**
```typescript
function buildSidebarNavigation(
  sitemapNested: any[],
  currentPath: string,
  parentPath?: string
): NavigationItem[] {
  // Find current section
  let currentSection = null;
  
  function findSection(nodes: any[], path: string): any {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        const found = findSection(node.children, path);
        if (found) return node; // Return parent section
      }
    }
    return null;
  }
  
  currentSection = findSection(sitemapNested, currentPath);
  
  if (!currentSection || !currentSection.children) {
    return [];
  }
  
  // Build sidebar from current section's children
  return buildNavigation(currentSection.children, currentPath, 2);
}

// Usage
const sidebarNav = buildSidebarNavigation(sitemapNested, '/products/category-a/product-1');
```

---

## 🔄 **URL Redirection Management**

### **Get URL Redirections**
```typescript
const redirections = await api.getUrlRedirections({
  lastAccessDate: new Date('2023-01-01')
});

console.log(redirections.items); // Array of redirections
console.log(redirections.totalCount); // Total count

// Process redirections
redirections.items.forEach(redirect => {
  console.log({
    originUrl: redirect.originUrl,
    destinationUrl: redirect.destinationUrl,
    statusCode: redirect.statusCode, // 301 or 302
    created: redirect.created,
    lastAccessed: redirect.lastAccessed
  });
});
```

### **Next.js Redirects Configuration**
```typescript
// next.config.js
export async function getRedirects() {
  const redirections = await api.getUrlRedirections();
  
  return redirections.items.map(redirect => ({
    source: redirect.originUrl,
    destination: redirect.destinationUrl,
    permanent: redirect.statusCode === 301
  }));
}

// In next.config.js
module.exports = {
  async redirects() {
    return await getRedirects();
  }
};
```

### **Runtime Redirect Handling**
```typescript
// Middleware for handling redirects
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check for redirects (you'd cache this data)
  const redirect = findRedirect(path);
  
  if (redirect) {
    return NextResponse.redirect(
      new URL(redirect.destinationUrl, request.url),
      redirect.statusCode
    );
  }
  
  return NextResponse.next();
}

// Redirect lookup function
function findRedirect(path: string) {
  // This would typically check a cached version of redirects
  // or query a database/cache service
  return redirectsCache[path];
}
```

### **Redirect Cache Management**
```typescript
// Redis-based redirect caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class RedirectManager {
  private cacheKey = 'agility:redirects';
  private cacheTTL = 3600; // 1 hour
  
  async refreshRedirects() {
    const redirections = await api.getUrlRedirections();
    
    // Build redirect map
    const redirectMap: { [key: string]: any } = {};
    redirections.items.forEach(redirect => {
      redirectMap[redirect.originUrl] = {
        destination: redirect.destinationUrl,
        statusCode: redirect.statusCode,
        lastAccessed: redirect.lastAccessed
      };
    });
    
    // Cache redirects
    await redis.setex(
      this.cacheKey, 
      this.cacheTTL, 
      JSON.stringify(redirectMap)
    );
    
    return redirectMap;
  }
  
  async getRedirect(path: string) {
    const cached = await redis.get(this.cacheKey);
    
    if (!cached) {
      await this.refreshRedirects();
      return this.getRedirect(path);
    }
    
    const redirects = JSON.parse(cached);
    return redirects[path];
  }
}

const redirectManager = new RedirectManager();
```

---

## 🔍 **Sitemap Analysis & Utilities**

### **Sitemap Statistics**
```typescript
function analyzeSitemap(sitemapFlat: any) {
  const stats = {
    totalPages: 0,
    visiblePages: 0,
    hiddenPages: 0,
    redirects: 0,
    folders: 0,
    byTemplate: {} as { [key: string]: number },
    byDepth: {} as { [key: number]: number }
  };
  
  Object.keys(sitemapFlat).forEach(path => {
    const node = sitemapFlat[path];
    const depth = path === '/' ? 0 : path.split('/').length - 1;
    
    stats.totalPages++;
    
    if (node.visible.sitemap) stats.visiblePages++;
    else stats.hiddenPages++;
    
    if (node.redirectUrl) stats.redirects++;
    if (node.isFolder) stats.folders++;
    
    // Template statistics
    const template = node.templateName || 'unknown';
    stats.byTemplate[template] = (stats.byTemplate[template] || 0) + 1;
    
    // Depth statistics
    stats.byDepth[depth] = (stats.byDepth[depth] || 0) + 1;
  });
  
  return stats;
}

// Usage
const stats = analyzeSitemap(sitemapFlat);
console.log('Sitemap Statistics:', stats);
```

### **Sitemap Validation**
```typescript
function validateSitemap(sitemapFlat: any) {
  const issues = [];
  
  Object.keys(sitemapFlat).forEach(path => {
    const node = sitemapFlat[path];
    
    // Check for missing titles
    if (!node.title || node.title.trim() === '') {
      issues.push({
        type: 'missing_title',
        path,
        message: 'Page has no title'
      });
    }
    
    // Check for broken redirects
    if (node.redirectUrl && !isValidUrl(node.redirectUrl)) {
      issues.push({
        type: 'invalid_redirect',
        path,
        message: `Invalid redirect URL: ${node.redirectUrl}`
      });
    }
    
    // Check for orphaned pages (no parent in sitemap)
    if (node.parentID && !findPageById(sitemapFlat, node.parentID)) {
      issues.push({
        type: 'orphaned_page',
        path,
        message: 'Page parent not found in sitemap'
      });
    }
  });
  
  return issues;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function findPageById(sitemap: any, pageID: number) {
  return Object.values(sitemap).find((node: any) => node.pageID === pageID);
}
```

### **Sitemap Export Utilities**
```typescript
// Export sitemap as XML
function generateSitemapXML(sitemapFlat: any, baseUrl: string): string {
  const urls = Object.keys(sitemapFlat)
    .filter(path => {
      const node = sitemapFlat[path];
      return node.visible.sitemap && !node.redirectUrl;
    })
    .map(path => {
      const node = sitemapFlat[path];
      const url = `${baseUrl}${path}`;
      const lastmod = node.lastModified || new Date().toISOString();
      
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('\n');
    
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Export as JSON for frontend consumption
function generateNavigationJSON(sitemapNested: any[]) {
  return JSON.stringify(buildNavigation(sitemapNested), null, 2);
}
```

---

## 🔗 **Related Documentation**

- **Core APIs**: `fetch-sdk/core-apis.md`
- **Content Operations**: `fetch-sdk/content-operations.md`
- **Page Operations**: `fetch-sdk/page-operations.md`
- **Advanced Features**: `fetch-sdk/advanced-features.md`
- **Best Practices**: `fetch-sdk/best-practices.md`

---

This comprehensive guide covers all sitemap operations in the Agility Fetch SDK, providing patterns for navigation building, breadcrumb generation, and redirect management. 
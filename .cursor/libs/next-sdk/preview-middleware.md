# Next.js SDK - Preview Mode & Middleware

This guide covers implementing preview mode and middleware configuration for Agility CMS with Next.js, enabling seamless content preview functionality.

---

## 🔍 **Preview Mode Setup**

### **Preview Middleware**

Create middleware to handle Agility CMS preview mode:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Handle Agility preview mode
  if (searchParams.get('agilitypreview') === 'true') {
    const securityKey = searchParams.get('key');
    
    // Validate security key
    if (securityKey === process.env.AGILITY_SECURITY_KEY) {
      // Clone the request URL and add preview parameter
      const url = request.nextUrl.clone();
      url.searchParams.set('preview', 'true');
      url.searchParams.delete('agilitypreview');
      url.searchParams.delete('key');
      
      return NextResponse.redirect(url);
    } else {
      // Invalid key - redirect to regular page
      const url = request.nextUrl.clone();
      url.searchParams.delete('agilitypreview');
      url.searchParams.delete('key');
      
      return NextResponse.redirect(url);
    }
  }
  
  // Handle draft mode for preview
  if (searchParams.get('preview') === 'true') {
    const response = NextResponse.next();
    response.cookies.set('__prerender_bypass', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    return response;
  }
  
  // Handle preview exit
  if (searchParams.get('exit-preview') === 'true') {
    const url = request.nextUrl.clone();
    url.searchParams.delete('exit-preview');
    url.searchParams.delete('preview');
    
    const response = NextResponse.redirect(url);
    response.cookies.delete('__prerender_bypass');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### **Preview API Route**

Create an API route to handle preview mode activation:

```typescript
// app/api/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';
  
  // Check the secret and next parameters
  if (secret !== process.env.AGILITY_SECURITY_KEY) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
  
  // Enable Preview Mode by setting the cookies
  const response = NextResponse.redirect(new URL(`${slug}?preview=true`, request.url));
  
  response.cookies.set('__prerender_bypass', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return response;
}
```

### **Exit Preview API Route**

Allow users to exit preview mode:

```typescript
// app/api/exit-preview/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/';
  
  // Clear the preview mode cookies
  const response = NextResponse.redirect(new URL(redirect, request.url));
  
  response.cookies.delete('__prerender_bypass');
  
  return response;
}
```

---

## 🎛️ **Preview Mode Integration**

### **Page Component with Preview**

Integrate preview mode into your page components:

```typescript
// app/[...slug]/page.tsx
import { getAgilityPageProps } from '@/lib/cms/getAgilityPageProps';
import { AgilityPageTemplate } from '@/components/agility-components';
import { PreviewBanner } from '@/components/common/PreviewBanner';

interface PageProps {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { preview } = searchParams;
  const isPreview = preview === 'true';
  
  const agilityProps = await getAgilityPageProps({
    params,
    preview: isPreview,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });

  if (!agilityProps.page) {
    return <div>Page not found</div>;
  }

  return (
    <>
      {isPreview && <PreviewBanner />}
      <AgilityPageTemplate {...agilityProps} />
    </>
  );
}

// Disable caching for preview mode
export const dynamic = 'force-dynamic';
```

### **Preview Banner Component**

Create a preview banner to indicate preview mode:

```typescript
// components/common/PreviewBanner.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-sm font-medium">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse"></span>
          <span>Preview Mode Active - You are viewing draft content</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/api/exit-preview"
            className="bg-black text-yellow-500 px-3 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
          >
            Exit Preview
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-black hover:text-gray-700 transition-colors"
            aria-label="Close banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 **Advanced Middleware Patterns**

### **Multi-Site Middleware**

Handle multiple Agility sites with different configurations:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

interface SiteConfig {
  guid: string;
  securityKey: string;
  locale: string;
  sitemap: string;
}

const siteConfigs: Record<string, SiteConfig> = {
  'site1.example.com': {
    guid: process.env.AGILITY_GUID_SITE1!,
    securityKey: process.env.AGILITY_SECURITY_KEY_SITE1!,
    locale: 'en-us',
    sitemap: 'website'
  },
  'site2.example.com': {
    guid: process.env.AGILITY_GUID_SITE2!,
    securityKey: process.env.AGILITY_SECURITY_KEY_SITE2!,
    locale: 'fr-ca',
    sitemap: 'website'
  }
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const siteConfig = siteConfigs[hostname];
  
  if (!siteConfig) {
    return NextResponse.next();
  }
  
  const { searchParams } = request.nextUrl;
  
  // Handle preview mode with site-specific security key
  if (searchParams.get('agilitypreview') === 'true') {
    const securityKey = searchParams.get('key');
    
    if (securityKey === siteConfig.securityKey) {
      const url = request.nextUrl.clone();
      url.searchParams.set('preview', 'true');
      url.searchParams.set('site', hostname);
      url.searchParams.delete('agilitypreview');
      url.searchParams.delete('key');
      
      return NextResponse.redirect(url);
    }
  }
  
  // Add site context to headers
  const response = NextResponse.next();
  response.headers.set('x-agility-site', hostname);
  response.headers.set('x-agility-guid', siteConfig.guid);
  response.headers.set('x-agility-locale', siteConfig.locale);
  
  return response;
}
```

### **Locale-Based Routing**

Handle multi-language routing with middleware:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en-us', 'fr-ca', 'es-mx'];
const defaultLocale = 'en-us';

function getLocale(request: NextRequest): string {
  // Check URL pathname for locale
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  if (pathnameIsMissingLocale) {
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => locales.includes(lang)) || defaultLocale;
    
    return preferredLocale;
  }
  
  return pathname.split('/')[1];
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = getLocale(request);
  
  // Handle locale redirect
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
  
  // Handle preview mode with locale context
  const { searchParams } = request.nextUrl;
  if (searchParams.get('agilitypreview') === 'true') {
    const securityKey = searchParams.get('key');
    
    if (securityKey === process.env.AGILITY_SECURITY_KEY) {
      const url = request.nextUrl.clone();
      url.searchParams.set('preview', 'true');
      url.searchParams.set('locale', locale);
      url.searchParams.delete('agilitypreview');
      url.searchParams.delete('key');
      
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}
```

---

## 🛡️ **Security Considerations**

### **Preview Security**

Implement robust security for preview mode:

```typescript
// lib/preview-security.ts
import { NextRequest } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

export function validatePreviewKey(providedKey: string, expectedKey: string): boolean {
  if (!providedKey || !expectedKey) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  const providedHash = createHash('sha256').update(providedKey).digest();
  const expectedHash = createHash('sha256').update(expectedKey).digest();
  
  return timingSafeEqual(providedHash, expectedHash);
}

export function generatePreviewUrl(basePath: string, securityKey: string): string {
  const url = new URL(basePath, process.env.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set('agilitypreview', 'true');
  url.searchParams.set('key', securityKey);
  return url.toString();
}

export function isValidPreviewRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Check if request is coming from Agility CMS
  const isFromAgility = referer.includes('agilitycms.com') || 
                       referer.includes('agility.com') ||
                       userAgent.includes('Agility');
  
  return isFromAgility;
}
```

### **Rate Limiting**

Implement rate limiting for preview endpoints:

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimit = new Map();

export function checkRateLimit(request: NextRequest, limit: number = 10, window: number = 60000): boolean {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowStart = now - window;
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip);
  
  // Remove old requests
  const recentRequests = requests.filter((time: number) => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  
  return true;
}
```

---

## 🔧 **Development Tools**

### **Preview Mode Debugging**

Add debugging utilities for preview mode:

```typescript
// lib/preview-debug.ts
export function debugPreviewMode(request: any) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('Preview Mode Debug:', {
    searchParams: Object.fromEntries(request.nextUrl.searchParams),
    cookies: request.cookies.getAll(),
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'referer': request.headers.get('referer'),
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
    },
    timestamp: new Date().toISOString(),
  });
}
```

### **Preview Mode Hook**

Create a React hook to detect preview mode:

```typescript
// hooks/usePreviewMode.ts
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function usePreviewMode() {
  const searchParams = useSearchParams();
  const [isPreview, setIsPreview] = useState(false);
  
  useEffect(() => {
    const preview = searchParams.get('preview') === 'true';
    setIsPreview(preview);
  }, [searchParams]);
  
  return {
    isPreview,
    exitPreview: () => {
      window.location.href = '/api/exit-preview';
    },
  };
}
```

---

## 🔗 **Related Documentation**

- [App Router Setup](./app-router-setup.md) - Basic Next.js configuration
- [Data Fetching](./data-fetching.md) - Content fetching with preview support
- [Caching & Performance](./caching-performance.md) - Caching strategies
- [TypeScript Definitions](./typescript-definitions.md) - Type definitions
- [Deployment](./deployment-production.md) - Production deployment 
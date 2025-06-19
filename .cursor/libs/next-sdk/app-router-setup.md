---
title: "Agility Next.js SDK - App Router Setup"
description: "Next.js 15 App Router configuration and project structure for Agility CMS integration"
type: "sdk-documentation"
category: "next-sdk"
tags: ["nextjs", "app-router", "setup", "configuration", "agility-nextjs"]
sdk: "nextjs"
complexity: "intermediate"
lines: 400
version: "1.0"
last_updated: "2024-12-19"
related_files: ["data-fetching.md", "component-development.md", "deployment-production.md"]
keywords: ["App Router", "Next.js 15", "getAgilityPaths", "dynamic routing", "project structure"]
framework: "nextjs"
nextjs_version: "15"
---

# Agility CMS Next.js SDK - App Router Setup

This document covers setting up Next.js 15 with the App Router for Agility CMS integration, including project structure and configuration.

---

## 🏗️ **Project Structure**

### **Recommended Directory Structure**
```
project/
├── app/
│   ├── [...slug]/
│   │   └── page.tsx              # Dynamic catch-all route
│   ├── api/
│   │   ├── revalidate/
│   │   │   └── route.ts          # On-demand revalidation
│   │   └── preview/
│   │       └── route.ts          # Preview mode handler
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── agility-components/      # Agility page modules
│   │   ├── RichTextArea.tsx
│   │   ├── PostsListing.tsx
│   │   ├── FeaturedPost.tsx
│   │   └── index.ts            # Component registry
│   ├── common/                 # Shared components
│   │   ├── AgilityPic.tsx      # Optimized image component
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   └── ui/                     # UI components
├── lib/
│   ├── cms/
│   │   ├── getAgilityPageProps.ts
│   │   ├── getAgilityPaths.ts
│   │   ├── cms-content.ts      # Content fetching utilities
│   │   └── agility-client.ts   # API client setup
│   ├── types/                  # TypeScript definitions
│   │   ├── agility.ts
│   │   └── content.ts
│   └── utils/                  # Utility functions
├── middleware.ts               # Preview mode handling
├── next.config.js
└── .env.local
```

---

## 🔧 **Environment Configuration**

### **Environment Variables**
```bash
# .env.local

# Required Agility CMS Credentials
AGILITY_GUID=your-instance-guid
AGILITY_API_FETCH_KEY=your-fetch-api-key
AGILITY_API_PREVIEW_KEY=your-preview-api-key
AGILITY_SECURITY_KEY=your-security-key

# Content Configuration
AGILITY_LOCALE=en-us
AGILITY_SITEMAP=website

# Caching Control (Next.js 15+)
AGILITY_FETCH_CACHE_DURATION=3600    # SDK object caching (seconds)
AGILITY_PATH_REVALIDATE_DURATION=86400  # Next.js path revalidation (seconds)

# Optional Settings
AGILITY_DEBUG=false
AGILITY_CDN_URL=https://cdn.aglty.io
```

### **Environment Validation**
```typescript
// lib/cms/agility-client.ts
interface AgilityConfig {
  guid: string;
  apiKey: string;
  previewKey: string;
  securityKey: string;
  locale: string;
  sitemap: string;
  cacheDuration: number;
  pathRevalidate: number;
}

function validateEnvironment(): AgilityConfig {
  const requiredVars = [
    'AGILITY_GUID',
    'AGILITY_API_FETCH_KEY',
    'AGILITY_API_PREVIEW_KEY',
    'AGILITY_SECURITY_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    guid: process.env.AGILITY_GUID!,
    apiKey: process.env.AGILITY_API_FETCH_KEY!,
    previewKey: process.env.AGILITY_API_PREVIEW_KEY!,
    securityKey: process.env.AGILITY_SECURITY_KEY!,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website',
    cacheDuration: parseInt(process.env.AGILITY_FETCH_CACHE_DURATION || '3600'),
    pathRevalidate: parseInt(process.env.AGILITY_PATH_REVALIDATE_DURATION || '86400')
  };
}

export const agilityConfig = validateEnvironment();
```

---

## 📄 **Dynamic Routing Setup**

### **Catch-All Route (`app/[...slug]/page.tsx`)**
```typescript
import { getAgilityPageProps, getAgilityPaths } from '@/lib/cms/getAgilityPageProps';
import { AgilityPageTemplate } from '@/components/agility-components';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate static paths for all pages
export async function generateStaticParams() {
  const paths = await getAgilityPaths({
    preview: false,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });
  
  return paths.map((path: string) => ({
    slug: path === '/' ? [] : path.split('/').filter(Boolean)
  }));
}

// Set revalidation time for ISR
export const revalidate = parseInt(process.env.AGILITY_PATH_REVALIDATE_DURATION || '86400');

// Main page component
export default async function Page({ params, searchParams }: PageProps) {
  const { preview } = searchParams;
  const isPreview = preview === 'true';
  
  const agilityProps = await getAgilityPageProps({
    params,
    preview: isPreview,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });

  if (!agilityProps || !agilityProps.page) {
    notFound();
  }

  return <AgilityPageTemplate {...agilityProps} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { preview } = searchParams;
  const isPreview = preview === 'true';
  
  const agilityProps = await getAgilityPageProps({
    params,
    preview: isPreview,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });

  if (!agilityProps?.page) {
    return {
      title: 'Page Not Found'
    };
  }

  const { page, sitemapNode } = agilityProps;

  return {
    title: page.seo?.metaTitle || page.title || sitemapNode?.title,
    description: page.seo?.metaDescription || '',
    keywords: page.seo?.metaKeywords || '',
    openGraph: {
      title: page.seo?.ogTitle || page.title,
      description: page.seo?.ogDescription || page.seo?.metaDescription,
      images: page.seo?.ogImage ? [{ url: page.seo.ogImage.url }] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo?.twitterTitle || page.title,
      description: page.seo?.twitterDescription || page.seo?.metaDescription,
      images: page.seo?.twitterImage ? [page.seo.twitterImage.url] : []
    },
    robots: {
      index: !page.seo?.noIndex,
      follow: !page.seo?.noFollow
    }
  };
}
```

### **Home Page (`app/page.tsx`)**
```typescript
import { getAgilityPageProps } from '@/lib/cms/getAgilityPageProps';
import { AgilityPageTemplate } from '@/components/agility-components';
import { notFound } from 'next/navigation';

export const revalidate = parseInt(process.env.AGILITY_PATH_REVALIDATE_DURATION || '86400');

export default async function HomePage() {
  const agilityProps = await getAgilityPageProps({
    params: { slug: [] }, // Home page
    preview: false,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });

  if (!agilityProps?.page) {
    notFound();
  }

  return <AgilityPageTemplate {...agilityProps} />;
}

export async function generateMetadata() {
  const agilityProps = await getAgilityPageProps({
    params: { slug: [] },
    preview: false,
    locale: process.env.AGILITY_LOCALE || 'en-us',
    sitemap: process.env.AGILITY_SITEMAP || 'website'
  });

  if (!agilityProps?.page) {
    return { title: 'Home' };
  }

  const { page } = agilityProps;

  return {
    title: page.seo?.metaTitle || page.title || 'Home',
    description: page.seo?.metaDescription || '',
    openGraph: {
      title: page.seo?.ogTitle || page.title,
      description: page.seo?.ogDescription || page.seo?.metaDescription,
      type: 'website'
    }
  };
}
```

---

## 🎨 **Root Layout Configuration**

### **Root Layout (`app/layout.tsx`)**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Your Site Name',
    default: 'Your Site Name'
  },
  description: 'Your site description',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
```

---

## 🔄 **API Routes**

### **Revalidation API Route (`app/api/revalidate/route.ts`)**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // Validate secret
  if (secret !== process.env.AGILITY_SECURITY_KEY) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, type } = body;

    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    } else if (type) {
      // Revalidate by content type
      revalidateTag(type);
      console.log(`Revalidated content type: ${type}`);
    } else {
      // Revalidate all paths
      revalidatePath('/', 'layout');
      console.log('Revalidated all paths');
    }

    return NextResponse.json({ 
      message: 'Revalidation successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Revalidation failed', error: error.message },
      { status: 500 }
    );
  }
}
```

### **Preview Mode API Route (`app/api/preview/route.ts`)**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';

  // Validate secret
  if (secret !== process.env.AGILITY_SECURITY_KEY) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  // Redirect to the path with preview mode enabled
  const previewUrl = `${slug}?preview=true`;
  
  return NextResponse.redirect(new URL(previewUrl, request.url));
}

export async function POST(request: NextRequest) {
  // Exit preview mode
  return NextResponse.redirect(new URL('/', request.url));
}
```

---

## ⚙️ **Next.js Configuration**

### **Next.js Config (`next.config.js`)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.aglty.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.aglty.io',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Enable Server Components caching
    serverComponentsExternalPackages: ['@agility/content-fetch'],
  },

  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Custom webpack config for Agility SDK
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only packages from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  // Redirect configuration
  async redirects() {
    return [
      // Add any custom redirects here
    ];
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 🛡️ **Middleware Configuration**

### **Middleware (`middleware.ts`)**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isPreview = searchParams.get('preview') === 'true';

  // Handle preview mode
  if (isPreview) {
    // Add preview headers
    const response = NextResponse.next();
    response.headers.set('x-agility-preview', 'true');
    return response;
  }

  // Handle other middleware logic
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

---

## 🚀 **Getting Started Commands**

### **Installation**
```bash
# Create new Next.js project
npx create-next-app@latest my-agility-site --typescript --tailwind --eslint --app

# Navigate to project
cd my-agility-site

# Install Agility CMS SDK
npm install @agility/nextjs @agility/content-fetch

# Install additional dependencies
npm install next@latest react@latest react-dom@latest
```

### **Development**
```bash
# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔗 **Related Documentation**

- **Component Development**: `next-sdk/component-development.md`
- **Data Fetching**: `next-sdk/data-fetching.md`
- **Image Optimization**: `next-sdk/image-optimization.md`
- **Caching Strategies**: `next-sdk/caching-strategies.md`
- **Preview Mode**: `next-sdk/preview-mode.md`
- **Best Practices**: `next-sdk/best-practices.md`

---

This setup provides a solid foundation for building Next.js applications with Agility CMS using the App Router architecture. 
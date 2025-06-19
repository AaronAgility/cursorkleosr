# Agility CMS Next.js SDK - Deployment & Production

This document covers production deployment strategies, performance monitoring, and best practices for Next.js applications using Agility CMS.

---

## 🚀 **Vercel Deployment**

### **Project Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.aglty.io'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@agility/nextjs']
  },
  env: {
    AGILITY_GUID: process.env.AGILITY_GUID,
    AGILITY_API_FETCH_KEY: process.env.AGILITY_API_FETCH_KEY,
    AGILITY_API_PREVIEW_KEY: process.env.AGILITY_API_PREVIEW_KEY,
    AGILITY_SECURITY_KEY: process.env.AGILITY_SECURITY_KEY
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  async redirects() {
    const { getRedirects } = await import('./lib/agility/redirects');
    return await getRedirects();
  }
};

module.exports = nextConfig;
```

### **Vercel Configuration**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "AGILITY_GUID": "@agility_guid",
    "AGILITY_API_FETCH_KEY": "@agility_api_fetch_key",
    "AGILITY_API_PREVIEW_KEY": "@agility_api_preview_key",
    "AGILITY_SECURITY_KEY": "@agility_security_key"
  },
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=60"
        }
      ]
    }
  ]
}
```

### **Environment Variables Setup**
```bash
# Production Environment Variables
AGILITY_GUID=your-production-guid
AGILITY_API_FETCH_KEY=your-production-fetch-key
AGILITY_API_PREVIEW_KEY=your-production-preview-key
AGILITY_SECURITY_KEY=your-security-key

# Optional: Regional Settings
AGILITY_BASE_URL=https://api.aglty.io
AGILITY_LOCALE=en-us

# Performance Settings
NEXT_REVALIDATE_TOKEN=your-revalidate-token
ENABLE_EXPERIMENTAL_FEATURES=true

# Monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn
```

---

## 📊 **Performance Monitoring**

### **Web Vitals Tracking**
```typescript
// lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: any) {
  // Send to your analytics provider
  if (process.env.VERCEL_ANALYTICS_ID) {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href
      })
    });
  }
}

// pages/_app.tsx
import { reportWebVitals } from '../lib/analytics/web-vitals';

export function reportWebVitals(metric: any) {
  reportWebVitals();
}
```

### **Performance API Routes**
```typescript
// pages/api/analytics.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, value, id, delta, url } = req.body;

  try {
    // Log to your monitoring service
    await logMetric({
      metric: name,
      value,
      delta,
      url,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to log metric' });
  }
}

async function logMetric(data: any) {
  // Send to DataDog, New Relic, or your preferred service
  if (process.env.DATADOG_API_KEY) {
    await fetch('https://api.datadoghq.com/api/v1/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DATADOG_API_KEY
      },
      body: JSON.stringify({
        series: [{
          metric: `nextjs.webvitals.${data.metric}`,
          points: [[Date.now() / 1000, data.value]],
          tags: [`url:${data.url}`]
        }]
      })
    });
  }
}
```

### **Build Performance Monitoring**
```typescript
// scripts/build-monitor.js
const fs = require('fs');
const path = require('path');

class BuildMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {};
  }

  trackBuildSize() {
    const buildDir = '.next';
    const staticDir = path.join(buildDir, 'static');
    
    if (fs.existsSync(staticDir)) {
      const stats = this.getDirectorySize(staticDir);
      this.metrics.buildSize = {
        total: stats.size,
        files: stats.files,
        chunks: this.getChunkSizes()
      };
    }
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const subDir = this.getDirectorySize(filePath);
        totalSize += subDir.size;
        fileCount += subDir.files;
      } else {
        totalSize += stat.size;
        fileCount++;
      }
    }
    
    return { size: totalSize, files: fileCount };
  }

  getChunkSizes() {
    const chunksPath = '.next/static/chunks';
    if (!fs.existsSync(chunksPath)) return {};
    
    const chunks = {};
    const files = fs.readdirSync(chunksPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksPath, file);
        const stat = fs.statSync(filePath);
        chunks[file] = stat.size;
      }
    }
    
    return chunks;
  }

  generateReport() {
    this.trackBuildSize();
    
    const report = {
      ...this.metrics,
      buildTime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };

    // Save report
    fs.writeFileSync(
      '.next/build-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('📊 Build Report:');
    console.log(`Build Time: ${report.buildTime}ms`);
    console.log(`Total Size: ${(report.buildSize.total / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Files: ${report.buildSize.files}`);

    return report;
  }
}

// Run after build
if (require.main === module) {
  const monitor = new BuildMonitor();
  monitor.generateReport();
}
```

---

## 🔧 **Production Optimizations**

### **Image Optimization**
```typescript
// components/OptimizedImage.tsx
import { AgilityPic } from '@agility/nextjs';
import { useState } from 'react';

interface OptimizedImageProps {
  image: any;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  image,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!image?.url) return null;

  return (
    <div className={`relative ${className}`}>
      <AgilityPic
        image={image}
        alt={alt}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

### **Bundle Analysis**
```javascript
// scripts/analyze-bundle.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html'
        })
      );
    }
    return config;
  }
};

// package.json scripts
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "analyze:server": "BUNDLE_ANALYZE=server npm run build",
    "analyze:browser": "BUNDLE_ANALYZE=browser npm run build"
  }
}
```

### **Code Splitting Strategy**
```typescript
// lib/dynamic-imports.ts
import dynamic from 'next/dynamic';

// Lazy load heavy components
export const DynamicChart = dynamic(
  () => import('../components/Chart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false
  }
);

export const DynamicEditor = dynamic(
  () => import('../components/RichTextEditor'),
  {
    loading: () => <div>Loading editor...</div>,
    ssr: false
  }
);

// Module-level splitting for large libraries
export const loadChartLibrary = () => 
  import('chart.js').then(mod => mod.default);

export const loadDateLibrary = () =>
  import('date-fns').then(mod => mod);
```

---

## 🔍 **Error Tracking & Debugging**

### **Sentry Integration**
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null; // Don't send chunk load errors
      }
    }
    return event;
  }
});

// Custom error boundary
export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.captureException(error, {
      contexts: {
        react: errorInfo
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### **Logging Strategy**
```typescript
// lib/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: 'agility-nextjs',
    environment: process.env.NODE_ENV
  },
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

export const logAgilityError = (operation: string, error: Error, context?: any) => {
  logger.error('Agility CMS Error', {
    operation,
    error: error.message,
    stack: error.stack,
    context
  });
};

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance Metric', {
    operation,
    duration,
    metadata
  });
};
```

---

## 🔒 **Security & Compliance**

### **Security Headers**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https://cdn.aglty.io; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  );

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
```

### **API Security**
```typescript
// lib/auth/api-security.ts
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export const withRateLimit = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise((resolve, reject) => {
      limiter(req as any, res as any, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });

    return handler(req, res);
  };
};

// API key validation
export const validateApiKey = (req: NextApiRequest): boolean => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_SECRET_KEY;
  
  if (!apiKey || !expectedKey) {
    return false;
  }

  return createHash('sha256').update(apiKey as string).digest('hex') === 
         createHash('sha256').update(expectedKey).digest('hex');
};
```

---

## 📈 **SEO & Performance**

### **Advanced SEO Setup**
```typescript
// lib/seo/metadata.ts
import { Metadata } from 'next';

export function generateMetadata(page: any, sitemap: any): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yoursite.com';
  const pageUrl = `${baseUrl}${page.path}`;
  
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.excerpt,
    keywords: page.seo?.metaKeywords,
    openGraph: {
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt,
      url: pageUrl,
      siteName: 'Your Site Name',
      images: page.seo?.ogImage ? [{
        url: page.seo.ogImage.url,
        width: page.seo.ogImage.width,
        height: page.seo.ogImage.height,
        alt: page.seo.ogImage.alt
      }] : [],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt,
      images: page.seo?.ogImage ? [page.seo.ogImage.url] : []
    },
    robots: {
      index: page.seo?.noIndex !== true,
      follow: page.seo?.noFollow !== true,
      googleBot: {
        index: page.seo?.noIndex !== true,
        follow: page.seo?.noFollow !== true
      }
    },
    alternates: {
      canonical: pageUrl
    }
  };
}
```

### **Structured Data**
```typescript
// lib/seo/structured-data.ts
export function generateStructuredData(page: any, type: 'article' | 'webpage' = 'webpage') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    '@id': `${baseUrl}${page.path}`,
    url: `${baseUrl}${page.path}`,
    name: page.title,
    headline: page.title,
    description: page.excerpt,
    datePublished: page.publishedDate,
    dateModified: page.modifiedDate
  };

  if (type === 'article' && page.author) {
    return {
      ...baseSchema,
      author: {
        '@type': 'Person',
        name: page.author.name,
        url: page.author.url
      },
      publisher: {
        '@type': 'Organization',
        name: 'Your Organization',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      }
    };
  }

  return baseSchema;
}
```

---

## 🔗 **Related Documentation**

- **App Router Setup**: `next-sdk/app-router-setup.md`
- **Data Fetching**: `next-sdk/data-fetching.md`
- **Caching & Performance**: `next-sdk/caching-performance.md`
- **Preview & Middleware**: `next-sdk/preview-middleware.md`
- **Best Practices**: `next-sdk/best-practices.md`

---

This comprehensive deployment guide ensures production-ready Next.js applications with Agility CMS, covering performance monitoring, security, and optimization strategies. 
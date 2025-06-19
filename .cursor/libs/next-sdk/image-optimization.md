# Agility CMS Next.js SDK - Image Optimization

This document covers image optimization in Next.js applications using Agility CMS, featuring the AgilityPic component and advanced optimization techniques.

---

## 🖼️ **AgilityPic Component**

### **Basic AgilityPic Implementation**
```typescript
// components/common/AgilityPic.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AgilityPicProps {
  image: {
    url: string;
    label?: string;
    width?: number;
    height?: number;
    altText?: string;
  };
  alt?: string;
  className?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function AgilityPic({
  image,
  alt,
  className,
  fallbackWidth = 800,
  fallbackHeight = 600,
  priority = false,
  quality = 80,
  fill = false,
  sizes,
  style,
  placeholder = 'empty',
  blurDataURL,
  loading,
  onLoad,
  onError
}: AgilityPicProps) {
  const [imageError, setImageError] = useState(false);

  if (!image?.url || imageError) {
    return (
      <div 
        className={`agility-pic-placeholder ${className || ''}`}
        style={{
          width: fallbackWidth,
          height: fallbackHeight,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <span>Image not available</span>
      </div>
    );
  }

  // Use provided alt text, fallback to image label, then to empty string
  const imageAlt = alt || image.altText || image.label || '';
  
  // Use image dimensions or fallback values
  const imageWidth = image.width || fallbackWidth;
  const imageHeight = image.height || fallbackHeight;

  // Optimize Agility CDN URLs
  const optimizedUrl = optimizeAgilityImageUrl(image.url, {
    width: imageWidth,
    height: imageHeight,
    quality,
    format: 'auto'
  });

  const imageProps = {
    src: optimizedUrl,
    alt: imageAlt,
    className,
    priority,
    quality,
    style,
    placeholder,
    blurDataURL,
    loading,
    onLoad,
    onError: () => {
      setImageError(true);
      onError?.();
    }
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes || '100vw'}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={imageWidth}
      height={imageHeight}
      sizes={sizes}
    />
  );
}
```

### **Advanced AgilityPic with Responsive Images**
```typescript
// components/common/AgilityPic.tsx (Enhanced version)
import Image from 'next/image';
import { useState, useMemo } from 'react';

interface ResponsiveImageConfig {
  breakpoint: number;
  width: number;
  height?: number;
}

interface AgilityPicProps {
  image: {
    url: string;
    label?: string;
    width?: number;
    height?: number;
    altText?: string;
  };
  alt?: string;
  className?: string;
  fallbackWidth?: number;
  fallbackHeight?: number;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  responsive?: ResponsiveImageConfig[];
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function AgilityPic({
  image,
  alt,
  className,
  fallbackWidth = 800,
  fallbackHeight = 600,
  priority = false,
  quality = 80,
  fill = false,
  responsive,
  aspectRatio,
  objectFit = 'cover',
  placeholder = 'empty',
  lazy = true,
  onLoad,
  onError
}: AgilityPicProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate responsive sizes string
  const sizes = useMemo(() => {
    if (!responsive) {
      return undefined;
    }

    return responsive
      .sort((a, b) => a.breakpoint - b.breakpoint)
      .map((config, index) => {
        if (index === responsive.length - 1) {
          return `${config.width}px`;
        }
        return `(max-width: ${config.breakpoint}px) ${config.width}px`;
      })
      .join(', ');
  }, [responsive]);

  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    if (!responsive || !image?.url) {
      return undefined;
    }

    return responsive
      .map(config => {
        const optimizedUrl = optimizeAgilityImageUrl(image.url, {
          width: config.width,
          height: config.height,
          quality,
          format: 'auto'
        });
        return `${optimizedUrl} ${config.width}w`;
      })
      .join(', ');
  }, [responsive, image?.url, quality]);

  if (!image?.url || imageError) {
    return (
      <div 
        className={`agility-pic-placeholder ${className || ''}`}
        style={{
          width: fallbackWidth,
          height: fallbackHeight,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280'
        }}
      >
        <span>Image not available</span>
      </div>
    );
  }

  const imageAlt = alt || image.altText || image.label || '';
  const imageWidth = image.width || fallbackWidth;
  const imageHeight = image.height || fallbackHeight;

  const optimizedUrl = optimizeAgilityImageUrl(image.url, {
    width: imageWidth,
    height: imageHeight,
    quality,
    format: 'auto'
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const imageStyle = {
    objectFit,
    aspectRatio,
    transition: 'opacity 0.3s ease',
    opacity: isLoading ? 0 : 1
  };

  if (fill) {
    return (
      <div className={`relative ${className || ''}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={optimizedUrl}
          alt={imageAlt}
          fill
          sizes={sizes}
          srcSet={srcSet}
          priority={priority}
          quality={quality}
          style={imageStyle}
          placeholder={placeholder}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: imageWidth, height: imageHeight }}
        />
      )}
      <Image
        src={optimizedUrl}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        sizes={sizes}
        srcSet={srcSet}
        priority={priority}
        quality={quality}
        style={imageStyle}
        placeholder={placeholder}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
```

---

## 🔧 **Image URL Optimization**

### **Agility CDN Optimization Utility**
```typescript
// lib/utils/image-optimization.ts
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'crop' | 'bounds' | 'canvas';
  background?: string;
  blur?: number;
  sharpen?: boolean;
  progressive?: boolean;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function optimizeAgilityImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl || !originalUrl.includes('cdn.aglty.io')) {
    return originalUrl;
  }

  const params = new URLSearchParams();

  // Size parameters
  if (options.width) {
    params.set('w', options.width.toString());
  }
  if (options.height) {
    params.set('h', options.height.toString());
  }

  // Quality and format
  if (options.quality) {
    params.set('q', Math.min(100, Math.max(1, options.quality)).toString());
  }
  if (options.format) {
    params.set('format', options.format);
  }

  // Fit and layout
  if (options.fit) {
    params.set('fit', options.fit);
  }
  if (options.background) {
    params.set('bg', options.background);
  }

  // Effects
  if (options.blur) {
    params.set('blur', Math.min(100, Math.max(1, options.blur)).toString());
  }
  if (options.sharpen) {
    params.set('sharpen', 'true');
  }
  if (options.progressive) {
    params.set('progressive', 'true');
  }

  // Cropping
  if (options.crop) {
    const { x, y, width, height } = options.crop;
    params.set('crop', `${x},${y},${width},${height}`);
  }

  const paramString = params.toString();
  const separator = originalUrl.includes('?') ? '&' : '?';
  
  return paramString ? `${originalUrl}${separator}${paramString}` : originalUrl;
}

// Generate responsive image set
export function generateResponsiveImageSet(
  originalUrl: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920],
  quality: number = 80
) {
  return {
    srcSet: breakpoints
      .map(width => {
        const optimizedUrl = optimizeAgilityImageUrl(originalUrl, {
          width,
          quality,
          format: 'auto'
        });
        return `${optimizedUrl} ${width}w`;
      })
      .join(', '),
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  };
}

// Generate blur placeholder
export function generateBlurPlaceholder(
  originalUrl: string,
  width: number = 10,
  height: number = 10
): string {
  return optimizeAgilityImageUrl(originalUrl, {
    width,
    height,
    quality: 10,
    blur: 10,
    format: 'jpg'
  });
}
```

---

## 📱 **Responsive Image Patterns**

### **Hero Image Component**
```typescript
// components/common/HeroImage.tsx
import { AgilityPic } from './AgilityPic';

interface HeroImageProps {
  image: any;
  title?: string;
  subtitle?: string;
  overlay?: boolean;
  height?: string;
  className?: string;
}

export function HeroImage({
  image,
  title,
  subtitle,
  overlay = true,
  height = '60vh',
  className
}: HeroImageProps) {
  const responsive = [
    { breakpoint: 640, width: 640, height: 360 },
    { breakpoint: 768, width: 768, height: 432 },
    { breakpoint: 1024, width: 1024, height: 576 },
    { breakpoint: 1280, width: 1280, height: 720 },
    { breakpoint: 1920, width: 1920, height: 1080 }
  ];

  return (
    <div className={`relative ${className || ''}`} style={{ height }}>
      <AgilityPic
        image={image}
        alt={title || 'Hero image'}
        fill
        priority
        responsive={responsive}
        objectFit="cover"
        className="absolute inset-0"
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}
      
      {(title || subtitle) && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-4">
            {title && (
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xl md:text-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### **Gallery Component**
```typescript
// components/common/ImageGallery.tsx
import { AgilityPic } from './AgilityPic';
import { useState } from 'react';

interface ImageGalleryProps {
  images: any[];
  columns?: number;
  gap?: string;
  lightbox?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = '1rem',
  lightbox = true,
  className
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const responsive = [
    { breakpoint: 640, width: 300, height: 200 },
    { breakpoint: 768, width: 400, height: 267 },
    { breakpoint: 1024, width: 500, height: 333 }
  ];

  return (
    <>
      <div 
        className={`grid gap-${gap} ${className || ''}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => lightbox && setSelectedImage(index)}
          >
            <AgilityPic
              image={image}
              alt={image.label || `Gallery image ${index + 1}`}
              responsive={responsive}
              aspectRatio="4/3"
              objectFit="cover"
              className="rounded-lg shadow-md"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <AgilityPic
              image={images[selectedImage]}
              alt={images[selectedImage].label || 'Gallery image'}
              fallbackWidth={800}
              fallbackHeight={600}
              quality={90}
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
```

---

## ⚡ **Performance Optimization**

### **Lazy Loading with Intersection Observer**
```typescript
// hooks/useImageLazyLoading.ts
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useImageLazyLoading(options: UseLazyLoadingOptions = {}) {
  const { threshold = 0.1, rootMargin = '50px' } = options;
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isInView };
}

// Usage in component
export function LazyAgilityPic(props: AgilityPicProps) {
  const { ref, isInView } = useImageLazyLoading();

  return (
    <div ref={ref}>
      {isInView ? (
        <AgilityPic {...props} />
      ) : (
        <div 
          className="bg-gray-200 animate-pulse"
          style={{
            width: props.fallbackWidth || 800,
            height: props.fallbackHeight || 600
          }}
        />
      )}
    </div>
  );
}
```

### **Image Preloading**
```typescript
// lib/utils/image-preloader.ts
export class ImagePreloader {
  private cache = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessing = false;

  async preload(url: string): Promise<void> {
    if (this.cache.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.add(url);
        resolve();
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  async preloadBatch(urls: string[], concurrency: number = 3): Promise<void> {
    const chunks = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      chunks.push(urls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(url => this.preload(url)));
    }
  }

  queuePreload(url: string): void {
    if (!this.cache.has(url) && !this.preloadQueue.includes(url)) {
      this.preloadQueue.push(url);
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift()!;
      try {
        await this.preload(url);
      } catch (error) {
        console.warn('Failed to preload image:', url, error);
      }
    }

    this.isProcessing = false;
  }
}

export const imagePreloader = new ImagePreloader();

// Usage in components
export function useImagePreloader() {
  return {
    preload: imagePreloader.preload.bind(imagePreloader),
    preloadBatch: imagePreloader.preloadBatch.bind(imagePreloader),
    queuePreload: imagePreloader.queuePreload.bind(imagePreloader)
  };
}
```

### **Progressive Image Loading**
```typescript
// components/common/ProgressiveAgilityPic.tsx
import { AgilityPic } from './AgilityPic';
import { useState } from 'react';
import { generateBlurPlaceholder } from '@/lib/utils/image-optimization';

interface ProgressiveAgilityPicProps extends AgilityPicProps {
  showBlurPlaceholder?: boolean;
}

export function ProgressiveAgilityPic({
  image,
  showBlurPlaceholder = true,
  ...props
}: ProgressiveAgilityPicProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLowQuality, setShowLowQuality] = useState(true);

  const blurDataURL = showBlurPlaceholder && image?.url 
    ? generateBlurPlaceholder(image.url)
    : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
    setShowLowQuality(false);
    props.onLoad?.();
  };

  return (
    <div className="relative">
      {/* Low quality placeholder */}
      {showLowQuality && showBlurPlaceholder && image?.url && (
        <div className="absolute inset-0">
          <AgilityPic
            {...props}
            image={{
              ...image,
              url: blurDataURL!
            }}
            quality={10}
            className={`${props.className || ''} blur-sm`}
          />
        </div>
      )}

      {/* High quality image */}
      <AgilityPic
        {...props}
        image={image}
        onLoad={handleLoad}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}
```

---

## 🔗 **Related Documentation**

- **App Router Setup**: `next-sdk/app-router-setup.md`
- **Component Development**: `next-sdk/component-development.md`
- **Data Fetching**: `next-sdk/data-fetching.md`
- **Caching Strategies**: `next-sdk/caching-strategies.md`
- **Preview Mode**: `next-sdk/preview-mode.md`
- **Best Practices**: `next-sdk/best-practices.md`

---

This guide provides comprehensive image optimization techniques using the AgilityPic component, ensuring optimal performance and user experience in Next.js applications with Agility CMS.
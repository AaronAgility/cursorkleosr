# Next.js SDK - Best Practices

This guide outlines essential best practices for building production-ready applications with Agility CMS and Next.js, covering performance, SEO, development workflow, and content management.

---

## ⚡ **Performance Best Practices**

### **Server Components First**

```typescript
// ✅ Good: Use Server Components for data fetching
export default async function BlogPage() {
  const posts = await getContentList('posts', 'en-us');
  
  return (
    <div>
      {posts.items.map(post => (
        <BlogCard key={post.contentID} post={post} />
      ))}
    </div>
  );
}

// ❌ Avoid: Client-side data fetching for static content
'use client';
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetchPosts().then(setPosts);
  }, []);
  
  return <div>{/* content */}</div>;
}
```

### **Image Optimization**

```typescript
// ✅ Good: Always use AgilityPic for Agility images
import { AgilityPic } from '@agility/nextjs';

export function OptimizedImage({ image, alt }: { image: any; alt: string }) {
  return (
    <AgilityPic
      image={image}
      alt={alt}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="rounded-lg"
    />
  );
}

// ❌ Avoid: Using regular img tags for Agility images
export function UnoptimizedImage({ image, alt }: { image: any; alt: string }) {
  return <img src={image.url} alt={alt} />;
}
```

### **Caching Strategies**

```typescript
// ✅ Good: Implement proper caching
export const revalidate = 3600; // 1 hour

export default async function Page() {
  const data = await getCachedContent();
  return <div>{/* content */}</div>;
}

// ✅ Good: Use React cache for repeated calls
import { cache } from 'react';

const getCachedContent = cache(async () => {
  return await api.getContentList({ referenceName: 'posts' });
});
```

---

## 🔍 **SEO Best Practices**

### **Metadata Generation**

```typescript
// ✅ Good: Generate proper metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  return {
    title: post.fields.title,
    description: post.fields.excerpt,
    openGraph: {
      title: post.fields.title,
      description: post.fields.excerpt,
      images: post.fields.featuredImage ? [post.fields.featuredImage.url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.fields.title,
      description: post.fields.excerpt,
    },
  };
}
```

### **Structured Data**

```typescript
// ✅ Good: Include structured data
export function BlogPostStructuredData({ post }: { post: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.fields.title,
    description: post.fields.excerpt,
    author: {
      '@type': 'Person',
      name: post.fields.author,
    },
    datePublished: post.fields.publishDate,
    image: post.fields.featuredImage?.url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

---

## 🛠️ **Development Best Practices**

### **TypeScript Usage**

```typescript
// ✅ Good: Define proper interfaces
interface BlogPost extends AgilityContentItem {
  fields: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: AgilityImage;
    author: string;
    publishDate: string;
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await api.getContentList({
    referenceName: 'posts',
    locale: 'en-us'
  });
  
  return response.items as BlogPost[];
}

// ❌ Avoid: Using any types
export async function getBlogPosts(): Promise<any[]> {
  const response = await api.getContentList({
    referenceName: 'posts',
    locale: 'en-us'
  });
  
  return response.items;
}
```

### **Error Handling**

```typescript
// ✅ Good: Implement proper error boundaries
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}

export function SafeComponent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
```

### **Component Organization**

```typescript
// ✅ Good: Organize components by feature
components/
├── agility-components/
│   ├── BlogPost/
│   │   ├── BlogPost.tsx
│   │   ├── BlogPost.types.ts
│   │   └── BlogPost.module.css
│   └── index.ts
├── common/
│   ├── Layout/
│   ├── Navigation/
│   └── Footer/
└── ui/
    ├── Button/
    ├── Card/
    └── Modal/
```

---

## 📝 **Content Management Best Practices**

### **Content Model Design**

```typescript
// ✅ Good: Flexible content models
interface FlexibleContent {
  contentID: number;
  fields: {
    title: string;
    modules: Array<{
      module: 'RichText' | 'ImageGallery' | 'CallToAction';
      fields: any;
    }>;
  };
}

// ✅ Good: Consistent naming conventions
interface BlogPost {
  fields: {
    title: string;           // Clear, descriptive names
    excerpt: string;         // Consistent casing
    publishDate: string;     // Descriptive field names
    featuredImage: AgilityImage;
  };
}
```

### **Content Validation**

```typescript
// ✅ Good: Validate content before rendering
import { z } from 'zod';

const BlogPostSchema = z.object({
  contentID: z.number(),
  fields: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    publishDate: z.string(),
  }),
});

export function validateBlogPost(post: any): BlogPost | null {
  try {
    return BlogPostSchema.parse(post);
  } catch (error) {
    console.error('Invalid blog post data:', error);
    return null;
  }
}
```

---

## 🔒 **Security Best Practices**

### **Environment Variables**

```typescript
// ✅ Good: Validate environment variables
import { z } from 'zod';

const envSchema = z.object({
  AGILITY_GUID: z.string().min(1),
  AGILITY_API_FETCH_KEY: z.string().min(1),
  AGILITY_SECURITY_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);

// ❌ Avoid: Direct process.env usage without validation
const guid = process.env.AGILITY_GUID; // Could be undefined
```

### **Content Sanitization**

```typescript
// ✅ Good: Sanitize HTML content
import DOMPurify from 'isomorphic-dompurify';

export function SafeHTML({ content }: { content: string }) {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
}

// ❌ Avoid: Raw HTML without sanitization
export function UnsafeHTML({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

---

## 🧪 **Testing Best Practices**

### **Component Testing**

```typescript
// ✅ Good: Test components with realistic data
import { render, screen } from '@testing-library/react';
import { BlogPost } from '@/components/agility-components/BlogPost';

const mockBlogPost = {
  contentID: 1,
  fields: {
    title: 'Test Blog Post',
    content: 'This is test content',
    author: 'Test Author',
    publishDate: '2024-01-01',
  },
};

test('renders blog post correctly', () => {
  render(<BlogPost item={mockBlogPost} />);
  
  expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  expect(screen.getByText('Test Author')).toBeInTheDocument();
});
```

### **API Testing**

```typescript
// ✅ Good: Mock Agility API calls
import { jest } from '@jest/globals';

jest.mock('@agility/content-fetch', () => ({
  getApi: jest.fn(() => ({
    getContentList: jest.fn().mockResolvedValue({
      items: [mockBlogPost],
      totalCount: 1,
    }),
  })),
}));
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**

- ✅ Environment variables configured
- ✅ Bundle analysis completed
- ✅ Performance audit passed
- ✅ SEO metadata implemented
- ✅ Error boundaries in place
- ✅ Security headers configured
- ✅ Tests passing
- ✅ TypeScript compilation successful

### **Post-Deployment**

- ✅ Webhook endpoints configured
- ✅ Monitoring and analytics set up
- ✅ Error tracking enabled
- ✅ Performance monitoring active
- ✅ Backup and recovery tested

---

## 🔗 **Related Documentation**

- [Caching & Performance](./caching-performance.md) - Performance optimization
- [TypeScript Definitions](./typescript-definitions.md) - Type safety
- [Deployment & Production](./deployment-production.md) - Production setup
- [Advanced Patterns](./advanced-patterns.md) - Advanced techniques 
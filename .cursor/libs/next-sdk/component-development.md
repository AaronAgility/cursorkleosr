# Agility CMS Next.js SDK - Component Development

This document covers developing Agility page modules and components for Next.js applications, including component registry patterns and TypeScript integration.

---

## 🧩 **Component Architecture**

### **Agility Page Module Structure**
```typescript
// lib/types/agility.ts
export interface AgilityPageModule {
  module: string;
  item?: {
    contentID: number;
    properties: {
      state: string;
      modified: string;
      versionID: number;
    };
    fields: Record<string, any>;
  };
  customData?: Record<string, any>;
  sortOrder: number;
}

export interface AgilityPageProps {
  page: {
    pageID: number;
    title: string;
    name: string;
    zones: Record<string, AgilityPageModule[]>;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: { url: string };
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: { url: string };
      noIndex?: boolean;
      noFollow?: boolean;
    };
  };
  sitemapNode: {
    title: string;
    path: string;
    menuText?: string;
    visible: {
      menu: boolean;
      sitemap: boolean;
    };
  };
  sitemap: Record<string, any>;
  isDevelopmentMode: boolean;
  locale: string;
  channelName: string;
}

export interface ModuleProps {
  module: AgilityPageModule;
  customData?: Record<string, any>;
  isDevelopmentMode?: boolean;
}
```

### **Component Registry Pattern**
```typescript
// components/agility-components/index.ts
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { ModuleProps } from '@/lib/types/agility';

// Dynamic imports for better code splitting
const RichTextArea = dynamic(() => import('./RichTextArea'), {
  loading: () => <div>Loading...</div>
});

const PostsListing = dynamic(() => import('./PostsListing'), {
  loading: () => <div>Loading posts...</div>
});

const FeaturedPost = dynamic(() => import('./FeaturedPost'), {
  loading: () => <div>Loading featured post...</div>
});

const ImageGallery = dynamic(() => import('./ImageGallery'), {
  loading: () => <div>Loading gallery...</div>
});

const CallToAction = dynamic(() => import('./CallToAction'), {
  loading: () => <div>Loading...</div>
});

const ContactForm = dynamic(() => import('./ContactForm'), {
  loading: () => <div>Loading form...</div>
});

const Testimonials = dynamic(() => import('./Testimonials'), {
  loading: () => <div>Loading testimonials...</div>
});

// Component registry mapping module names to components
export const AgilityComponentRegistry: Record<string, ComponentType<ModuleProps>> = {
  'RichTextArea': RichTextArea,
  'PostsListing': PostsListing,
  'FeaturedPost': FeaturedPost,
  'ImageGallery': ImageGallery,
  'CallToAction': CallToAction,
  'ContactForm': ContactForm,
  'Testimonials': Testimonials
};

// Fallback component for unknown modules
const UnknownModule = ({ module }: ModuleProps) => (
  <div className="unknown-module p-4 bg-yellow-100 border border-yellow-400 rounded">
    <h3 className="text-yellow-800 font-bold">Unknown Module: {module.module}</h3>
    <p className="text-yellow-700">
      This module type is not registered in the component registry.
    </p>
    {process.env.NODE_ENV === 'development' && (
      <pre className="mt-2 text-xs bg-yellow-200 p-2 rounded overflow-auto">
        {JSON.stringify(module, null, 2)}
      </pre>
    )}
  </div>
);

// Module renderer component
export function ModuleRenderer({ module, customData, isDevelopmentMode }: ModuleProps) {
  const ModuleComponent = AgilityComponentRegistry[module.module] || UnknownModule;
  
  return (
    <ModuleComponent 
      module={module} 
      customData={customData} 
      isDevelopmentMode={isDevelopmentMode} 
    />
  );
}

// Page template component
export function AgilityPageTemplate({ 
  page, 
  sitemapNode, 
  sitemap, 
  isDevelopmentMode 
}: AgilityPageProps) {
  return (
    <div className="agility-page">
      {Object.keys(page.zones).map(zoneName => (
        <div key={zoneName} className={`zone zone-${zoneName.toLowerCase()}`}>
          {page.zones[zoneName].map((module, index) => (
            <ModuleRenderer
              key={`${module.module}-${index}`}
              module={module}
              customData={module.customData}
              isDevelopmentMode={isDevelopmentMode}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 **Content Module Components**

### **Rich Text Area Module**
```typescript
// components/agility-components/RichTextArea.tsx
import { ModuleProps } from '@/lib/types/agility';
import DOMPurify from 'isomorphic-dompurify';

interface RichTextAreaFields {
  textblob: string;
  title?: string;
  className?: string;
}

export default function RichTextArea({ module, isDevelopmentMode }: ModuleProps) {
  const fields = module.item?.fields as RichTextAreaFields;

  if (!fields?.textblob) {
    return isDevelopmentMode ? (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-gray-600">Rich Text Area - No content</p>
      </div>
    ) : null;
  }

  // Sanitize HTML content for security
  const sanitizedContent = DOMPurify.sanitize(fields.textblob, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
    ALLOW_DATA_ATTR: false
  });

  return (
    <div className={`rich-text-area ${fields.className || ''}`}>
      {fields.title && (
        <h2 className="rich-text-title text-2xl font-bold mb-4">
          {fields.title}
        </h2>
      )}
      <div 
        className="rich-text-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}
```

### **Call to Action Module**
```typescript
// components/agility-components/CallToAction.tsx
import { ModuleProps } from '@/lib/types/agility';
import Link from 'next/link';
import { AgilityPic } from '@/components/common/AgilityPic';

interface CallToActionFields {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  backgroundImage?: {
    url: string;
    label?: string;
    altText?: string;
  };
  textColor?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

export default function CallToAction({ module, isDevelopmentMode }: ModuleProps) {
  const fields = module.item?.fields as CallToActionFields;

  if (!fields?.title || !fields?.buttonText) {
    return isDevelopmentMode ? (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-gray-600">Call to Action - Missing required fields</p>
      </div>
    ) : null;
  }

  const buttonStyleClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const buttonStyle = fields.buttonStyle || 'primary';
  const alignment = fields.alignment || 'center';

  return (
    <div className="call-to-action relative">
      {fields.backgroundImage && (
        <div className="absolute inset-0">
          <AgilityPic
            image={fields.backgroundImage}
            alt={fields.backgroundImage.altText || 'Background'}
            fill
            objectFit="cover"
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}
      
      <div 
        className={`relative py-16 px-4 ${alignmentClasses[alignment]}`}
        style={{
          color: fields.textColor,
          backgroundColor: !fields.backgroundImage ? fields.backgroundColor : undefined
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            {fields.title}
          </h2>
          
          {fields.subtitle && (
            <h3 className="text-2xl mb-4 opacity-90">
              {fields.subtitle}
            </h3>
          )}
          
          {fields.description && (
            <p className="text-lg mb-8 opacity-80">
              {fields.description}
            </p>
          )}
          
          <Link
            href={fields.buttonLink}
            className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors duration-200 ${buttonStyleClasses[buttonStyle]}`}
          >
            {fields.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### **Image Gallery Module**
```typescript
// components/agility-components/ImageGallery.tsx
import { ModuleProps } from '@/lib/types/agility';
import { ImageGallery as ImageGalleryComponent } from '@/components/common/ImageGallery';
import { getGallery } from '@/lib/cms/cms-content';

interface ImageGalleryFields {
  title?: string;
  gallery?: {
    galleryID: number;
  };
  columns?: number;
  showCaptions?: boolean;
  lightbox?: boolean;
}

export default async function ImageGallery({ module, isDevelopmentMode }: ModuleProps) {
  const fields = module.item?.fields as ImageGalleryFields;

  if (!fields?.gallery?.galleryID) {
    return isDevelopmentMode ? (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-gray-600">Image Gallery - No gallery selected</p>
      </div>
    ) : null;
  }

  // Fetch gallery data on server
  const gallery = await getGallery(fields.gallery.galleryID, {
    preview: isDevelopmentMode
  });

  if (!gallery || !gallery.media?.length) {
    return isDevelopmentMode ? (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-gray-600">Image Gallery - No images found</p>
      </div>
    ) : null;
  }

  return (
    <div className="image-gallery-module">
      {fields.title && (
        <h2 className="text-3xl font-bold mb-8 text-center">
          {fields.title}
        </h2>
      )}
      
      <ImageGalleryComponent
        images={gallery.media}
        columns={fields.columns || 3}
        lightbox={fields.lightbox !== false}
        className="max-w-6xl mx-auto"
      />
    </div>
  );
}
```

---

## 🎨 **Interactive Module Components**

### **Contact Form Module**
```typescript
// components/agility-components/ContactForm.tsx
'use client';

import { ModuleProps } from '@/lib/types/agility';
import { useState } from 'react';

interface ContactFormFields {
  title?: string;
  description?: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'tel' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
  submitButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
}

interface FormData {
  [key: string]: string;
}

export default function ContactForm({ module, isDevelopmentMode }: ModuleProps) {
  const fields = module.item?.fields as ContactFormFields;
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!fields?.fields?.length) {
    return isDevelopmentMode ? (
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-gray-600">Contact Form - No fields configured</p>
      </div>
    ) : null;
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          moduleId: module.item?.contentID
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ContactFormFields['fields'][0]) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleInputChange(field.name, e.target.value),
      className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <div className="contact-form max-w-2xl mx-auto p-6">
      {fields.title && (
        <h2 className="text-3xl font-bold mb-4 text-center">
          {fields.title}
        </h2>
      )}
      
      {fields.description && (
        <p className="text-gray-600 mb-8 text-center">
          {fields.description}
        </p>
      )}

      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {fields.successMessage || 'Thank you for your message! We\'ll get back to you soon.'}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {fields.errorMessage || 'Sorry, there was an error submitting your form. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.fields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : (fields.submitButtonText || 'Submit')}
        </button>
      </form>
    </div>
  );
}
```

---

## 🔧 **Development Tools & Utilities**

### **Module Development Helper**
```typescript
// lib/utils/module-dev-helper.ts
import { ModuleProps } from '@/lib/types/agility';

export function withModuleWrapper<T extends ModuleProps>(
  Component: React.ComponentType<T>,
  moduleName: string
) {
  return function WrappedModule(props: T) {
    const { isDevelopmentMode } = props;

    if (isDevelopmentMode) {
      return (
        <div className="module-wrapper border-2 border-dashed border-blue-300 relative">
          <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-br">
            {moduleName}
          </div>
          <div className="pt-6">
            <Component {...props} />
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Usage
export default withModuleWrapper(RichTextArea, 'RichTextArea');
```

### **Module Props Validator**
```typescript
// lib/utils/module-validator.ts
export function validateModuleProps(
  module: any,
  requiredFields: string[],
  moduleName: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!module?.item?.fields) {
    errors.push(`${moduleName}: No fields found`);
    return { isValid: false, errors };
  }

  const fields = module.item.fields;
  
  requiredFields.forEach(fieldName => {
    if (!fields[fieldName]) {
      errors.push(`${moduleName}: Missing required field '${fieldName}'`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Usage in components
export default function MyModule({ module, isDevelopmentMode }: ModuleProps) {
  const { isValid, errors } = validateModuleProps(
    module,
    ['title', 'content'],
    'MyModule'
  );

  if (!isValid && isDevelopmentMode) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        <h3 className="text-red-800 font-bold">Module Validation Errors:</h3>
        <ul className="text-red-700 list-disc list-inside">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Component implementation...
}
```

### **TypeScript Field Type Generator**
```typescript
// scripts/generate-field-types.ts
// This would be a build-time script to generate TypeScript interfaces
// from Agility CMS content definitions

export interface GeneratedFieldTypes {
  RichTextArea: {
    textblob: string;
    title?: string;
    className?: string;
  };
  
  PostsListing: {
    title?: string;
    referenceName: string;
    take?: number;
    category?: {
      fields: {
        title: string;
        slug: string;
      };
    };
    showExcerpt?: boolean;
    showDate?: boolean;
  };
  
  CallToAction: {
    title: string;
    subtitle?: string;
    description?: string;
    buttonText: string;
    buttonLink: string;
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    backgroundImage?: {
      url: string;
      label?: string;
      altText?: string;
    };
  };
}

// Type-safe module component
export function createTypedModule<K extends keyof GeneratedFieldTypes>(
  moduleName: K,
  component: React.ComponentType<{
    fields: GeneratedFieldTypes[K];
    customData?: Record<string, any>;
    isDevelopmentMode?: boolean;
  }>
) {
  return function TypedModule({ module, customData, isDevelopmentMode }: ModuleProps) {
    const fields = module.item?.fields as GeneratedFieldTypes[K];
    
    return (
      <component
        fields={fields}
        customData={customData}
        isDevelopmentMode={isDevelopmentMode}
      />
    );
  };
}
```

---

## 🔗 **Related Documentation**

- **App Router Setup**: `next-sdk/app-router-setup.md`
- **Data Fetching**: `next-sdk/data-fetching.md`
- **Image Optimization**: `next-sdk/image-optimization.md`
- **Caching Strategies**: `next-sdk/caching-strategies.md`
- **Preview Mode**: `next-sdk/preview-mode.md`
- **Best Practices**: `next-sdk/best-practices.md`

---

This guide provides comprehensive patterns for developing Agility CMS page modules and components in Next.js applications with proper TypeScript support and development tools.
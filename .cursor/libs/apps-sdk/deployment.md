# Agility CMS Apps SDK - Deployment

This document covers deployment strategies, hosting options, testing, and production best practices for Agility CMS Apps.

---

## 🚀 **Deployment Overview**

Agility CMS Apps can be deployed using various hosting solutions and distribution methods, depending on your requirements for scalability, security, and maintenance.

### **Deployment Options**
- **Static Hosting** - CDN-based deployment for React/Vue apps
- **Serverless Functions** - For apps requiring backend processing
- **Container Deployment** - Docker-based deployment for complex apps
- **Marketplace Distribution** - Official Agility CMS App Marketplace

---

## 📦 **Build Configuration**

### **React App Build Setup**
```json
{
  "name": "my-agility-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@agility/app-sdk": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### **App Manifest**
```json
{
  "name": "Advanced Image Selector",
  "version": "1.2.0",
  "description": "Professional image selection with external DAM integration",
  "author": "Your Company",
  "installationParameters": [
    {
      "name": "damApiKey",
      "type": "string",
      "label": "DAM API Key",
      "required": true,
      "secure": true
    }
  ],
  "customFields": [
    {
      "name": "DAM Image Selector",
      "referenceName": "DamImageSelector",
      "description": "Select images from your Digital Asset Manager"
    }
  ]
}
```

---

## 🌐 **Static Hosting**

### **Vercel Deployment**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        }
      ]
    }
  ]
}
```

### **Security Headers**
```html
<meta http-equiv="Content-Security-Policy" content="
  frame-ancestors 'self' *.agilitycms.com;
">
```

---

## 🧪 **Testing**

### **Component Testing**
```typescript
import { render, screen } from '@testing-library/react';
import { ImageSelectorField } from '../ImageSelector';

test('renders select button', () => {
  render(<ImageSelectorField />);
  expect(screen.getByText('Select Image')).toBeInTheDocument();
});
```

---

## 🔗 **Related Documentation**

- **Core Concepts**: `apps-sdk/core-concepts.md`
- **Custom Fields**: `apps-sdk/custom-fields.md`
- **Authentication**: `apps-sdk/authentication.md`
- **Examples**: `apps-sdk/examples/`

---

This deployment guide provides comprehensive strategies for hosting, testing, and distributing production-ready Agility CMS Apps with security, monitoring, and scalability best practices. 
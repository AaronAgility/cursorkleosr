# Agility CMS Apps SDK - Core Concepts

This document covers the fundamental concepts and architecture of Agility CMS Apps SDK for building custom applications and extensions.

---

## 📚 **What are Agility Apps?**

Custom Apps extend the Agility CMS UI and allow you to build integrations that editors can use directly within the Content Manager. Apps run in secure iFrames and communicate with the CMS through a robust messaging system.

### **Key Benefits**
- **Seamless Integration** - Apps appear natively within the CMS interface
- **Secure Environment** - Sandboxed execution with controlled permissions
- **Modern Development** - Support for React, Vue, Angular, or Vanilla JS
- **Flexible Configuration** - Installation parameters for customization
- **Real-time Communication** - Live updates and content synchronization

---

## 🏗️ **App Architecture**

### **App Types**

#### **1. Custom Fields**
Replace standard input fields with specialized controls:
- **Digital Asset Manager Integration** (Cloudinary, Widen, etc.)
- **External API Selectors** (BigCommerce products, external entities)
- **Enhanced Input Fields** (Color picker, markdown editor, block editor)
- **Data Validation Fields** (Custom validation logic)

#### **2. Sidebar Apps** *(Coming Soon)*
Display additional information or tools in the sidebar:
- **Analytics Dashboards** (Google Analytics integration)
- **Translation Tools** (Google Translate integration)
- **Content Insights** (Usage statistics, performance metrics)

#### **3. Flyout Actions**
Quick actions accessible from content items:
- **Bulk Operations** (Mass content updates)
- **Export/Import Tools** (Data migration utilities)
- **Workflow Actions** (Custom approval processes)

---

## 🔧 **SDK Structure**

### **Main Package Installation**
```bash
npm install @agility/app-sdk
# or
yarn add @agility/app-sdk
```

### **Basic App Structure**
```typescript
import { App, Field, FieldType } from '@agility/app-sdk';

// Initialize the app
const app = new App({
  name: 'My Custom App',
  version: '1.0.0'
});

// Define custom fields
const customField = new Field({
  name: 'Custom Field',
  type: FieldType.CUSTOM,
  component: MyCustomComponent
});

// Register the field
app.registerField(customField);

// Start the app
app.start();
```

---

## 🎛️ **App Configuration**

### **App Class Configuration**
```typescript
import { App } from '@agility/app-sdk';

const app = new App({
  name: 'Digital Asset Manager',
  version: '2.1.0',
  description: 'Integrate with external DAM systems',
  author: 'Your Company',
  homepage: 'https://yourcompany.com/agility-app',
  
  // Installation parameters
  installationParameters: [
    {
      name: 'apiKey',
      type: 'string',
      label: 'API Key',
      description: 'Your DAM system API key',
      required: true,
      secure: true // Will be encrypted
    },
    {
      name: 'endpoint',
      type: 'string',
      label: 'API Endpoint',
      description: 'Base URL for your DAM API',
      required: true,
      defaultValue: 'https://api.example.com'
    },
    {
      name: 'enablePreview',
      type: 'boolean',
      label: 'Enable Preview',
      description: 'Show asset previews in the field',
      defaultValue: true
    }
  ]
});
```

### **Field Class Configuration**
```typescript
import { Field, FieldType } from '@agility/app-sdk';

const imageSelector = new Field({
  name: 'DAM Image Selector',
  type: FieldType.CUSTOM,
  description: 'Select images from your DAM system',
  component: ImageSelectorComponent,
  
  // Field-specific settings
  settings: {
    allowMultiple: false,
    maxSelections: 1,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
});
```

---

## 🔐 **Security Model**

### **Sandboxed Environment**
- Apps run in isolated iFrames
- Limited access to parent window
- Secure message passing between CMS and app
- No direct DOM manipulation of CMS interface

### **Permission System**
```json
{
  "permissions": [
    "content:read",
    "content:write", 
    "media:read",
    "media:write",
    "user:read"
  ]
}
```

### **Secure Storage**
```typescript
// Store sensitive data securely
await app.setSecureStorage('api_key', sensitiveApiKey);

// Retrieve secure data
const apiKey = await app.getSecureStorage('api_key');

// Clear secure storage
await app.clearSecureStorage('api_key');
```

---

## 📡 **Communication Patterns**

### **Message Passing**
Apps communicate with the CMS through a secure message passing system:

```typescript
// Send message to CMS
app.sendMessage({
  type: 'FIELD_VALUE_CHANGED',
  data: {
    fieldName: 'imageSelector',
    value: JSON.stringify(selectedImage)
  }
});

// Listen for messages from CMS
app.onMessage('CONTENT_SAVED', (data) => {
  console.log('Content was saved:', data);
});
```

### **Context Access**
```typescript
import { useAgility } from '@agility/app-sdk';

const MyComponent = () => {
  const { 
    fieldValue,           // Current field value
    setFieldValue,        // Function to update field value
    installationParameters, // App configuration
    contentItem,          // Current content item context
    isReadonly           // Whether field is readonly
  } = useAgility();
  
  // Component logic here
};
```

---

## 🔄 **Lifecycle Hooks**

### **App Lifecycle**
```typescript
const app = new App({
  name: 'My App',
  
  onInit: () => {
    console.log('App initialized');
  },
  
  onReady: () => {
    console.log('App ready for use');
  },
  
  onDestroy: () => {
    console.log('App being destroyed');
    // Cleanup logic
  }
});
```

### **Field Lifecycle**
```typescript
const customField = new Field({
  name: 'Custom Field',
  
  onRender: (context) => {
    console.log('Field rendered', context);
  },
  
  onValueChange: (newValue, oldValue) => {
    console.log('Value changed:', newValue, oldValue);
  },
  
  onValidate: (value) => {
    // Return validation result
    return {
      isValid: value.length > 0,
      message: 'Field cannot be empty'
    };
  }
});
```

---

## 🎯 **Development Patterns**

### **Component-Based Architecture**
```typescript
// Recommended structure
src/
├── components/
│   ├── fields/
│   │   ├── ImageSelector.tsx
│   │   └── ProductPicker.tsx
│   ├── modals/
│   │   └── AssetBrowser.tsx
│   └── shared/
│       └── LoadingSpinner.tsx
├── services/
│   ├── api.ts
│   └── auth.ts
├── types/
│   └── index.ts
└── index.tsx
```

### **State Management**
```typescript
// Use React hooks for local state
const [selectedAsset, setSelectedAsset] = useState(null);
const [loading, setLoading] = useState(false);

// Use context for global app state
const AppContext = createContext();

// Use Agility context for CMS integration
const { fieldValue, setFieldValue } = useAgility();
```

---

## 📋 **Best Practices**

### **Performance**
- Lazy load components when possible
- Implement debouncing for search inputs
- Use virtual scrolling for large lists
- Cache API responses appropriately

### **User Experience**
- Provide loading states for async operations
- Show clear error messages
- Implement keyboard navigation
- Follow accessibility guidelines

### **Security**
- Validate all user inputs
- Use HTTPS for all API calls
- Store sensitive data in secure storage
- Implement proper authentication flows

### **Development**
- Use TypeScript for better type safety
- Write comprehensive tests
- Follow semantic versioning
- Document your API clearly

---

## 🔗 **Related Documentation**

- **Custom Fields**: `apps-sdk/custom-fields.md`
- **Authentication**: `apps-sdk/authentication.md`
- **Examples**: `apps-sdk/examples/`
- **Deployment**: `apps-sdk/deployment.md`

---

This foundation prepares you for building sophisticated Agility CMS applications. Continue to the custom fields documentation to start implementing your first app. 
# Agility CMS Apps SDK - Custom Fields

This document provides comprehensive guidance for building custom fields using the Agility Apps SDK, with practical React and Vanilla JS examples.

---

## 🎨 **Custom Field Fundamentals**

Custom fields replace standard Agility input fields with specialized controls that integrate with external systems or provide enhanced functionality.

### **Common Use Cases**
- **Digital Asset Manager Integration** (Cloudinary, Widen, Bynder)
- **Product Selectors** (BigCommerce, Shopify, custom catalogs)
- **Enhanced Inputs** (Color picker, markdown editor, code editor)
- **External API Integration** (Search and select from third-party services)
- **Data Validation** (Custom validation rules and formatting)

### **Field Types**
- **CUSTOM** - Fully custom React/JS components
- **TEXT** - Enhanced text inputs with validation
- **SELECT** - Dynamic dropdowns with external data
- **MULTI_SELECT** - Multiple selection interfaces
- **BOOLEAN** - Custom toggle/checkbox controls
- **NUMBER** - Specialized numeric inputs
- **DATE** - Custom date/time pickers

---

## ⚛️ **React Custom Field Implementation**

### **Basic React Component Structure**
```typescript
// components/ImageSelector.tsx
import React, { useState, useEffect } from 'react';
import { useAgility } from '@agility/app-sdk';

interface SelectedAsset {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  size: number;
}

export const ImageSelectorField: React.FC = () => {
  const { 
    fieldValue, 
    setFieldValue, 
    installationParameters, 
    contentItem,
    isReadonly 
  } = useAgility();
  
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(
    fieldValue ? JSON.parse(fieldValue) : null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<SelectedAsset[]>([]);
  const [loading, setLoading] = useState(false);

  // Load assets from external DAM
  const loadAssets = async (searchTerm = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${installationParameters.endpoint}/assets`, {
        headers: {
          'Authorization': `Bearer ${installationParameters.apiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          search: searchTerm,
          limit: 50,
          type: 'image'
        })
      });
      
      if (!response.ok) throw new Error('Failed to load assets');
      
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      // Show user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  // Handle asset selection
  const handleAssetSelect = (asset: SelectedAsset) => {
    setSelectedAsset(asset);
    setFieldValue(JSON.stringify(asset));
    setIsModalOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedAsset(null);
    setFieldValue('');
  };

  return (
    <div className="image-selector-field">
      {selectedAsset ? (
        <div className="selected-asset">
          <img 
            src={selectedAsset.url} 
            alt={selectedAsset.alt}
            className="preview-image"
            style={{ maxWidth: '200px', maxHeight: '150px' }}
          />
          <div className="asset-details">
            <p><strong>Alt Text:</strong> {selectedAsset.alt}</p>
            <p><strong>Dimensions:</strong> {selectedAsset.width} × {selectedAsset.height}</p>
            <p><strong>Size:</strong> {(selectedAsset.size / 1024).toFixed(1)} KB</p>
          </div>
          <div className="actions">
            {!isReadonly && (
              <>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary"
                >
                  Change Image
                </button>
                <button 
                  onClick={handleClear}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="no-selection">
          {!isReadonly && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              Select Image
            </button>
          )}
          <p>No image selected</p>
        </div>
      )}

      {/* Asset Selection Modal */}
      {isModalOpen && (
        <AssetSelectionModal
          assets={assets}
          loading={loading}
          onAssetSelect={handleAssetSelect}
          onClose={() => setIsModalOpen(false)}
          onSearch={loadAssets}
        />
      )}
    </div>
  );
};
```

### **Modal Component Example**
```typescript
// components/AssetSelectionModal.tsx
import React, { useState, useEffect } from 'react';

interface AssetSelectionModalProps {
  assets: SelectedAsset[];
  loading: boolean;
  onAssetSelect: (asset: SelectedAsset) => void;
  onClose: () => void;
  onSearch: (term: string) => void;
}

export const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({
  assets,
  loading,
  onAssetSelect,
  onClose,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Select Image</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {loading ? (
            <div className="loading">Loading assets...</div>
          ) : (
            <div className="assets-grid">
              {assets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="asset-item"
                  onClick={() => onAssetSelect(asset)}
                >
                  <img 
                    src={asset.url} 
                    alt={asset.alt}
                    className="asset-thumbnail"
                  />
                  <div className="asset-info">
                    <p className="asset-name">{asset.alt}</p>
                    <p className="asset-dimensions">
                      {asset.width} × {asset.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### **Modal Component Example**
```typescript
// components/AssetSelectionModal.tsx
import React, { useState, useEffect } from 'react';

interface AssetSelectionModalProps {
  assets: SelectedAsset[];
  loading: boolean;
  onAssetSelect: (asset: SelectedAsset) => void;
  onClose: () => void;
  onSearch: (term: string) => void;
}

export const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({
  assets,
  loading,
  onAssetSelect,
  onClose,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Select Image</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {loading ? (
            <div className="loading">Loading assets...</div>
          ) : (
            <div className="assets-grid">
              {assets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="asset-item"
                  onClick={() => onAssetSelect(asset)}
                >
                  <img 
                    src={asset.url} 
                    alt={asset.alt}
                    className="asset-thumbnail"
                  />
                  <div className="asset-info">
                    <p className="asset-name">{asset.alt}</p>
                    <p className="asset-dimensions">
                      {asset.width} × {asset.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🟨 **Vanilla JavaScript Implementation**

### **Basic Vanilla JS Structure**
```javascript
// vanilla-field.js
(function() {
  'use strict';

  // Custom Field Definition
  const CustomImageField = function() {
    this.Label = "External Image Selector";
    this.ReferenceName = "ExternalImageSelector";
    
    this.Render = function(options) {
      const $elem = options.$elem;
      const fieldBinding = options.fieldBinding;
      const readonly = options.readonly;
      
      // Create field HTML
      const fieldHTML = `
        <div class="external-image-field">
          <div class="selected-image" style="display: none;">
            <img class="preview" style="max-width: 200px; max-height: 150px;" />
            <div class="image-details"></div>
            <div class="actions">
              <button class="change-btn btn btn-primary">Change Image</button>
              <button class="clear-btn btn btn-secondary">Clear</button>
            </div>
          </div>
          <div class="no-image">
            <button class="select-btn btn btn-primary">Select Image</button>
            <p>No image selected</p>
          </div>
        </div>
      `;
      
      $elem.find('.field-input').html(fieldHTML);
      
      // Initialize field state
      const currentValue = fieldBinding();
      if (currentValue) {
        updateFieldDisplay(JSON.parse(currentValue));
      }
      
      // Bind events
      if (!readonly) {
        bindFieldEvents($elem, fieldBinding);
      }
    };
    
    function updateFieldDisplay(imageData) {
      const $field = $('.external-image-field');
      if (imageData) {
        $field.find('.preview').attr('src', imageData.url);
        $field.find('.image-details').html(`
          <p><strong>Alt:</strong> ${imageData.alt}</p>
          <p><strong>Size:</strong> ${imageData.width} × ${imageData.height}</p>
        `);
        $field.find('.selected-image').show();
        $field.find('.no-image').hide();
      } else {
        $field.find('.selected-image').hide();
        $field.find('.no-image').show();
      }
    }
    
    function bindFieldEvents($elem, fieldBinding) {
      $elem.on('click', '.select-btn, .change-btn', function() {
        openImageSelector(fieldBinding);
      });
      
      $elem.on('click', '.clear-btn', function() {
        fieldBinding('');
        updateFieldDisplay(null);
      });
    }
    
    function openImageSelector(fieldBinding) {
      // Create modal for image selection
      const modalHTML = `
        <div class="image-selector-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Select Image</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
              <input type="text" class="search-input" placeholder="Search images..." />
              <div class="images-grid"></div>
            </div>
          </div>
        </div>
      `;
      
      $('body').append(modalHTML);
      
      // Load and display images
      loadExternalImages('').then(images => {
        displayImages(images, fieldBinding);
      });
      
      // Bind modal events
      bindModalEvents(fieldBinding);
    }
    
    async function loadExternalImages(searchTerm) {
      try {
        // Get installation parameters from Agility
        const params = ContentManager.Global.InstallationParameters;
        
        const response = await fetch(`${params.endpoint}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            search: searchTerm,
            limit: 50
          })
        });
        
        if (!response.ok) throw new Error('Failed to load images');
        return await response.json();
      } catch (error) {
        console.error('Error loading images:', error);
        return [];
      }
    }
    
    function displayImages(images, fieldBinding) {
      const $grid = $('.images-grid');
      $grid.empty();
      
      images.forEach(image => {
        const $imageItem = $(`
          <div class="image-item" data-image='${JSON.stringify(image)}'>
            <img src="${image.thumbnail}" alt="${image.alt}" />
            <div class="image-info">
              <p>${image.alt}</p>
              <p>${image.width} × ${image.height}</p>
            </div>
          </div>
        `);
        
        $imageItem.on('click', function() {
          const imageData = JSON.parse($(this).attr('data-image'));
          fieldBinding(JSON.stringify(imageData));
          updateFieldDisplay(imageData);
          $('.image-selector-modal').remove();
        });
        
        $grid.append($imageItem);
      });
    }
    
    function bindModalEvents(fieldBinding) {
      // Close modal
      $(document).on('click', '.close-modal', function() {
        $('.image-selector-modal').remove();
      });
      
      // Search functionality
      let searchTimeout;
      $(document).on('input', '.search-input', function() {
        const searchTerm = $(this).val();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          loadExternalImages(searchTerm).then(images => {
            displayImages(images, fieldBinding);
          });
        }, 300);
      });
    }
  };
  
  // Register the custom field
  ContentManager.Global.CustomInputFormFields.push(new CustomImageField());
})();
```

---

## 🎯 **Advanced Field Patterns**

### **Multi-Select Field**
```typescript
export const MultiSelectField: React.FC = () => {
  const { fieldValue, setFieldValue } = useAgility();
  const [selectedItems, setSelectedItems] = useState<any[]>(
    fieldValue ? JSON.parse(fieldValue) : []
  );

  const handleItemToggle = (item: any) => {
    const newSelection = selectedItems.some(selected => selected.id === item.id)
      ? selectedItems.filter(selected => selected.id !== item.id)
      : [...selectedItems, item];
    
    setSelectedItems(newSelection);
    setFieldValue(JSON.stringify(newSelection));
  };

  return (
    <div className="multi-select-field">
      {/* Implementation */}
    </div>
  );
};
```

### **Validation Field**
```typescript
export const ValidatedField: React.FC = () => {
  const { fieldValue, setFieldValue } = useAgility();
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateValue = (value: string) => {
    // Custom validation logic
    if (!value.match(/^[A-Z0-9]+$/)) {
      setValidationError('Value must contain only uppercase letters and numbers');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleValueChange = (value: string) => {
    if (validateValue(value)) {
      setFieldValue(value);
    }
  };

  return (
    <div className="validated-field">
      <input 
        type="text"
        value={fieldValue || ''}
        onChange={(e) => handleValueChange(e.target.value)}
        className={validationError ? 'error' : ''}
      />
      {validationError && (
        <div className="error-message">{validationError}</div>
      )}
    </div>
  );
};
```

---

## 📱 **Responsive Design Patterns**

### **Mobile-First Approach**
```css
/* Mobile-first responsive design */
.image-selector-field {
  width: 100%;
  padding: 1rem;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .assets-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (min-width: 1024px) {
  .assets-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
```

### **Touch-Friendly Interactions**
```typescript
const handleTouchStart = (e: TouchEvent) => {
  // Handle touch interactions for mobile
};

const handleTouchEnd = (e: TouchEvent) => {
  // Handle touch end
};
```

---

## 🔧 **Performance Optimization**

### **Debounced Search**
```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### **Virtual Scrolling for Large Lists**
```typescript
const VirtualizedList: React.FC<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}> = ({ items, itemHeight, containerHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              width: '100%',
              height: itemHeight
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔗 **Related Documentation**

- **Core Concepts**: `apps-sdk/core-concepts.md`
- **Authentication**: `apps-sdk/authentication.md`
- **Examples**: `apps-sdk/examples/`
- **Testing**: `apps-sdk/testing.md`

---

This guide provides the foundation for building sophisticated custom fields. Check the examples directory for complete, working implementations of common field types. 
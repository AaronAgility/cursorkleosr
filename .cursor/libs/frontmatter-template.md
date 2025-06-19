# Frontmatter Template for SDK Documentation

This template shows the recommended YAML frontmatter structure for all Agility CMS SDK documentation files.

---

## **Standard Frontmatter Template**

```yaml
---
title: "Agility [SDK Name] - [Topic]"
description: "Brief description of what this file covers"
type: "sdk-documentation"
category: "[sdk-name]"  # fetch-sdk, next-sdk, management-sdk, sync-sdk, apps-sdk
tags: ["tag1", "tag2", "tag3"]  # Relevant keywords for search
sdk: "[sdk-name]"  # fetch, nextjs, management, sync, apps
complexity: "[level]"  # beginner, intermediate, advanced
lines: [number]  # Approximate line count
version: "1.0"
last_updated: "2024-12-19"
related_files: ["file1.md", "file2.md"]  # Cross-references
keywords: ["keyword1", "keyword2"]  # Primary search terms
---
```

---

## **SDK-Specific Templates**

### **Fetch SDK Files**
```yaml
---
title: "Agility Fetch SDK - [Topic]"
description: "[Description]"
type: "sdk-documentation"
category: "fetch-sdk"
tags: ["agility-fetch", "cdn", "content-fetching"]
sdk: "fetch"
complexity: "[beginner|intermediate|advanced]"
lines: [number]
version: "1.0"
last_updated: "2024-12-19"
related_files: ["core-apis.md", "content-operations.md"]
keywords: ["AgilityFetch", "getContentList", "API"]
---
```

### **Next.js SDK Files**
```yaml
---
title: "Agility Next.js SDK - [Topic]"
description: "[Description]"
type: "sdk-documentation"
category: "next-sdk"
tags: ["nextjs", "agility-nextjs", "app-router"]
sdk: "nextjs"
complexity: "[beginner|intermediate|advanced]"
lines: [number]
version: "1.0"
last_updated: "2024-12-19"
related_files: ["app-router-setup.md", "data-fetching.md"]
keywords: ["Next.js", "AgilityPic", "getAgilityPageProps"]
framework: "nextjs"
nextjs_version: "15"
---
```

### **Management SDK Files**
```yaml
---
title: "Agility Management SDK - [Topic]"
description: "[Description]"
type: "sdk-documentation"
category: "management-sdk"
tags: ["agility-management", "content-management", "crud"]
sdk: "management"
complexity: "[beginner|intermediate|advanced]"
lines: [number]
version: "1.0"
last_updated: "2024-12-19"
related_files: ["api-client-setup.md", "content-operations.md"]
keywords: ["Management API", "content management", "CRUD"]
---
```

### **Sync SDK Files**
```yaml
---
title: "Agility Sync SDK - [Topic]"
description: "[Description]"
type: "sdk-documentation"
category: "sync-sdk"
tags: ["agility-sync", "build-time", "static-generation"]
sdk: "sync"
complexity: "[beginner|intermediate|advanced]"
lines: [number]
version: "1.0"
last_updated: "2024-12-19"
related_files: ["sync-client-setup.md", "sync-operations.md"]
keywords: ["sync", "build-time", "static generation"]
---
```

### **Apps SDK Files**
```yaml
---
title: "Agility Apps SDK - [Topic]"
description: "[Description]"
type: "sdk-documentation"
category: "apps-sdk"
tags: ["agility-apps", "custom-fields", "oauth"]
sdk: "apps"
complexity: "[beginner|intermediate|advanced]"
lines: [number]
version: "1.0"
last_updated: "2024-12-19"
related_files: ["core-concepts.md", "custom-fields.md"]
keywords: ["custom fields", "apps", "OAuth"]
---
```

---

## **Benefits of Frontmatter**

### **For LLMs/AI Assistants**
- **Context Understanding**: Immediately understand file purpose and complexity
- **Relationship Mapping**: Know which files are related
- **Search Optimization**: Better semantic search with keywords and tags
- **Categorization**: Quickly filter by SDK, complexity, or topic

### **For Developers**
- **Quick Reference**: Understand file contents at a glance
- **Navigation**: Find related files easily
- **Documentation Tools**: Many tools can generate indexes from frontmatter
- **Search**: Better search results in editors and documentation sites

### **For Tools**
- **Static Site Generators**: Can use frontmatter for navigation and categorization
- **Documentation Platforms**: Automatic organization and filtering
- **IDEs**: Better file organization and search
- **Git Tools**: Enhanced file understanding in diffs and reviews

---

## **Implementation Recommendation**

1. **Priority Files**: Add frontmatter to the most frequently accessed files first:
   - All `README.md` files ✅ (Already done)
   - Core setup files (e.g., `core-apis.md`, `app-router-setup.md`) ✅ (Examples done)
   - Best practices files
   
2. **Batch Processing**: Add frontmatter to files by SDK category
3. **Consistency**: Use the templates above for consistent structure
4. **Maintenance**: Update `last_updated` field when making significant changes

---

This frontmatter structure significantly improves LLM understanding and navigation while maintaining compatibility with all markdown tools and editors. 
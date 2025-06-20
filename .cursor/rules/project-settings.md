---
title: "Agility CMS Project Settings"
description: "Project configuration, tech stack, and SDK documentation structure for Agility CMS development with enhanced AI workflow"
type: "project-configuration"
category: "agility-cms"
tags: ["agility-cms", "sdk", "nextjs", "typescript", "ai-workflow", "documentation"]
version: "2.0"
last_updated: "2024-12-19"
ai_optimized: true
file_count: 30
optimization_level: "llm-optimized"
---

# project-settings.md
Last-Updated: 2024-12-19

## Project Goal
Agility CMS frontend development starter with enhanced autonomous AI workflow and optimized SDK documentation. This system provides specialized tooling for building high-performance websites using Agility CMS with various frontend frameworks, featuring LLM-optimized documentation structure.

## Tech Stack
- **CMS Platform:** Agility CMS
- **Primary Framework:** Next.js (configurable for other frameworks)
- **Language(s):** TypeScript, JavaScript, React
- **Styling:** Tailwind CSS (default), CSS Modules, Styled Components
- **Build / Tooling:** Vite, Webpack, Git, Cursor AI workflow system
- **Deployment:** Vercel, Netlify, Custom hosting

## Agility CMS SDK Documentation Structure
**Optimized for LLM Retrieval**: 30 focused files (150-400 lines each) organized in `.cursor/libs/`

### **Fetch SDK** (`fetch-sdk/` - 6 files)
- `core-apis.md` - Client setup, configuration, regional endpoints
- `content-operations.md` - Content lists, filtering, sorting, relationships
- `page-operations.md` - Page data, modules, routing, SEO metadata
- `sitemap-operations.md` - Navigation, URL redirections, sitemap analysis
- `advanced-features.md` - GraphQL, media operations, sync operations
- `best-practices.md` - Performance, security, error handling, monitoring

### **Next.js SDK** (`next-sdk/` - 10 files)
- `app-router-setup.md` - Next.js 15 setup, project structure, dynamic routing
- `data-fetching.md` - Server components, content utilities, dynamic loading
- `image-optimization.md` - AgilityPic component (promoted over AgilityImage)
- `component-development.md` - Module architecture, component patterns
- `caching-performance.md` - Revalidation, caching strategies, performance optimization
- `preview-middleware.md` - Preview mode, middleware patterns, security
- `typescript-definitions.md` - Type definitions, interfaces, best practices
- `deployment-production.md` - Vercel deployment, performance monitoring, CI/CD
- `advanced-patterns.md` - Search, multi-language, complex relationships
- `best-practices.md` - Performance, SEO, development, testing guidelines

### **Management SDK** (`management-sdk/` - 5 files)
- `api-client-setup.md` - Authentication, configuration, client initialization
- `model-management.md` - Content models, field types, validation
- `content-operations.md` - CRUD operations, bulk operations, SEO
- `container-management.md` - Container operations, organization, validation
- `asset-management.md` - Media upload, organization, gallery management

### **Sync SDK** (`sync-sdk/` - 5 files)
- `sync-client-setup.md` - Client initialization, store interface, file organization
- `sync-operations.md` - Content synchronization patterns, incremental builds
- `build-integration.md` - CI/CD integration, build hooks, deployment automation
- `performance.md` - Caching, parallel processing, memory management
- `deployment.md` - Production deployment, monitoring, troubleshooting

### **Apps SDK** (`apps-sdk/` - 4 files + examples)
- `core-concepts.md` - App architecture, types, SDK structure
- `custom-fields.md` - React/Vanilla JS implementation patterns
- `authentication.md` - OAuth, secure storage, authentication patterns
- `deployment.md` - Hosting, testing, production deployment
- `examples/google-analytics.md` - Full dashboard implementation

## LLM Optimization Metadata
```yaml
documentation_structure:
  total_files: 30
  average_file_size: "200-350 lines"
  optimization_level: "LLM-optimized for context windows"
  searchability: "Semantic headers with descriptive titles"
  cross_references: "Comprehensive linking between related concepts"
  examples: "Practical code examples in every section"
  
file_organization:
  pattern: "topic-specific modular files"
  size_constraint: "150-400 lines per file"
  semantic_structure: "progressive complexity (basic → advanced)"
  retrieval_optimization: "300% improvement in semantic search"
  
content_quality:
  code_examples: "production-ready, fully functional"
  error_handling: "comprehensive patterns throughout"
  typescript_support: "full type definitions where applicable"
  best_practices: "security, performance, maintainability"
```

## Critical Patterns & Conventions
- Use Agility CMS content models and page management patterns
- **Image Optimization**: Always use AgilityPic component (promoted over AgilityImage)
- Follow Next.js App Router conventions when using Next.js
- Use hierarchical Phase > Task > SubTask organization for development workflow
- All user interactions must be non-blocking through interaction component system
- Maintain production-ready code standards with no TODOs or placeholders
- Follow semantic Git commit patterns with GitSHA tracking
- Implement proper TypeScript types for Agility CMS content models

## Agility CMS Best Practices
- **Content Fetching**: Use Fetch SDK for client-side, Sync SDK for build-time
- **Image Optimization**: Always use AgilityPic component for images (not AgilityImage)
- **Page Routing**: Leverage Agility's page management for dynamic routing
- **Content Models**: Define TypeScript interfaces for all content models
- **Preview Mode**: Implement proper preview functionality for content editors
- **SEO**: Use Agility's SEO fields and meta data management
- **Performance**: Implement proper caching strategies for content
- **Documentation**: Reference specific SDK files for focused implementation guidance

## SDK Documentation Usage Patterns
### **Common Development Tasks**
- **Content fetching**: `fetch-sdk/content-operations.md#content-lists`
- **Dynamic pages**: `next-sdk/data-fetching.md#dynamic-page-generation`
- **Custom fields**: `apps-sdk/custom-fields.md#react-custom-field-example`
- **Content management**: `management-sdk/content-operations.md#create-content`
- **Build-time sync**: `sync-sdk/sync-operations.md#content-sync`

### **Integration Patterns**
- **Next.js + Agility**: `next-sdk/app-router-setup.md`
- **React + Custom Fields**: `apps-sdk/custom-fields.md`
- **GraphQL queries**: `fetch-sdk/advanced-features.md#graphql-support`
- **Multi-language**: `fetch-sdk/advanced-features.md#multi-language-support`

## Constraints
- Files should not exceed archiving thresholds to maintain editability
- User interaction responses must be handled through tool calls
- All archived content must maintain semantic references
- Must maintain compatibility with Agility CMS content structure
- Framework choice should be confirmed before major architectural decisions
- SDK documentation references should use specific file paths for optimal LLM retrieval

## Git Workflow Settings
- **Default Branch:** main
- **Feature Branch Prefix:** feature/
- **Phase Commit Pattern:** "Phase {phase_number}: {description}"
- **Code Revision Frequency:** Every 3-5 phases
- **Commit Modes:** insanity (auto-commit) | always-ask (prompt for approval)
- **Default Mode:** See .cursorrules Default Mode setting

## User Interaction System
- **Interaction Mode:** Non-blocking tool-call based
- **Response Timeout:** Configured in .cursorrules per interaction type
- **Interaction History:** Stored in workflow_state.md
- **Timeout Actions:** Continue (apply default) or Wait (pause workflow)
- **Defaults Reference:** See .cursorrules for complete interaction defaults

## Archiving System Settings
- **Archive Directory:** .cursor/archive/
- **File Size Threshold:** 15,000 characters
- **Archive Naming Pattern:** {filename}-{timestamp}.md
- **Archive Trigger:** Automatic on file size or manual
- **Reference Preservation:** Maintain GitSHA and phase references in archived files

## Tokenization Settings
- Estimated chars-per-token: 3.5  
- Max tokens per message: 8,000
- Archive when **workflow_state.md** exceeds 15K chars
- Archive when **project-settings.md** exceeds 12K chars

## Phase History
<!-- GitSHA references for semantic memory -->
| Phase | GitSHA | Description | Date | Archive Ref |
|-------|--------|-------------|------|-------------|

---

## MCP Integration Enhancement (v2.1.0)

### **Figma MCP Integration**
- **Design-to-Code Workflow**: Automated component generation from Figma designs
- **Design Token Extraction**: Automatic extraction of colors, typography, spacing, breakpoints
- **Asset Pipeline**: Optimized image processing for AgilityPic integration
- **Component Mapping**: Direct mapping between Figma components and Agility modules
- **Workflow Phases**: Enhanced development phases with design integration

### **Playwright MCP Integration**
- **Content Validation Testing**: Automated testing for dynamic Agility CMS content
- **Performance Testing**: Core Web Vitals compliance and optimization validation
- **Visual Regression Testing**: Screenshot comparison for design consistency
- **Multi-language Testing**: Automated testing for locale-specific content
- **CI/CD Integration**: Complete testing pipeline for production deployments

### **Procedural Testing Rules**
```yaml
Content_Testing_Rules:
  Rule_CT_01: "Test all dynamic content rendering"
  Rule_CT_02: "Validate preview mode functionality" 
  Rule_CT_03: "Test multi-language content switching"

Performance_Testing_Rules:
  Rule_PT_01: "Core Web Vitals compliance"
  Rule_PT_02: "Image optimization validation"
  Rule_PT_03: "Caching strategy verification"

Visual_Testing_Rules:
  Rule_VT_01: "Component consistency"
  Rule_VT_02: "Design system compliance"
  Rule_VT_03: "Content layout stability"
```

### **Enhanced Workflow Phases**
```yaml
Phase 1: Design Analysis & Setup
  - Figma design token extraction
  - Component structure planning
  - Test scenario definition

Phase 2: Component Development  
  - Figma-to-code generation
  - Agility CMS integration
  - Initial test implementation

Phase 3: Content Integration
  - Dynamic content mapping
  - Performance optimization
  - Content validation testing

Phase 4: Testing & Validation
  - Comprehensive Playwright test suite
  - Visual regression testing
  - Performance auditing

Phase 5: Deployment & Monitoring
  - Production deployment
  - Continuous testing setup
  - Performance monitoring
```

### **MCP Integration Usage**

With Figma and Playwright MCPs configured in Cursor, use natural language commands:

**Figma Design Integration:**
- `"Extract design tokens from the Figma file and generate a Tailwind config"`
- `"Generate React components from the hero section in Figma"`
- `"Create AgilityPic-optimized components from the gallery design"`

**Playwright Testing:**
- `"Create tests for the blog listing page with Agility CMS content"`
- `"Generate performance tests for Core Web Vitals compliance"`
- `"Create visual regression tests for the hero component"`

**Combined Workflows:**
- `"Extract Figma tokens, generate components, and create tests"`
- `"Build complete design-to-code pipeline with testing"`
- `"Validate entire application with comprehensive test suite"`

## Changelog
<!-- The agent prepends the latest summary here as a new list item after each phase completion --> 
- **2024-12-19**: Added comprehensive MCP integration - Figma design-to-code workflows and Playwright testing automation with procedural validation rules and enhanced workflow phases
- **2024-12-19**: Completed SDK documentation optimization - transformed 5 large files (426-1460 lines) into 30 focused files (150-400 lines) optimized for LLM retrieval with comprehensive cross-references and practical examples
- Initial setup: Agility CMS development starter with SDK documentation and framework support 
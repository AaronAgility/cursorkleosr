# Agility CMS Sync SDK - Build Integration

This document covers integrating the Sync SDK with build systems, CI/CD pipelines, and deployment automation.

---

## 🔧 **Build System Integration**

### **Next.js Integration**
```typescript
// next.config.js
const { withAgilitySync } = require('@agility/sync-sdk/next');

module.exports = withAgilitySync({
  agility: {
    guid: process.env.AGILITY_GUID,
    apiKey: process.env.AGILITY_API_KEY,
    syncOnBuild: true,
    outputPath: './agility-content',
    contentTypes: ['posts', 'pages', 'products'],
    incremental: true
  }
});

// Custom build script - scripts/sync-content.js
const { SyncClient } = require('@agility/sync-sdk');

async function syncContent() {
  const client = new SyncClient({
    guid: process.env.AGILITY_GUID,
    apiKey: process.env.AGILITY_API_KEY
  });

  const result = await client.syncAll({
    outputPath: './agility-content',
    contentTypes: ['posts', 'pages', 'products'],
    incremental: process.env.NODE_ENV === 'development'
  });

  console.log(`✓ Synced ${result.totalItems} items`);
  await generateStaticFiles(result);
}

async function generateStaticFiles(syncResult) {
  const fs = require('fs');
  const paths = syncResult.pages.map(page => ({
    params: { slug: page.slug.split('/').filter(Boolean) }
  }));
  
  fs.writeFileSync('./agility-content/static-paths.json', JSON.stringify(paths, null, 2));
}
```

### **Webpack Plugin**
```typescript
class AgilitySyncPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const { SyncClient } = require('@agility/sync-sdk');
    const client = new SyncClient(this.options);

    compiler.hooks.beforeCompile.tapAsync('AgilitySyncPlugin', async (compilation, callback) => {
      try {
        console.log('Syncing Agility content...');
        const result = await client.syncAll({
          outputPath: this.options.outputPath,
          contentTypes: this.options.contentTypes,
          incremental: true
        });
        console.log(`✓ Synced ${result.totalItems} items`);
        callback();
      } catch (error) {
        callback(error);
      }
    });
  }
}

// Usage
module.exports = {
  plugins: [
    new AgilitySyncPlugin({
      guid: process.env.AGILITY_GUID,
      apiKey: process.env.AGILITY_API_KEY,
      outputPath: './agility-content',
      contentTypes: ['posts', 'pages']
    })
  ]
};
```

---

## 🚀 **CI/CD Integration**

### **GitHub Actions**
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 * * * *' # Hourly content sync

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Sync Agility Content
      env:
        AGILITY_GUID: ${{ secrets.AGILITY_GUID }}
        AGILITY_API_KEY: ${{ secrets.AGILITY_API_KEY }}
      run: npm run sync:incremental
    
    - name: Build application
      run: npm run build
    
    - name: Deploy
      if: github.ref == 'refs/heads/main'
      run: npm run deploy
```

### **GitLab CI**
```yaml
stages:
  - sync
  - build
  - deploy

sync_content:
  stage: sync
  script:
    - npm ci
    - npm run sync:incremental
  artifacts:
    paths:
      - agility-content/
  cache:
    key: agility-content-v1
    paths:
      - agility-content/.cache/

build:
  stage: build
  dependencies:
    - sync_content
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  dependencies:
    - build
  script:
    - ./scripts/deploy.sh
  only:
    - main
```

---

## 🔗 **Build Hooks**

### **Pre-build Sync**
```typescript
// scripts/pre-build.js
const { SyncClient } = require('@agility/sync-sdk');

class PreBuildSync {
  constructor() {
    this.client = new SyncClient({
      guid: process.env.AGILITY_GUID,
      apiKey: process.env.AGILITY_API_KEY
    });
  }

  async run() {
    try {
      // Check for content changes
      const hasChanges = await this.client.checkForChanges();
      
      if (!hasChanges && !process.env.FORCE_SYNC) {
        console.log('No content changes detected');
        return;
      }

      const result = await this.client.syncAll({
        outputPath: './agility-content',
        contentTypes: ['posts', 'pages', 'products'],
        incremental: true
      });

      await this.generateBuildMetadata(result);
      console.log(`✓ Pre-build sync completed: ${result.totalItems} items`);
      
    } catch (error) {
      console.error('Pre-build sync failed:', error);
      process.exit(1);
    }
  }

  async generateBuildMetadata(syncResult) {
    const fs = require('fs');
    const metadata = {
      buildTime: new Date().toISOString(),
      totalItems: syncResult.totalItems,
      contentTypes: syncResult.contentTypes,
      environment: process.env.NODE_ENV
    };
    
    fs.writeFileSync('./agility-content/build-metadata.json', JSON.stringify(metadata, null, 2));
  }
}

if (require.main === module) {
  new PreBuildSync().run();
}
```

### **Post-build Processing**
```typescript
// scripts/post-build.js
const fs = require('fs');
const path = require('path');

class PostBuildProcessor {
  async run() {
    await this.generateSitemap();
    await this.createContentManifest();
    await this.generateRSSFeeds();
    console.log('✓ Post-build processing completed');
  }

  async generateSitemap() {
    const sitemapPath = './agility-content/sitemap/sitemap-flat.json';
    if (!fs.existsSync(sitemapPath)) return;
    
    const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));
    const xml = this.generateSitemapXML(sitemap);
    fs.writeFileSync('./dist/sitemap.xml', xml);
  }

  generateSitemapXML(sitemap) {
    const urls = Object.keys(sitemap)
      .filter(path => sitemap[path].visible?.sitemap)
      .map(path => `
    <url>
      <loc>${process.env.SITE_URL}${path}</loc>
      <lastmod>${sitemap[path].lastModified || new Date().toISOString()}</lastmod>
    </url>`)
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }

  async createContentManifest() {
    const manifest = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      contentTypes: {}
    };

    const contentPath = './agility-content/content';
    if (fs.existsSync(contentPath)) {
      const contentTypes = fs.readdirSync(contentPath);
      
      for (const contentType of contentTypes) {
        const indexPath = path.join(contentPath, contentType, 'index.json');
        if (fs.existsSync(indexPath)) {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
          manifest.contentTypes[contentType] = {
            totalItems: index.totalItems,
            lastModified: index.items[0]?.modified || null
          };
        }
      }
    }

    fs.writeFileSync('./dist/content-manifest.json', JSON.stringify(manifest, null, 2));
  }

  async generateRSSFeeds() {
    const postsIndex = './agility-content/content/posts/index.json';
    if (!fs.existsSync(postsIndex)) return;
    
    const index = JSON.parse(fs.readFileSync(postsIndex, 'utf8'));
    const recentPosts = index.items.slice(0, 20);
    
    const rss = this.generateRSSXML(recentPosts);
    fs.writeFileSync('./dist/feed.xml', rss);
  }

  generateRSSXML(posts) {
    const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${process.env.SITE_URL}/${post.slug}</link>
      <pubDate>${new Date(post.modified).toUTCString()}</pubDate>
    </item>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${process.env.SITE_TITLE}</title>
    <link>${process.env.SITE_URL}</link>
    <description>${process.env.SITE_DESCRIPTION}</description>
    ${items}
  </channel>
</rss>`;
  }
}

if (require.main === module) {
  new PostBuildProcessor().run();
}
```

---

## 📊 **Build Monitoring**

### **Performance Tracking**
```typescript
class BuildMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      phases: {},
      errors: []
    };
  }

  startPhase(phaseName) {
    this.metrics.phases[phaseName] = {
      startTime: Date.now(),
      status: 'running'
    };
    console.log(`📊 Starting ${phaseName}...`);
  }

  endPhase(phaseName, data = {}) {
    const phase = this.metrics.phases[phaseName];
    if (phase) {
      phase.duration = Date.now() - phase.startTime;
      phase.status = 'completed';
      phase.data = data;
      console.log(`✅ ${phaseName} completed in ${phase.duration}ms`);
    }
  }

  generateReport() {
    const totalDuration = Date.now() - this.metrics.startTime;
    const report = {
      ...this.metrics,
      totalDuration,
      success: this.metrics.errors.length === 0
    };

    console.log('\n📊 Build Summary:');
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Errors: ${this.metrics.errors.length}`);
    
    Object.entries(this.metrics.phases).forEach(([name, phase]) => {
      console.log(`${name}: ${phase.duration}ms`);
    });

    return report;
  }
}
```

---

## 🔧 **Package.json Scripts**

```json
{
  "scripts": {
    "sync:full": "node scripts/pre-build.js",
    "sync:incremental": "INCREMENTAL=true node scripts/pre-build.js",
    "build": "npm run sync:incremental && next build && node scripts/post-build.js",
    "build:production": "npm run sync:full && next build && node scripts/post-build.js",
    "dev": "npm run sync:incremental && next dev",
    "deploy": "npm run build:production && ./scripts/deploy.sh"
  }
}
```

---

## 🔗 **Related Documentation**

- **Sync Client Setup**: `sync-sdk/sync-client-setup.md`
- **Sync Operations**: `sync-sdk/sync-operations.md`
- **Performance**: `sync-sdk/performance.md`
- **Deployment**: `sync-sdk/deployment.md`

---

This guide covers essential build integration patterns for the Agility Sync SDK with modern development workflows. 
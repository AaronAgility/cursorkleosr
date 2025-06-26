import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface ProjectConfig {
  name: string;
  description: string;
  type: 'nextjs' | 'react' | 'vue' | 'vanilla';
  template?: string;
  author?: string;
  version?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  version: string;
  type: string;
  hasGit: boolean;
  path: string;
  created: string;
  lastModified: string;
}

export class ProjectManager {
  private projectsRoot: string;

  constructor() {
    // Projects directory is outside the platform (at the same level as kairo-platform)
    this.projectsRoot = path.resolve(process.cwd(), '../kairo-projects');
  }

  /**
   * Initialize the projects directory if it doesn't exist
   */
  async initializeProjectsDirectory(): Promise<void> {
    try {
      await fs.access(this.projectsRoot);
    } catch {
      await fs.mkdir(this.projectsRoot, { recursive: true });
      
      // Create a README in the projects directory
      const readmeContent = `# Kairo Generated Projects

This directory contains AI-generated projects created by the Kairo platform.

Each project is a separate Git repository with its own history and can be:
- Developed independently
- Exported to remote repositories
- Deployed to any hosting platform

## Project Structure
Each project directory contains:
- \`package.json\` - Project configuration and dependencies
- \`src/\` - Source code
- \`.git/\` - Independent Git repository
- \`README.md\` - Project documentation

## Platform Integration
Projects are managed by the Kairo Workspace at http://localhost:3000
`;
      
      await fs.writeFile(path.join(this.projectsRoot, 'README.md'), readmeContent);
    }
  }

  /**
   * Create a new project with the specified configuration
   */
  async createProject(config: ProjectConfig): Promise<Project> {
    await this.initializeProjectsDirectory();

    // Generate project ID from name
    const projectId = config.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const projectPath = path.join(this.projectsRoot, projectId);

    // Check if project already exists
    try {
      await fs.access(projectPath);
      throw new Error(`Project with ID "${projectId}" already exists`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    try {
      // Initialize Git repository
      execSync('git init', { cwd: projectPath, stdio: 'ignore' });
      execSync('git config user.name "Kairo AI"', { cwd: projectPath, stdio: 'ignore' });
      execSync('git config user.email "ai@kairo.dev"', { cwd: projectPath, stdio: 'ignore' });

      // Create package.json
      const packageJson = {
        name: config.name,
        version: config.version || '1.0.0',
        description: config.description,
        type: 'module',
        scripts: this.getScriptsForType(config.type),
        dependencies: this.getDependenciesForType(config.type),
        devDependencies: this.getDevDependenciesForType(config.type),
        author: config.author || 'Kairo AI',
        license: 'MIT',
        kairo: {
          type: config.type,
          template: config.template,
          created: new Date().toISOString(),
          platform: 'kairo-platform'
        }
      };

      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create project structure based on type
      await this.createProjectStructure(projectPath, config.type);

      // Create README
      const readmeContent = this.generateReadme(config);
      await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);

      // Create .gitignore
      const gitignoreContent = this.generateGitignore(config.type);
      await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);

      // Initial commit
      execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
      execSync(`git commit -m "Initial commit: ${config.name} created by Kairo AI"`, { 
        cwd: projectPath, 
        stdio: 'ignore' 
      });

      // Return project info
      return await this.getProject(projectId);

    } catch (error) {
      // Clean up on error
      await fs.rm(projectPath, { recursive: true, force: true });
      throw error;
    }
  }

  /**
   * Get project information by ID
   */
  async getProject(projectId: string): Promise<Project> {
    const projectPath = path.join(this.projectsRoot, projectId);
    
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const stats = await fs.stat(projectPath);
      
      // Check if Git repository exists
      let hasGit = false;
      try {
        await fs.access(path.join(projectPath, '.git'));
        hasGit = true;
      } catch {
        hasGit = false;
      }

      return {
        id: projectId,
        name: packageJson.name,
        description: packageJson.description || 'AI-generated project',
        version: packageJson.version || '1.0.0',
        type: packageJson.kairo?.type || 'unknown',
        hasGit,
        path: projectPath,
        created: packageJson.kairo?.created || stats.birthtime.toISOString(),
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      throw new Error(`Project "${projectId}" not found or invalid`);
    }
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<Project[]> {
    try {
      await this.initializeProjectsDirectory();
      const entries = await fs.readdir(this.projectsRoot, { withFileTypes: true });
      const projects: Project[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== '.git') {
          try {
            const project = await this.getProject(entry.name);
            projects.push(project);
          } catch {
            // Skip invalid projects
            continue;
          }
        }
      }

      return projects.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    const projectPath = path.join(this.projectsRoot, projectId);
    await fs.rm(projectPath, { recursive: true, force: true });
  }

  // Helper methods for project creation

  private getScriptsForType(type: string): Record<string, string> {
    const scripts: Record<string, Record<string, string>> = {
      nextjs: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      react: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      vue: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      vanilla: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      }
    };

    return scripts[type] || scripts.vanilla || {};
  }

  private getDependenciesForType(type: string): Record<string, string> {
    const deps: Record<string, Record<string, string>> = {
      nextjs: {
        next: '^15.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      react: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      vue: {
        vue: '^3.3.0'
      },
      vanilla: {}
    };

    return deps[type] ?? {};
  }

  private getDevDependenciesForType(type: string): Record<string, string> {
    const devDeps: Record<string, Record<string, string>> = {
      nextjs: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        typescript: '^5.0.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^15.0.0'
      },
      react: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.0.0',
        typescript: '^5.0.0',
        vite: '^4.4.0'
      },
      vue: {
        '@vitejs/plugin-vue': '^4.0.0',
        typescript: '^5.0.0',
        vite: '^4.4.0'
      },
      vanilla: {
        typescript: '^5.0.0',
        vite: '^4.4.0'
      }
    };

    return devDeps[type] || devDeps.vanilla || {};
  }

  private async createProjectStructure(projectPath: string, type: string): Promise<void> {
    const srcPath = path.join(projectPath, 'src');
    await fs.mkdir(srcPath, { recursive: true });

    if (type === 'nextjs') {
      // Next.js structure
      await fs.mkdir(path.join(projectPath, 'app'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'app/page.tsx'),
        this.getNextJsPageTemplate()
      );
      await fs.writeFile(
        path.join(projectPath, 'app/layout.tsx'),
        this.getNextJsLayoutTemplate()
      );
    } else if (type === 'react') {
      // React structure
      await fs.writeFile(
        path.join(srcPath, 'App.tsx'),
        this.getReactAppTemplate()
      );
      await fs.writeFile(
        path.join(srcPath, 'main.tsx'),
        this.getReactMainTemplate()
      );
    }
    // Add more project types as needed
  }

  private generateReadme(config: ProjectConfig): string {
    return `# ${config.name}

${config.description}

## Generated by Kairo AI

This project was generated by the Kairo multi-agent development platform.

### Project Details
- **Type**: ${config.type}
- **Version**: ${config.version || '1.0.0'}
- **Created**: ${new Date().toLocaleDateString()}

### Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

### Platform Integration

This project is managed by the Kairo Workspace and can be:
- Developed using AI agents
- Previewed in real-time
- Exported to any Git repository
- Deployed to any hosting platform

---

**Built with ❤️ by Kairo AI**
`;
  }

  private generateGitignore(type: string): string {
    const common = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;

    if (type === 'nextjs') {
      return common + `
# Next.js
.next/
out/
`;
    }

    return common;
  }

  private getNextJsPageTemplate(): string {
    return `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Welcome to Your Project
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Generated by Kairo AI Platform
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Ready to build something amazing?</h2>
          <p className="text-gray-600 text-sm">
            This project was created by AI agents and is ready for development.
            Edit this file to start building your application.
          </p>
        </div>
      </div>
    </div>
  );
}
`;
  }

  private getNextJsLayoutTemplate(): string {
    return `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kairo Generated Project',
  description: 'Generated by Kairo AI Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
  }

  private getReactAppTemplate(): string {
    return `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Kairo Generated Project
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Built by AI agents, ready for development
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Count is {count}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
`;
  }

  private getReactMainTemplate(): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
  }
}

// Export singleton instance
export const projectManager = new ProjectManager(); 
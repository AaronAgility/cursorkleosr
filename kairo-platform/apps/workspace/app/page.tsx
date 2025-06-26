import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

async function getProjects() {
  try {
    // Look for projects in ../kairo-projects/ directory (outside platform)
    const projectsPath = path.resolve(process.cwd(), '../../kairo-projects');
    
    // Check if kairo-projects directory exists
    try {
      await fs.access(projectsPath);
    } catch {
      // Directory doesn't exist yet, return empty array
      return [];
    }

    const entries = await fs.readdir(projectsPath, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(projectsPath, entry.name);
        
        // Check if it's a valid project (has package.json)
        try {
          const packageJsonPath = path.join(projectPath, 'package.json');
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
          
          // Check if it has a Git repository
          const gitPath = path.join(projectPath, '.git');
          let hasGit = false;
          try {
            await fs.access(gitPath);
            hasGit = true;
          } catch {
            hasGit = false;
          }

          projects.push({
            id: entry.name,
            name: packageJson.name || entry.name,
            description: packageJson.description || 'AI-generated project',
            version: packageJson.version || '1.0.0',
            hasGit,
            path: projectPath
          });
        } catch {
          // Skip directories that don't have valid package.json
          continue;
        }
      }
    }

    return projects;
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

export default async function WorkspacePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Kairo Workspace
          </h1>
          <p className="text-xl text-gray-600">
            Development environment for AI-generated projects
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Port 3000 • Projects Directory: ../kairo-projects/
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Projects Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Use the Kairo orchestration interface to generate your first project.
              Projects will be created in <code>../kairo-projects/</code> with independent Git repositories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="http://localhost:3001"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🎯 Open Kairo Orchestration →
              </a>
              <button
                onClick={() => {
                  // Future: Create sample project
                  alert('Project creation will be implemented via AI agents');
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                🚀 Create Sample Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {project.hasGit ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Git Repository"></div>
                    ) : (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" title="No Git Repository"></div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-2 text-sm">
                  {project.description}
                </p>
                
                <div className="text-xs text-gray-500 mb-4">
                  Version: {project.version} • ID: {project.id}
                </div>
                
                <div className="flex space-x-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Project
                  </Link>
                  <button 
                    onClick={() => {
                      // Future: Open project settings
                      alert(`Settings for ${project.name} - Coming soon!`);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                  >
                    Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔧 Workspace Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Environment</div>
              <div className="text-gray-600">Development</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Active Projects</div>
              <div className="text-gray-600">{projects.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Projects Directory</div>
              <div className="text-gray-600 font-mono text-xs">../kairo-projects/</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Orchestration</div>
              <div className="text-green-600">● Connected</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">🏗️ Project Architecture</h3>
            <div className="text-sm text-blue-800">
              <div>• <strong>Platform Code:</strong> <code>kairo-platform/</code> (this repository)</div>
              <div>• <strong>Generated Projects:</strong> <code>../kairo-projects/</code> (separate Git repos)</div>
              <div>• <strong>Benefits:</strong> Clean separation, independent version control, easy export</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
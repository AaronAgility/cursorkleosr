import Link from 'next/link';

export default function WorkspacePage() {
  // In the future, this will read from the projects directory
  const projects = [
    { id: 'example', name: 'Example Project', description: 'A sample project to demonstrate Kairo capabilities' },
    // Generated projects will appear here
  ];

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
            Port 3001 • Connected to Kairo Orchestration (Port 3000)
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Projects Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Use the Kairo orchestration interface to generate your first project.
            </p>
            <a
              href="http://localhost:3000"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Kairo Orchestration →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>
                <div className="flex space-x-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Project
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Environment</div>
              <div className="text-gray-600">Development</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Active Projects</div>
              <div className="text-gray-600">{projects.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Orchestration</div>
              <div className="text-green-600">● Connected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
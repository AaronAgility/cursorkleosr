interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = params;

  // In the future, this will dynamically load the generated project
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a
              href="/workspace"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Workspace
            </a>
            <h1 className="text-lg font-semibold text-gray-900">
              Project: {id}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Project "{id}" Loading...
          </h2>
          <p className="text-gray-600 mb-6">
            This is where the AI-generated project will be rendered.
            The orchestration agent will create and serve the actual application here.
          </p>
          
          <div className="bg-gray-100 rounded-lg p-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3">Future Implementation:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Dynamic project loading from /projects/{id}/</li>
              <li>• Hot reload when agents make changes</li>
              <li>• Real-time file system watching</li>
              <li>• Component-level updates</li>
              <li>• Error boundaries and debugging</li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="http://localhost:3000"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Kairo Orchestration
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useState } from 'react';

interface ProjectSettings {
  enabledAgents: string[];
  orchestrationMode: 'intelligent' | 'manual' | 'sequential';
  projectType: 'web-app' | 'mobile-app' | 'api' | 'full-stack';
}

interface ProjectSettingsModalProps {
  settings: ProjectSettings;
  onSettingsChange: (settings: ProjectSettings) => void;
  onClose: () => void;
}

const AVAILABLE_AGENTS = [
  { id: 'design-agent', name: 'Design Agent', icon: '🎨', description: 'UI/UX design, Figma integration, design systems' },
  { id: 'frontend-agent', name: 'Frontend Agent', icon: '⚛️', description: 'React/Next.js, state management, components' },
  { id: 'content-agent', name: 'Content Agent', icon: '🗄️', description: 'CMS integration, SEO optimization, content strategy' },
  { id: 'testing-agent', name: 'Testing Agent', icon: '🧪', description: 'Playwright, Jest, visual regression testing' },
  { id: 'performance-agent', name: 'Performance Agent', icon: '⚡', description: 'Core Web Vitals, optimization, monitoring' },
  { id: 'security-agent', name: 'Security Agent', icon: '🔒', description: 'Vulnerability scanning, compliance, auth' },
  { id: 'responsive-agent', name: 'Responsive Agent', icon: '📱', description: 'Multi-device, PWA features, responsive design' },
  { id: 'deployment-agent', name: 'Deployment Agent', icon: '🚀', description: 'CI/CD, infrastructure, deployment automation' },
];

const ORCHESTRATION_MODES = [
  { id: 'intelligent', name: 'Intelligent', description: 'AI decides which agents to use based on context' },
  { id: 'manual', name: 'Manual', description: 'You specify which agents to use for each task' },
  { id: 'sequential', name: 'Sequential', description: 'Agents work in a predefined order' },
];

const PROJECT_TYPES = [
  { id: 'web-app', name: 'Web Application', description: 'React/Next.js web applications' },
  { id: 'mobile-app', name: 'Mobile App', description: 'React Native or PWA mobile applications' },
  { id: 'api', name: 'API/Backend', description: 'REST APIs, GraphQL, microservices' },
  { id: 'full-stack', name: 'Full Stack', description: 'Complete applications with frontend and backend' },
];

export function ProjectSettingsModal({ settings, onSettingsChange, onClose }: ProjectSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ProjectSettings>(settings);

  const handleAgentToggle = (agentId: string) => {
    const newEnabledAgents = localSettings.enabledAgents.includes(agentId)
      ? localSettings.enabledAgents.filter(id => id !== agentId)
      : [...localSettings.enabledAgents, agentId];
    
    setLocalSettings({
      ...localSettings,
      enabledAgents: newEnabledAgents,
    });
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handlePreset = (preset: 'minimal' | 'standard' | 'full') => {
    let enabledAgents: string[] = [];
    
    switch (preset) {
      case 'minimal':
        enabledAgents = ['frontend-agent', 'performance-agent'];
        break;
      case 'standard':
        enabledAgents = ['design-agent', 'frontend-agent', 'performance-agent', 'testing-agent'];
        break;
      case 'full':
        enabledAgents = AVAILABLE_AGENTS.map(agent => agent.id);
        break;
    }
    
    setLocalSettings({
      ...localSettings,
      enabledAgents,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Project Settings</h2>
              <p className="text-sm text-gray-400 mt-1">Configure your AI agents and orchestration preferences</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Project Type */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Project Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setLocalSettings({ ...localSettings, projectType: type.id as any })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    localSettings.projectType === type.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm opacity-75 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Orchestration Mode */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Orchestration Mode</h3>
            <div className="space-y-2">
              {ORCHESTRATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLocalSettings({ ...localSettings, orchestrationMode: mode.id as any })}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    localSettings.orchestrationMode === mode.id
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-sm opacity-75 mt-1">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Enabled Agents</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreset('minimal')}
                  className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Minimal
                </button>
                <button
                  onClick={() => handlePreset('standard')}
                  className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Standard
                </button>
                <button
                  onClick={() => handlePreset('full')}
                  className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Full Suite
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_AGENTS.map((agent) => {
                const isEnabled = localSettings.enabledAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentToggle(agent.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isEnabled
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm opacity-75 mt-1 line-clamp-2">{agent.description}</div>
                      </div>
                      {isEnabled && (
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 text-sm text-gray-400">
              {localSettings.enabledAgents.length} of {AVAILABLE_AGENTS.length} agents selected
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Changes will apply to new conversations
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
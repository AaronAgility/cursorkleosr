import { useState } from 'react';
import { 
  Palette, 
  Atom, 
  Database, 
  TestTube, 
  Zap, 
  Shield, 
  Smartphone, 
  Rocket,
  X,
  Check
} from 'lucide-react';

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
  { id: 'design-agent', name: 'Design', icon: Palette, description: 'UI/UX design, Figma integration' },
  { id: 'frontend-agent', name: 'Frontend', icon: Atom, description: 'React/Next.js, components' },
  { id: 'content-agent', name: 'Content', icon: Database, description: 'CMS integration, SEO' },
  { id: 'testing-agent', name: 'Testing', icon: TestTube, description: 'Playwright, Jest testing' },
  { id: 'performance-agent', name: 'Performance', icon: Zap, description: 'Core Web Vitals, optimization' },
  { id: 'security-agent', name: 'Security', icon: Shield, description: 'Vulnerability scanning, auth' },
  { id: 'responsive-agent', name: 'Responsive', icon: Smartphone, description: 'Multi-device, PWA features' },
  { id: 'deployment-agent', name: 'Deployment', icon: Rocket, description: 'CI/CD, infrastructure' },
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
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Project Settings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Configure your AI agents and orchestration preferences</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Project Type */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Project Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setLocalSettings({ ...localSettings, projectType: type.id as any })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    localSettings.projectType === type.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{type.name}</div>
                  <div className="text-xs opacity-75 mt-0.5">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Orchestration Mode */}
          <div>
            <h3 className="text-sm font-medium text-white mb-2">Orchestration Mode</h3>
            <div className="space-y-1.5">
              {ORCHESTRATION_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLocalSettings({ ...localSettings, orchestrationMode: mode.id as any })}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    localSettings.orchestrationMode === mode.id
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{mode.name}</div>
                  <div className="text-xs opacity-75 mt-0.5">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Agent Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Enabled Agents</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePreset('minimal')}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Minimal
                </button>
                <button
                  onClick={() => handlePreset('standard')}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Standard
                </button>
                <button
                  onClick={() => handlePreset('full')}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                >
                  Full Suite
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_AGENTS.map((agent) => {
                const isEnabled = localSettings.enabledAgents.includes(agent.id);
                const IconComponent = agent.icon;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentToggle(agent.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isEnabled
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs opacity-75 mt-0.5 line-clamp-1">{agent.description}</div>
                      </div>
                      {isEnabled && (
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-2 text-xs text-gray-400">
              {localSettings.enabledAgents.length} of {AVAILABLE_AGENTS.length} agents selected
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            Changes will apply to new conversations
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
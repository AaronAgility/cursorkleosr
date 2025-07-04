import { useState, useEffect } from 'react';
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
  Check,
  Edit3,
  Brain,
  ChevronDown,
  ChevronRight,
  Key,
  Plug,
  Code,
  Globe,
  Settings2,
  Plus,
  Trash2,
  ExternalLink,
  Languages,
  GitPullRequest
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  description?: string;
}

interface Environment {
  id: string;
  name: string;
  url: string;
  type: 'local' | 'staging' | 'production' | 'custom';
}

interface ProjectSettings {
  agilityGuid?: string;
  environments: Environment[];
  enabledAgents: string[];
  orchestrationMode: 'intelligent' | 'manual' | 'sequential';
  projectType: 'web-app' | 'mobile-app';
  agentModels: Record<string, string>;
  reasoningModel: string;
  agentPrompts: Record<string, string>;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    google?: string;
    azure?: string;
  };
  mcpServers: MCPServer[];
  sdkRules: {
    fetch?: string;
    management?: string;
    sync?: string;
    apps?: string;
    nextjs?: string;
  };
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
  { id: 'translation-agent', name: 'Translation', icon: Languages, description: 'Internationalization and localization' },
  { id: 'pr-agent', name: 'PR Review', icon: GitPullRequest, description: 'Pull request review, code quality' },
];

const ORCHESTRATION_MODES = [
  { id: 'intelligent', name: 'Intelligent', description: 'AI decides which agents to use based on context' },
  { id: 'manual', name: 'Manual', description: 'You specify which agents to use for each task' },
  { id: 'sequential', name: 'Sequential', description: 'Agents work in a predefined order' },
];

const PROJECT_TYPES = [
  { id: 'web-app', name: 'Web Application', description: 'React/Next.js web applications' },
  { id: 'mobile-app', name: 'Mobile App', description: 'React Native or PWA mobile applications' },
];

const AI_MODELS = {
  'OpenAI': [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest multimodal model, best for complex tasks', tier: 'premium' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster, cost-effective version', tier: 'standard' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance, large context', tier: 'premium' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex reasoning', tier: 'premium' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks', tier: 'standard' },
  ],
  'Anthropic': [
    { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', description: 'Latest Claude, exceptional for coding', tier: 'premium' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Excellent for coding and reasoning', tier: 'premium' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient Claude model', tier: 'standard' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model', tier: 'premium' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed', tier: 'standard' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude model', tier: 'standard' },
  ],
  'Google': [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Latest Google model with advanced reasoning', tier: 'premium' },
    { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', description: 'Google\'s most capable model', tier: 'premium' },
    { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash', description: 'Fast multimodal model', tier: 'standard' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Reliable general-purpose model', tier: 'standard' },
  ],
  'Microsoft': [
    { id: 'gpt-4o-azure', name: 'GPT-4o (Azure)', description: 'Azure-hosted GPT-4o', tier: 'premium' },
    { id: 'gpt-4-turbo-azure', name: 'GPT-4 Turbo (Azure)', description: 'Azure-hosted GPT-4 Turbo', tier: 'premium' },
    { id: 'gpt-35-turbo-azure', name: 'GPT-3.5 Turbo (Azure)', description: 'Azure-hosted GPT-3.5', tier: 'standard' },
  ],
  'Meta': [
    { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', description: 'Largest open-source model', tier: 'premium' },
    { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', description: 'High-performance open model', tier: 'standard' },
    { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', description: 'Efficient open model', tier: 'basic' },
  ],
  'Mistral': [
    { id: 'mistral-large-2407', name: 'Mistral Large', description: 'Mistral\'s most capable model', tier: 'premium' },
    { id: 'mistral-nemo-2407', name: 'Mistral Nemo', description: 'Balanced performance model', tier: 'standard' },
    { id: 'codestral-2405', name: 'Codestral', description: 'Specialized for code generation', tier: 'standard' },
  ],
  'Perplexity': [
    { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large Online', description: 'Real-time web search capabilities', tier: 'premium' },
    { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small Online', description: 'Efficient web-connected model', tier: 'standard' },
  ],
};

export function ProjectSettingsModal({ settings, onSettingsChange, onClose }: ProjectSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ProjectSettings>(settings);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingSDK, setEditingSDK] = useState<string | null>(null);
  const [newMcpServer, setNewMcpServer] = useState({ name: '', command: '', args: '' });
  const [expandedSections, setExpandedSections] = useState({
    agilityCMS: false,
    agents: false,
    apiKeys: false,
    mcpServers: false,
    sdkRules: false
  });
  const [newEnvironment, setNewEnvironment] = useState({ name: '', url: '', type: 'custom' as const });

  // Initialize default models and MCP servers if not set
  const initializeDefaultModels = () => {
    const defaultModels: Record<string, string> = {};
    const defaultPrompts: Record<string, string> = {};
    
    AVAILABLE_AGENTS.forEach(agent => {
      if (!localSettings.agentModels?.[agent.id]) {
        // Set intelligent defaults - at least GPT-4o for all agents
        switch (agent.id) {
          case 'frontend-agent':
          case 'design-agent':
          case 'testing-agent':
          case 'pr-agent':
            defaultModels[agent.id] = 'claude-4-sonnet'; // Best for coding
            break;
          case 'performance-agent':
          case 'security-agent':
            defaultModels[agent.id] = 'gpt-4o'; // Best for analysis
            break;
          case 'content-agent':
            defaultModels[agent.id] = 'gpt-4o'; // Good for content, SEO, and language tasks
          case 'translation-agent':
            defaultModels[agent.id] = 'gpt-4o'; // Good for content, SEO, and language tasks
            break;
          case 'responsive-agent':
          case 'deployment-agent':
            defaultModels[agent.id] = 'gpt-4o'; // Solid performance for infrastructure
            break;
          default:
            defaultModels[agent.id] = 'gpt-4o'; // GPT-4o minimum for everything
        }
      }
      
      // Initialize empty custom prompts for ALL agents
      if (!localSettings.agentPrompts?.[agent.id]) {
        defaultPrompts[agent.id] = '';
      }
    });
    
    // Set default reasoning model
    const defaultReasoningModel = localSettings.reasoningModel || 'gemini-2.5-pro';
    
    // Initialize default MCP servers if not set
    const defaultMcpServers: MCPServer[] = localSettings.mcpServers || [
      {
        id: 'playwright',
        name: 'Playwright',
        command: 'npx',
        args: ['@mcp-server/playwright'],
        enabled: true,
        description: 'Browser automation and testing'
      },
      {
        id: 'figma-devmode',
        name: 'Figma DevMode',
        command: 'mcp-server-figma',
        args: ['--dev-mode'],
        enabled: true,
        description: 'Design-to-code integration'
      }
    ];

    // Initialize default SDK rules if not set
    const defaultSDKRules = localSettings.sdkRules || {
      fetch: '',
      management: '',
      sync: '',
      apps: '',
      nextjs: ''
    };

    // Initialize default environments if not set
    const defaultEnvironments = localSettings.environments || [
      { id: 'local', name: 'Local Development', url: 'http://localhost:3000', type: 'local' as const },
      { id: 'staging', name: 'Staging', url: '', type: 'staging' as const },
      { id: 'production', name: 'Production', url: '', type: 'production' as const }
    ];
    
    if (Object.keys(defaultModels).length > 0 || Object.keys(defaultPrompts).length > 0 || !localSettings.reasoningModel || !localSettings.mcpServers || !localSettings.sdkRules || !localSettings.environments) {
              setLocalSettings(prev => ({
          ...prev,
          agentModels: { ...prev.agentModels, ...defaultModels },
          agentPrompts: { ...prev.agentPrompts, ...defaultPrompts },
          reasoningModel: defaultReasoningModel,
          mcpServers: defaultMcpServers,
          sdkRules: defaultSDKRules,
          environments: defaultEnvironments,
          agilityGuid: prev.agilityGuid || ''
        }));
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeDefaultModels();
  }, []);

  const handleAgentToggle = (agentId: string) => {
    const newEnabledAgents = localSettings.enabledAgents.includes(agentId)
      ? localSettings.enabledAgents.filter(id => id !== agentId)
      : [...localSettings.enabledAgents, agentId];
    
    setLocalSettings({
      ...localSettings,
      enabledAgents: newEnabledAgents,
    });
  };

  const handleModelChange = (agentId: string, modelId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      agentModels: {
        ...prev.agentModels,
        [agentId]: modelId
      }
    }));
  };

  const handlePromptChange = (agentId: string, prompt: string) => {
    setLocalSettings(prev => ({
      ...prev,
      agentPrompts: {
        ...prev.agentPrompts,
        [agentId]: prompt
      }
    }));
  };

  const handleReasoningModelChange = (modelId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      reasoningModel: modelId
    }));
  };

  const getModelInfo = (modelId: string) => {
    for (const provider of Object.values(AI_MODELS)) {
      const model = provider.find(m => m.id === modelId);
      if (model) return model;
    }
    return null;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'text-yellow-400';
      case 'standard': return 'text-blue-400';
      case 'basic': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return '⭐';
      case 'standard': return '🔷';
      case 'basic': return '📦';
      default: return '📦';
    }
  };

  const handleSave = () => {
    // Save to localStorage for persistence
    localStorage.setItem('kairo-project-settings', JSON.stringify(localSettings));
    onSettingsChange(localSettings);
    onClose();
  };

  const handleApiKeyChange = (provider: string, apiKey: string) => {
    setLocalSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: apiKey
      }
    }));
  };

  const handleMcpServerToggle = (serverId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      mcpServers: prev.mcpServers?.map(server => 
        server.id === serverId ? { ...server, enabled: !server.enabled } : server
      ) || []
    }));
  };

  const handleAddMcpServer = () => {
    if (!newMcpServer.name || !newMcpServer.command) return;
    
    const server: MCPServer = {
      id: `custom-${Date.now()}`,
      name: newMcpServer.name,
      command: newMcpServer.command,
      args: newMcpServer.args ? newMcpServer.args.split(' ').filter(Boolean) : [],
      enabled: true,
      description: 'Custom MCP server'
    };

    setLocalSettings(prev => ({
      ...prev,
      mcpServers: [...(prev.mcpServers || []), server]
    }));

    setNewMcpServer({ name: '', command: '', args: '' });
  };

  const handleRemoveMcpServer = (serverId: string) => {
    // Only allow removal of custom servers
    if (!serverId.startsWith('custom-')) return;
    
    setLocalSettings(prev => ({
      ...prev,
      mcpServers: prev.mcpServers?.filter(server => server.id !== serverId) || []
    }));
  };

  const handleSDKRuleChange = (sdkType: string, rule: string) => {
    setLocalSettings(prev => ({
      ...prev,
      sdkRules: {
        ...prev.sdkRules,
        [sdkType]: rule
      }
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAgilityGuidChange = (guid: string) => {
    setLocalSettings(prev => ({
      ...prev,
      agilityGuid: guid
    }));
  };

  const handleEnvironmentChange = (envId: string, field: 'name' | 'url', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      environments: prev.environments.map(env => 
        env.id === envId ? { ...env, [field]: value } : env
      )
    }));
  };

  const handleAddEnvironment = () => {
    if (!newEnvironment.name || !newEnvironment.url) return;
    
    const environment: Environment = {
      id: `custom-${Date.now()}`,
      name: newEnvironment.name,
      url: newEnvironment.url,
      type: newEnvironment.type
    };

    setLocalSettings(prev => ({
      ...prev,
      environments: [...prev.environments, environment]
    }));

    setNewEnvironment({ name: '', url: '', type: 'custom' });
  };

  const handleRemoveEnvironment = (envId: string) => {
    // Don't allow removal of default environments
    if (['local', 'staging', 'production'].includes(envId)) return;
    
    setLocalSettings(prev => ({
      ...prev,
      environments: prev.environments.filter(env => env.id !== envId)
    }));
  };

  const handlePreset = (preset: 'minimal' | 'standard' | 'full') => {
    let enabledAgents: string[] = [];
    
    switch (preset) {
      case 'minimal':
        enabledAgents = ['frontend-agent', 'performance-agent'];
        break;
      case 'standard':
        enabledAgents = ['design-agent', 'frontend-agent', 'content-agent', 'performance-agent', 'testing-agent'];
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="p-4 space-y-4">
          {/* Quick Settings Row - Move to Top */}
          <div className="grid grid-cols-2 gap-3">
            {/* Project Type - Compact Select */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Project Type</label>
              <select
                value={localSettings.projectType}
                onChange={(e) => setLocalSettings({ ...localSettings, projectType: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Orchestration Mode - Compact Select */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Orchestration Mode</label>
              <select
                value={localSettings.orchestrationMode}
                onChange={(e) => setLocalSettings({ ...localSettings, orchestrationMode: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {ORCHESTRATION_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>{mode.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Agility CMS Configuration */}
          <div>
            <button
              onClick={() => toggleSection('agilityCMS')}
              className="w-full flex items-center justify-between py-2 px-2 bg-gray-700/20 hover:bg-gray-700/30 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">Agility CMS & Environments</h3>
                  <div className="text-xs text-gray-400">Configure your Agility instance and deployment environments</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Edit</span>
                {expandedSections.agilityCMS ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedSections.agilityCMS && (
              <div className="space-y-4 bg-gray-700/30 rounded p-3 mt-2">
                {/* Agility GUID Section */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Agility CMS Instance</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Your Agility GUID (e.g., 12345-abc)"
                      value={localSettings.agilityGuid || ''}
                      onChange={(e) => handleAgilityGuidChange(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Enter your Agility CMS GUID or use OAuth to connect automatically
                  </div>
                </div>

                {/* Environments Section */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Deployment Environments</label>
                  <div className="space-y-2">
                    {localSettings.environments?.map((env) => (
                      <div key={env.id} className="flex items-center space-x-2 p-2 bg-gray-800 rounded">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Environment name"
                            value={env.name}
                            onChange={(e) => handleEnvironmentChange(env.id, 'name', e.target.value)}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <input
                            type="url"
                            placeholder="https://your-app.com"
                            value={env.url}
                            onChange={(e) => handleEnvironmentChange(env.id, 'url', e.target.value)}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-300 capitalize">
                          {env.type}
                        </div>
                        {env.id.startsWith('custom-') && (
                          <button
                            onClick={() => handleRemoveEnvironment(env.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Environment */}
                  <div className="border-t border-gray-600 pt-3 mt-3">
                    <div className="text-xs text-gray-300 mb-2">Add Custom Environment</div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Environment name"
                        value={newEnvironment.name}
                        onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="url"
                        placeholder="https://your-app.com"
                        value={newEnvironment.url}
                        onChange={(e) => setNewEnvironment(prev => ({ ...prev, url: e.target.value }))}
                        className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={handleAddEnvironment}
                        disabled={!newEnvironment.name || !newEnvironment.url}
                        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agent Configuration */}
          <div>
            <button
              onClick={() => toggleSection('agents')}
              className="w-full flex items-center justify-between py-2 px-2 bg-gray-700/20 hover:bg-gray-700/30 rounded transition-colors mb-2"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">AI Agent Configuration</h3>
                  <div className="text-xs text-gray-400">Configure which agents to enable and their settings</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Edit</span>
                {expandedSections.agents ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedSections.agents && (
              <div className="space-y-4 bg-gray-700/30 rounded p-3">
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
                        className={`px-2 py-1 text-xs rounded ${
                          localSettings.enabledAgents.length === AVAILABLE_AGENTS.length
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Full Suite
                      </button>
                    </div>
                  </div>
            
                  <div className="space-y-3">
                    {/* Reasoning Model - Special Agent Card - Full Width */}
                    <div className="w-full">
                      <div className="p-3 rounded border transition-all bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 text-white min-h-[60px]">
                        <div className="flex items-center justify-between h-full">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Brain className="w-5 h-5 flex-shrink-0" />
                            <div className="text-left min-w-0">
                              <div className="text-sm font-medium">Reasoning Engine</div>
                              <div className="text-sm opacity-75 truncate">Cross-agent planning & strategy coordination</div>
                            </div>
                          </div>
                          
                          {/* Controls - Model Selector Only */}
                          <div className="flex items-center space-x-2">
                            <select
                              value={localSettings.reasoningModel || 'gemini-2.5-pro'}
                              onChange={(e) => handleReasoningModelChange(e.target.value)}
                              className="px-2 py-1 bg-purple-800 border border-purple-400 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-300"
                            >
                              <optgroup label="Google">
                                {AI_MODELS.Google.map(model => (
                                  <option key={model.id} value={model.id}>
                                    {getTierIcon(model.tier)} {model.name.replace('Gemini ', 'G')}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="OpenAI">
                                {AI_MODELS.OpenAI.map(model => (
                                  <option key={model.id} value={model.id}>
                                    {getTierIcon(model.tier)} {model.name.replace('GPT-', '')}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Anthropic">
                                {AI_MODELS.Anthropic.map(model => (
                                  <option key={model.id} value={model.id}>
                                    {getTierIcon(model.tier)} {model.name.replace('Claude ', 'C')}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Regular Agents Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_AGENTS.map((agent) => {
                        const isEnabled = localSettings.enabledAgents.includes(agent.id);
                        const IconComponent = agent.icon;
                        const assignedModel = localSettings.agentModels?.[agent.id];
                        const modelInfo = assignedModel ? getModelInfo(assignedModel) : null;
                        
                        return (
                          <div key={agent.id} className="group">
                            {/* Compact Agent Card */}
                            <div className={`p-2 rounded border transition-all min-h-[60px] ${
                              isEnabled
                                ? 'bg-green-600 border-green-500 text-white'
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            }`}>
                              <div className="flex items-center justify-between h-full">
                                <button
                                  onClick={() => handleAgentToggle(agent.id)}
                                  className="flex items-center space-x-2 flex-1"
                                >
                                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                                  <div className="text-left min-w-0">
                                    <div className="text-xs font-medium">{agent.name}</div>
                                    <div className="text-xs opacity-50 line-clamp-2">{agent.description}</div>
                                  </div>
                                </button>
                                
                                {/* Controls - Always Active */}
                                <div className="flex items-center space-x-1">
                                  {/* Prompt Editor Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPrompt(agent.id);
                                    }}
                                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                                    title="Edit Custom Prompt"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  
                                  {/* Model Selector */}
                                  <select
                                    value={assignedModel || ''}
                                    onChange={(e) => handleModelChange(agent.id, e.target.value)}
                                    className="w-16 px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <optgroup label="Anthropic">
                                      {AI_MODELS.Anthropic.map(model => (
                                        <option key={model.id} value={model.id}>
                                          {getTierIcon(model.tier)} {model.name.replace('Claude ', 'C').substring(0, 8)}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="OpenAI">
                                      {AI_MODELS.OpenAI.map(model => (
                                        <option key={model.id} value={model.id}>
                                          {getTierIcon(model.tier)} {model.name.replace('GPT-', '')}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Google">
                                      {AI_MODELS.Google.map(model => (
                                        <option key={model.id} value={model.id}>
                                          {getTierIcon(model.tier)} {model.name.replace('Gemini ', 'G')}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Others">
                                      {[...AI_MODELS.Microsoft, ...AI_MODELS.Meta, ...AI_MODELS.Mistral, ...AI_MODELS.Perplexity].map(model => (
                                        <option key={model.id} value={model.id}>
                                          {getTierIcon(model.tier)} {model.name.substring(0, 8)}
                                        </option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
            
                    <div className="mt-2 text-xs text-gray-400">
                      {localSettings.enabledAgents.length} of {AVAILABLE_AGENTS.length} agents selected
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Keys Section */}
          <div>
            <button
              onClick={() => toggleSection('apiKeys')}
              className="w-full flex items-center justify-between py-2 px-2 bg-gray-700/20 hover:bg-gray-700/30 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">API Keys</h3>
                  <div className="text-xs text-gray-400">Bring your own API keys for direct provider access</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Edit</span>
                {expandedSections.apiKeys ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedSections.apiKeys && (
              <div className="space-y-2 bg-gray-700/30 rounded p-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* OpenAI API Key */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">OpenAI</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={localSettings.apiKeys?.openai || ''}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Anthropic API Key */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Anthropic</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      value={localSettings.apiKeys?.anthropic || ''}
                      onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Google API Key */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Google</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      value={localSettings.apiKeys?.google || ''}
                      onChange={(e) => handleApiKeyChange('google', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Azure API Key */}
                  <div>
                    <label className="text-xs text-gray-300 block mb-1">Azure</label>
                    <input
                      type="password"
                      placeholder="..."
                      value={localSettings.apiKeys?.azure || ''}
                      onChange={(e) => handleApiKeyChange('azure', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  💡 API keys are stored locally and used when available. Leave empty to use Kairo's default service.
                </div>
              </div>
            )}
          </div>

          {/* MCP Servers Section */}
          <div>
            <button
              onClick={() => toggleSection('mcpServers')}
              className="w-full flex items-center justify-between py-2 px-2 bg-gray-700/20 hover:bg-gray-700/30 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Plug className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">MCP Servers</h3>
                  <div className="text-xs text-gray-400">Model Context Protocol servers for enhanced capabilities</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Edit</span>
                {expandedSections.mcpServers ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedSections.mcpServers && (
              <div className="space-y-2 bg-gray-700/30 rounded p-3">
              
              {/* Built-in MCP Servers */}
              <div className="space-y-2">
                {localSettings.mcpServers?.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleMcpServerToggle(server.id)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          server.enabled 
                            ? 'bg-green-600 border-green-500' 
                            : 'border-gray-500'
                        }`}
                      >
                        {server.enabled && <Check className="w-2 h-2 text-white" />}
                      </button>
                      <div>
                        <div className="text-xs font-medium text-white">{server.name}</div>
                        <div className="text-xs text-gray-400">{server.description}</div>
                      </div>
                    </div>
                    {server.id.startsWith('custom-') && (
                      <button
                        onClick={() => handleRemoveMcpServer(server.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add Custom MCP Server */}
              <div className="border-t border-gray-600 pt-3 mt-3">
                <div className="text-xs text-gray-300 mb-2">Add Custom MCP Server</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Server name"
                    value={newMcpServer.name}
                    onChange={(e) => setNewMcpServer(prev => ({ ...prev, name: e.target.value }))}
                    className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Command"
                    value={newMcpServer.command}
                    onChange={(e) => setNewMcpServer(prev => ({ ...prev, command: e.target.value }))}
                    className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Arguments"
                    value={newMcpServer.args}
                    onChange={(e) => setNewMcpServer(prev => ({ ...prev, args: e.target.value }))}
                    className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddMcpServer}
                  disabled={!newMcpServer.name || !newMcpServer.command}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
                >
                  Add Server
                </button>
              </div>
              
                <div className="text-xs text-gray-500 mt-2">
                  💡 MCP servers extend agent capabilities with tools like browser automation, file systems, and external APIs.
                </div>
              </div>
            )}
          </div>

          {/* SDK Rules Section */}
          <div>
            <button
              onClick={() => toggleSection('sdkRules')}
              className="w-full flex items-center justify-between py-2 px-2 bg-gray-700/20 hover:bg-gray-700/30 rounded transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <Code className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-white">Agility SDK Rules</h3>
                  <div className="text-xs text-gray-400">Configure SDK-specific rules and patterns for agents</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Edit</span>
                {expandedSections.sdkRules ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedSections.sdkRules && (
              <div className="space-y-2 bg-gray-700/30 rounded p-3">
              
              <div className="grid grid-cols-2 gap-2">
                {/* Fetch SDK */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div>
                    <div className="text-xs font-medium text-white">Fetch SDK</div>
                    <div className="text-xs text-gray-400">Content fetching and API integration</div>
                  </div>
                  <button
                    onClick={() => setEditingSDK('fetch')}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    title="Edit Fetch SDK Rules"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Management SDK */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div>
                    <div className="text-xs font-medium text-white">Management SDK</div>
                    <div className="text-xs text-gray-400">Content management and admin operations</div>
                  </div>
                  <button
                    onClick={() => setEditingSDK('management')}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    title="Edit Management SDK Rules"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Sync SDK */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div>
                    <div className="text-xs font-medium text-white">Sync SDK</div>
                    <div className="text-xs text-gray-400">Real-time content synchronization</div>
                  </div>
                  <button
                    onClick={() => setEditingSDK('sync')}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    title="Edit Sync SDK Rules"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Apps SDK */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div>
                    <div className="text-xs font-medium text-white">Apps SDK</div>
                    <div className="text-xs text-gray-400">Custom app development and extensions</div>
                  </div>
                  <button
                    onClick={() => setEditingSDK('apps')}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    title="Edit Apps SDK Rules"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Next.js SDK */}
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded col-span-2">
                  <div>
                    <div className="text-xs font-medium text-white">Next.js SDK</div>
                    <div className="text-xs text-gray-400">Next.js specific integrations and optimizations</div>
                  </div>
                  <button
                    onClick={() => setEditingSDK('nextjs')}
                    className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    title="Edit Next.js SDK Rules"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              </div>

                <div className="text-xs text-gray-500 mt-2">
                  💡 SDK rules help agents understand how to properly use Agility CMS SDKs, including best practices, patterns, and API usage.
                </div>
              </div>
            )}
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

      {/* Prompt Editor Modal */}
      {editingPrompt && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEditingPrompt(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Custom Prompt: {AVAILABLE_AGENTS.find(a => a.id === editingPrompt)?.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add custom instructions that will be prepended to this agent's system prompt
                  </p>
                </div>
                <button
                  onClick={() => setEditingPrompt(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-2 block">
                    Custom Instructions
                  </label>
                  <textarea
                    value={localSettings.agentPrompts?.[editingPrompt] || ''}
                    onChange={(e) => handlePromptChange(editingPrompt, e.target.value)}
                    placeholder={`Example for ${AVAILABLE_AGENTS.find(a => a.id === editingPrompt)?.name}:\n- Always use "Service" instead of "API"\n- Follow our company style guide\n- Include TypeScript types for all functions\n- Prioritize accessibility features`}
                    className="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">💡 Tips:</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Be specific about terminology preferences</li>
                    <li>• Include coding standards and patterns</li>
                    <li>• Mention any constraints or requirements</li>
                    <li>• These instructions are added to our base agent prompts</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {(localSettings.agentPrompts?.[editingPrompt] || '').length} characters
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingPrompt(null)}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setEditingPrompt(null)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SDK Rules Editor Modal */}
      {editingSDK && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setEditingSDK(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {editingSDK.charAt(0).toUpperCase() + editingSDK.slice(1)} SDK Rules
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure patterns and best practices for agents working with this SDK
                  </p>
                </div>
                <button
                  onClick={() => setEditingSDK(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-2 block">
                    SDK Guidelines & Best Practices
                  </label>
                  <textarea
                    value={localSettings.sdkRules?.[editingSDK as keyof typeof localSettings.sdkRules] || ''}
                    onChange={(e) => handleSDKRuleChange(editingSDK, e.target.value)}
                    placeholder={`Example for ${editingSDK.charAt(0).toUpperCase() + editingSDK.slice(1)} SDK:

## API Patterns
- Always use getApi() to initialize the client
- Handle errors with try/catch blocks
- Use proper TypeScript types for all responses

## Common Methods
- getContentItem(contentID, locale?)
- getContentList(referenceName, options?)
- getSitemap(channelName, locale?)

## Performance
- Cache responses when possible
- Use batch operations for multiple items
- Implement proper loading states

## Code Examples
\`\`\`typescript
const api = getApi();
const content = await api.getContentItem('123');
\`\`\``}
                    className="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="bg-gray-700/50 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">💡 SDK Rule Guidelines:</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Include common API patterns and methods</li>
                    <li>• Specify error handling approaches</li>
                    <li>• Add TypeScript type examples</li>
                    <li>• Mention performance considerations</li>
                    <li>• Provide code snippets for reference</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {(localSettings.sdkRules?.[editingSDK as keyof typeof localSettings.sdkRules] || '').length} characters
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingSDK(null)}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setEditingSDK(null)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
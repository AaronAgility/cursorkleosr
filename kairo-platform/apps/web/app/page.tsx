'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Rocket, BookOpen, Settings, Bot, Zap, GitPullRequest } from 'lucide-react';
import { ChatInterface } from '../components/ChatInterface';
import { PreviewPanel } from '../components/PreviewPanel';
import { ProjectSettingsModal } from '../components/ProjectSettingsModal';

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

// Load settings from localStorage with fallback defaults
const loadSettings = (): ProjectSettings => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kairo-project-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved settings, using defaults');
      }
    }
  }
  
  // Default settings - all agents enabled with full configuration
  return {
    enabledAgents: ['design-agent', 'frontend-agent', 'content-agent', 'testing-agent', 'performance-agent', 'security-agent', 'responsive-agent', 'deployment-agent', 'translation-agent', 'pr-agent'],
    orchestrationMode: 'intelligent',
    projectType: 'web-app',
    agentModels: {
      'frontend-agent': 'claude-4-sonnet',
      'design-agent': 'claude-4-sonnet',
      'performance-agent': 'gpt-4o',
      'content-agent': 'gpt-4o',
      'testing-agent': 'claude-4-sonnet',
      'security-agent': 'gpt-4o',
      'responsive-agent': 'gpt-4o',
      'deployment-agent': 'gpt-4o',
      'translation-agent': 'gpt-4o',
      'pr-agent': 'claude-4-sonnet',
    },
    reasoningModel: 'gemini-2.5-pro',
    agentPrompts: {
      'frontend-agent': '',
      'design-agent': '',
      'performance-agent': '',
      'content-agent': '',
      'testing-agent': '',
      'security-agent': '',
      'responsive-agent': '',
      'deployment-agent': '',
      'translation-agent': '',
      'pr-agent': '',
    },
    apiKeys: {
      openai: '',
      anthropic: '',
      google: '',
      azure: '',
    },
    mcpServers: [
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
    ],
    sdkRules: {
      fetch: '',
      management: '',
      sync: '',
      apps: '',
      nextjs: ''
    },
    agilityGuid: '',
    environments: [
      { id: 'local', name: 'Local Development', url: 'http://localhost:3000', type: 'local' as const },
      { id: 'staging', name: 'Staging', url: '', type: 'staging' as const },
      { id: 'production', name: 'Production', url: '', type: 'production' as const }
    ],
  };
};

export default function HomePage() {
  const [showSettings, setShowSettings] = useState(false);
  const [projectSettings, setProjectSettings] = useState<ProjectSettings>(loadSettings);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        orchestrationType: 'main',
        projectSettings,
      },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 px-4 py-2 pb-0 electron-header">
        <div className="flex items-center justify-between">
          {/* Logo and Title - Draggable area */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-4 pt-4">
              {/* Agility Logo - 75% Bigger */}
              <div className="flex-shrink-0">
                <svg width="112" height="82" viewBox="0 0 141 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-110 -mt-1 ml-2">
                  <g clipPath="url(#clip0_280_4768)">
                    <path fillRule="evenodd" clipRule="evenodd" d="M56.619 27.2946C58.1785 27.2946 59.5435 27.0361 60.5506 26.6806V22.9671C59.3159 22.386 57.8536 22.128 56.2935 22.128C54.1815 22.128 52.6868 22.8061 52.6868 24.5494C52.6868 26.1964 53.9869 27.2946 56.619 27.2946ZM63.1184 19.447V28.1342C61.688 28.9092 58.9905 29.6196 56.5865 29.6196C51.9067 29.6196 49.9893 27.4879 49.9893 24.6787C49.9893 21.5787 52.7192 19.8347 56.2935 19.8347C57.9834 19.8347 59.4456 20.1579 60.5506 20.6098V19.4475C60.5506 17.1542 59.0559 15.9274 56.3589 15.9274C54.5064 15.9274 52.9468 16.606 52.004 17.3164C51.6591 17.1518 51.3585 16.9078 51.1269 16.6045C50.8953 16.3013 50.7394 15.9476 50.672 15.5725C51.6467 14.603 53.889 13.5054 56.4887 13.5054C60.1608 13.5054 63.1184 15.1847 63.1184 19.447ZM79.2614 25.3885V16.8957C78.4819 16.2823 77.2142 15.8945 75.8168 15.8945C72.5668 15.8945 70.3245 18.1226 70.3245 21.3201C70.3245 24.5818 72.5668 26.519 75.8168 26.519C77.5391 26.519 78.4813 25.9696 79.2614 25.3885ZM81.8935 15.4749V28.78C81.8935 32.5898 78.9365 35.4966 74.5821 35.4966C71.8846 35.4966 69.4801 34.6575 67.8875 32.8489C68.1151 32.2026 68.7 31.4276 69.5774 31.0727C70.5845 32.2349 72.1122 33.1715 74.5815 33.1715C77.8315 33.1715 79.2614 31.2337 79.2614 28.78V27.908C78.2213 28.4245 77.019 28.8123 75.5892 28.8123C71.2348 28.8123 67.6275 25.9702 67.6275 21.3201C67.6275 16.7993 71.0721 13.5054 75.8168 13.5054C78.0586 13.5054 80.3015 14.2481 81.8935 15.4749ZM87.5246 29.3753V14.133C87.9798 14.0366 88.435 14.0037 88.8572 14.0037C89.2799 14.0037 89.7351 14.036 90.1573 14.133V29.3753C89.7351 29.4717 89.2799 29.5045 88.8572 29.5045C88.435 29.5045 87.9792 29.4722 87.5246 29.3753ZM86.9727 9.6768C86.9727 8.64327 87.7852 7.83594 88.8572 7.83594C89.8642 7.83594 90.6773 8.64327 90.6773 9.6768C90.6773 10.7098 89.8648 11.5171 88.8572 11.5171C87.8176 11.5171 86.9727 10.7098 86.9727 9.6768ZM96.0763 29.1814V7.96577C96.5036 7.87633 96.9393 7.83299 97.3759 7.8365C97.7986 7.8365 98.2862 7.86882 98.7084 7.96577V29.1825C98.2857 29.2789 97.7986 29.3112 97.3759 29.3112C96.9393 29.3148 96.5036 29.2716 96.0763 29.1825M104.594 29.3753V14.133C105.049 14.0366 105.504 14.0037 105.926 14.0037C106.349 14.0037 106.804 14.036 107.227 14.133V29.3753C106.804 29.4717 106.349 29.5045 105.926 29.5045C105.504 29.5045 105.049 29.4722 104.594 29.3753ZM104.042 9.6768C104.042 8.64327 104.854 7.83594 105.926 7.83594C106.934 7.83594 107.747 8.64327 107.747 9.6768C107.747 10.7098 106.934 11.5171 105.926 11.5171C104.887 11.5171 104.042 10.7098 104.042 9.6768ZM123.82 28.2198C123.008 28.9625 121.415 29.8345 119.53 29.8345C116.443 29.8345 114.201 28.3814 114.201 24.732V16.4331H111.568C111.477 16.0852 111.434 15.7267 111.439 15.3672C111.439 15.0123 111.471 14.6892 111.568 14.3343H114.201V10.233C114.623 10.136 115.046 10.1037 115.501 10.1037C115.923 10.1037 116.346 10.136 116.768 10.233V14.3343H122.845C122.942 14.6892 122.975 15.0123 122.975 15.3672C122.975 15.755 122.942 16.0453 122.845 16.4331H116.768V24.215C116.768 26.9601 118.068 27.5412 119.725 27.5412C120.96 27.5412 122.162 26.7985 122.65 26.379C123.3 26.8308 123.69 27.5418 123.82 28.2198ZM140.644 14.3955C138.109 24.0505 135.217 29.8311 129.53 35.9995C128.62 35.8379 127.97 35.1269 127.678 34.4171C129.27 32.6732 130.733 30.8646 131.805 29.0878C128.848 24.2121 126.996 19.2712 125.663 14.298C126.183 14.137 126.703 14.0723 127.288 14.0723C127.645 14.0723 128.068 14.1046 128.458 14.1687C129.595 18.4962 130.927 22.0163 133.138 26.4085L133.397 26.8926C133.463 26.731 133.56 26.6018 133.625 26.4402C135.737 22.4036 136.94 18.4639 137.979 14.1693C138.333 14.1064 138.692 14.074 139.052 14.0723C139.572 14.0723 140.157 14.2016 140.644 14.3955Z" fill="white"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M24.4227 30.2102H9.83134L20.8296 11.2799L31.828 30.2102L35.0358 35.8501H41.6587L20.8291 0L0 35.8501H26.9791L24.4227 30.2102Z" fill="#FFCB28"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_280_4768">
                      <rect width="141" height="36" fill="white"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white">Kairo</h1>
              </div>
            </div>
          </div>

          {/* Navigation - Not draggable */}
          <div className="flex items-center space-x-4 electron-no-drag">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium"
            >
              <Rocket className="w-4 h-4" />
              <span>Project</span>
            </a>
            
            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              <span>Docs</span>
            </a>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* PR Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-green-500/20">
              <GitPullRequest className="w-4 h-4" />
              <span>Create PR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat Interface */}
        <div className="w-2/5 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-600">
          <div className="h-full flex flex-col">
            {/* Agent Info Header - With Mode and Project */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Main Orchestration Agent</h2>
                  <div className="flex items-center space-x-4 text-sm mt-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Mode:</span>
                      <span className="text-white font-medium capitalize">{projectSettings.orchestrationMode}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Project:</span>
                      <span className="text-white font-medium">{projectSettings.projectType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <ChatInterface
              messages={messages}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              agentType="orchestration"
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 relative">
          <PreviewPanel />
        </div>
      </div>

      {/* Project Settings Modal */}
      {showSettings && (
        <ProjectSettingsModal
          settings={projectSettings}
          onSettingsChange={(settings) => setProjectSettings(settings)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

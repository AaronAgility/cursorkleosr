'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { PreviewPanel } from '../components/PreviewPanel';
import { ProjectSettingsModal } from '../components/ProjectSettingsModal';

export default function KairoPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [projectSettings, setProjectSettings] = useState({
    enabledAgents: ['frontend-agent', 'design-agent', 'performance-agent'],
    orchestrationMode: 'intelligent', // 'intelligent' | 'manual' | 'sequential'
    projectType: 'web-app', // 'web-app' | 'mobile-app' | 'api' | 'full-stack'
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      orchestrationType: 'main', // Always talk to main orchestration agent
      projectSettings,
    },
  });

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <h1 className="text-xl font-semibold">Kairo</h1>
          <span className="text-sm text-gray-400">Multi-Agent Development Platform</span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors text-sm"
              title="Open Main Project"
            >
              <span>🚀</span>
              <span>Project</span>
            </a>
            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md transition-colors text-sm"
              title="Open Documentation"
            >
              <span>📚</span>
              <span>Docs</span>
            </a>
          </div>

          {/* Project Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            title="Project Settings"
          >
            <span className="text-sm">⚙️</span>
            <span className="text-sm text-gray-300">Settings</span>
          </button>

          {/* Active Agents Indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">
              {projectSettings.enabledAgents.length} agent{projectSettings.enabledAgents.length !== 1 ? 's' : ''} active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Chat Interface */}
        <div className="w-2/5 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Orchestration Agent Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Main Orchestration Agent</h2>
                <p className="text-sm text-gray-400">
                  Coordinates {projectSettings.enabledAgents.length} specialized agents
                </p>
              </div>
            </div>
            
            {/* Quick Status */}
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
              <span>Mode: {projectSettings.orchestrationMode}</span>
              <span>•</span>
              <span>Project: {projectSettings.projectType}</span>
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

        {/* Right Panel - Live Preview */}
        <div className="w-3/5 bg-gray-900">
          <PreviewPanel />
        </div>
      </div>

      {/* Project Settings Modal */}
      {showSettings && (
        <ProjectSettingsModal
          settings={projectSettings}
          onSettingsChange={setProjectSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  priority: number;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgents: string[];
  onAgentSelect: (agentIds: string[]) => void;
  taskType: string;
  onTaskTypeChange: (taskType: string) => void;
}

const TASK_TYPES = [
  { id: 'reasoning', name: 'Reasoning', description: 'Complex analysis and planning' },
  { id: 'coding', name: 'Coding', description: 'Code generation and review' },
  { id: 'primary', name: 'Primary', description: 'Default agent behavior' },
  { id: 'planning', name: 'Planning', description: 'Strategic planning and architecture' },
];

export function AgentSelector({
  agents,
  selectedAgents,
  onAgentSelect,
  taskType,
  onTaskTypeChange,
}: AgentSelectorProps) {
  const handleAgentClick = (agentId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      // Multi-select with Cmd/Ctrl+click
      if (selectedAgents.includes(agentId)) {
        onAgentSelect(selectedAgents.filter(id => id !== agentId));
      } else {
        onAgentSelect([...selectedAgents, agentId]);
      }
    } else {
      // Single select
      onAgentSelect([agentId]);
    }
  };

  return (
    <div className="p-4 border-b border-gray-700">
      {/* Task Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Task Type
        </label>
        <select
          value={taskType}
          onChange={(e) => onTaskTypeChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TASK_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.description}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Tabs */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AI Agents
          <span className="text-xs text-gray-400 ml-2">
            (Cmd+click for multi-select)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {agents
          .sort((a, b) => a.priority - b.priority)
          .map((agent, index) => {
            const isSelected = selectedAgents.includes(agent.id);
            const isPrimary = selectedAgents[0] === agent.id;
            
            return (
              <button
                key={agent.id}
                onClick={(e) => handleAgentClick(agent.id, e.metaKey || e.ctrlKey)}
                className={`
                  relative p-3 rounded-lg border text-left transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }
                  ${isPrimary ? 'ring-2 ring-green-400' : ''}
                `}
                title={`${agent.name} (Priority: ${agent.priority}) - Cmd+${index + 1}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {agent.name}
                    </div>
                    <div className="text-xs opacity-75">
                      Priority {agent.priority}
                    </div>
                  </div>
                </div>

                {isPrimary && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                )}

                {isSelected && !isPrimary && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-gray-800"></div>
                )}

                {/* Keyboard shortcut indicator */}
                <div className="absolute bottom-1 right-1 text-xs opacity-50">
                  ⌘{index + 1}
                </div>
              </button>
            );
          })}
      </div>

      {/* Selection Summary */}
      {selectedAgents.length > 1 && (
        <div className="mt-3 p-2 bg-gray-700 rounded text-xs text-gray-300">
          <span className="font-medium">Multi-agent mode:</span>{' '}
          {selectedAgents.length} agents selected
          {selectedAgents[0] && (
            <span className="text-green-400 ml-1">
              (Primary: {agents.find(a => a.id === selectedAgents[0])?.name})
            </span>
          )}
        </div>
      )}
    </div>
  );
} 
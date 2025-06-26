import { Message } from 'ai';
import { FormEvent } from 'react';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  agentType: 'orchestration' | 'individual';
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  agentType,
}: ChatInterfaceProps) {
  const formatMessage = (content: string) => {
    // Simple code block detection
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const detectAgentResponse = (content: string) => {
    // Detect if the orchestration agent is delegating to sub-agents
    const agentMentions = content.match(/\[(\w+-agent)\]/g);
    return agentMentions || [];
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">Welcome to Kairo</h3>
            <p className="text-sm">
              Start a conversation with the orchestration agent.<br />
              It will coordinate specialized agents to help build your project.
            </p>
            
            {/* Example prompts */}
            <div className="mt-6 space-y-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="space-y-1 text-xs">
                <div className="bg-gray-700 rounded px-3 py-2 text-left">
                  "Build a modern landing page with a hero section and contact form"
                </div>
                <div className="bg-gray-700 rounded px-3 py-2 text-left">
                  "Create a React dashboard with charts and user management"
                </div>
                <div className="bg-gray-700 rounded px-3 py-2 text-left">
                  "Help me optimize this app's performance and add responsive design"
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const messageParts = formatMessage(message.content);
            const agentMentions = detectAgentResponse(message.content);
            
            return (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {/* Message header for assistant */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2 text-xs text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span>Orchestration Agent</span>
                      {agentMentions.length > 0 && (
                        <span className="text-blue-400">
                          • Coordinating: {agentMentions.join(', ')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  <div className="space-y-2">
                    {messageParts.map((part, index) => {
                      if (part.type === 'code') {
                        return (
                          <div key={index} className="bg-gray-900 rounded p-3 overflow-x-auto">
                            <div className="text-xs text-gray-400 mb-2">
                              {part.language}
                            </div>
                            <pre className="text-sm text-green-400">
                              <code>{part.content}</code>
                            </pre>
                          </div>
                        );
                      } else {
                        return (
                          <div key={index} className="whitespace-pre-wrap text-sm">
                            {part.content}
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-300">Orchestrating agents...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Describe what you want to build or improve..."
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={2}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
} 
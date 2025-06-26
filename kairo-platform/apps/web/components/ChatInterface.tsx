'use client';

import { UIMessage } from 'ai';
import { FormEvent } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { DragDropOverlay } from './DragDropOverlay';

interface ChatInterfaceProps {
  messages: UIMessage[];
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDragOverlay, setShowDragOverlay] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setShowDragOverlay(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setShowDragOverlay(false);
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setShowDragOverlay(false);
    setIsDragOver(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    // Process the dropped files
    const fileDescriptions = files.map(file => {
      const fileType = file.type || 'unknown';
      const fileSize = (file.size / 1024 / 1024).toFixed(2);
      
      let category = 'Document';
      if (fileType.startsWith('image/')) category = 'Image';
      else if (fileType.includes('figma')) category = 'Figma Design';
      else if (fileType.startsWith('text/') || fileType.includes('code')) category = 'Code File';
      
      return `${category}: ${file.name} (${fileSize}MB)`;
    });

    // Create a message about the uploaded files
    const fileMessage = `I've uploaded ${files.length} file(s):\n${fileDescriptions.join('\n')}\n\nPlease analyze these files and help me work with them.`;
    
    // Simulate adding the message to input
    const syntheticEvent = {
      target: { value: fileMessage }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    handleInputChange(syntheticEvent);
  };

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
    <div 
      className="flex-1 flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      <DragDropOverlay 
        isVisible={showDragOverlay} 
        isDragOver={isDragOver} 
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-base font-medium mb-1 text-white">Welcome to Kairo</h3>
              <p className="text-xs">
                AI agents will coordinate to help build your project.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            // Extract text content from message parts (AI SDK 5 Beta format)
            const textContent = message.parts
              ?.filter(part => part.type === 'text')
              .map(part => part.text)
              .join('') || '';
            
            const messageParts = formatMessage(textContent);
            const agentMentions = detectAgentResponse(textContent);
            
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
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-gray-300">Orchestrating agents...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Section - Only show when no messages */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="text-center">
            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="space-y-1 text-xs">
                <button 
                  onClick={() => {
                    const syntheticEvent = {
                      target: { value: "Create a modern Agility CMS website with a hero section, blog listing, and contact form" }
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    handleInputChange(syntheticEvent);
                  }}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors rounded px-3 py-2 text-left text-gray-400 hover:text-gray-300"
                >
                  "Create a modern Agility CMS website with a hero section, blog listing, and contact form"
                </button>
                <button 
                  onClick={() => {
                    const syntheticEvent = {
                      target: { value: "Build an Agility CMS admin dashboard with content management and analytics" }
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    handleInputChange(syntheticEvent);
                  }}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors rounded px-3 py-2 text-left text-gray-400 hover:text-gray-300"
                >
                  "Build an Agility CMS admin dashboard with content management and analytics"
                </button>
                <button 
                  onClick={() => {
                    const syntheticEvent = {
                      target: { value: "Help me set up Agility CMS with Next.js and optimize performance for SEO" }
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    handleInputChange(syntheticEvent);
                  }}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors rounded px-3 py-2 text-left text-gray-400 hover:text-gray-300"
                >
                  "Help me set up Agility CMS with Next.js and optimize performance for SEO"
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line • Drag & drop files to analyze
        </div>
      </div>
    </div>
  );
} 
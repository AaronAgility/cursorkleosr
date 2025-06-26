import { z } from 'zod';

// Agent configuration from web app
export interface AgentConfig {
  id: string;
  model: string;
  customPrompt?: string;
  enabled: boolean;
}

// Project settings from web app
export interface ProjectSettings {
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

export interface Environment {
  id: string;
  name: string;
  url: string;
  type: 'local' | 'staging' | 'production' | 'custom';
}

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  description?: string;
}

// Agent execution context
export interface AgentContext {
  projectSettings: ProjectSettings;
  agentConfig: AgentConfig;
  taskContext?: {
    type: 'initial' | 'followup' | 'collaboration';
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    collaboratingAgents?: string[];
  };
}

// Agent response structure
export interface AgentResponse {
  agentId: string;
  response: string;
  actionItems?: Array<{
    type: 'code_change' | 'file_create' | 'dependency_add' | 'collaboration_request';
    description: string;
    details: any;
  }>;
  nextSteps?: string[];
  collaborationRequests?: Array<{
    targetAgent: string;
    context: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

// Zod schemas for validation
export const ProjectSettingsSchema = z.object({
  agilityGuid: z.string().optional(),
  environments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.enum(['local', 'staging', 'production', 'custom'])
  })),
  enabledAgents: z.array(z.string()),
  orchestrationMode: z.enum(['intelligent', 'manual', 'sequential']),
  projectType: z.enum(['web-app', 'mobile-app']),
  agentModels: z.record(z.string()),
  reasoningModel: z.string(),
  agentPrompts: z.record(z.string()),
  apiKeys: z.object({
    openai: z.string().optional(),
    anthropic: z.string().optional(),
    google: z.string().optional(),
    azure: z.string().optional(),
  }),
  mcpServers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    command: z.string(),
    args: z.array(z.string()),
    enabled: z.boolean(),
    description: z.string().optional()
  })),
  sdkRules: z.object({
    fetch: z.string().optional(),
    management: z.string().optional(),
    sync: z.string().optional(),
    apps: z.string().optional(),
    nextjs: z.string().optional(),
  })
});

export const AgentContextSchema = z.object({
  projectSettings: ProjectSettingsSchema,
  agentConfig: z.object({
    id: z.string(),
    model: z.string(),
    customPrompt: z.string().optional(),
    enabled: z.boolean()
  }),
  taskContext: z.object({
    type: z.enum(['initial', 'followup', 'collaboration']),
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })).optional(),
    collaboratingAgents: z.array(z.string()).optional()
  }).optional()
}); 
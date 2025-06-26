export * from './types.js';
export * from './base-agent.js';

// Agent implementations
export { DesignAgent } from './agents/design-agent/agent.js';
export { FrontendAgent } from './agents/frontend-agent/agent.js';
export { ContentAgent } from './agents/content-agent/agent.js';
export { TestingAgent } from './agents/testing-agent/agent.js';
export { PerformanceAgent } from './agents/performance-agent/agent.js';
export { SecurityAgent } from './agents/security-agent/agent.js';
export { ResponsiveAgent } from './agents/responsive-agent/agent.js';
export { DeploymentAgent } from './agents/deployment-agent/agent.js';
export { TranslationAgent } from './agents/translation-agent/agent.js';
export { PRAgent } from './agents/pr-agent/agent.js';

// Import all agent types
import { DesignAgent } from './agents/design-agent/agent.js';
import { FrontendAgent } from './agents/frontend-agent/agent.js';
import { ContentAgent } from './agents/content-agent/agent.js';
import { TestingAgent } from './agents/testing-agent/agent.js';
import { PerformanceAgent } from './agents/performance-agent/agent.js';
import { SecurityAgent } from './agents/security-agent/agent.js';
import { ResponsiveAgent } from './agents/responsive-agent/agent.js';
import { DeploymentAgent } from './agents/deployment-agent/agent.js';
import { TranslationAgent } from './agents/translation-agent/agent.js';
import { PRAgent } from './agents/pr-agent/agent.js';
import type { AgentContext, AgentResponse } from './types.js';

// Agent registry
export const AGENT_REGISTRY = {
  'design-agent': DesignAgent,
  'frontend-agent': FrontendAgent,
  'content-agent': ContentAgent,
  'testing-agent': TestingAgent,
  'performance-agent': PerformanceAgent,
  'security-agent': SecurityAgent,
  'responsive-agent': ResponsiveAgent,
  'deployment-agent': DeploymentAgent,
  'translation-agent': TranslationAgent,
  'pr-agent': PRAgent,
} as const;

export type AgentId = keyof typeof AGENT_REGISTRY;

/**
 * Factory function to create an agent instance
 */
export function createAgent(agentId: AgentId) {
  const AgentClass = AGENT_REGISTRY[agentId];
  if (!AgentClass) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  return new AgentClass();
}

/**
 * Execute an agent with given context and message
 */
export async function executeAgent(
  agentId: AgentId,
  context: AgentContext,
  message: string
): Promise<AgentResponse> {
  const agent = createAgent(agentId);
  return agent.execute(context, message);
}

/**
 * Get list of available agents
 */
export function getAvailableAgents(): AgentId[] {
  return Object.keys(AGENT_REGISTRY) as AgentId[];
}

/**
 * Check if an agent is available
 */
export function isAgentAvailable(agentId: string): agentId is AgentId {
  return agentId in AGENT_REGISTRY;
} 
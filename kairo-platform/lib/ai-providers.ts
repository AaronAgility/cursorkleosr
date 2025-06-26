import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { azure } from '@ai-sdk/azure';
import { GoogleGenAI } from '@google/genai';

// Provider Configuration
export const AI_PROVIDERS = {
  // Anthropic Claude - Primary for coding agents
  anthropic: {
    client: anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }),
    models: {
      coding: 'claude-3-5-sonnet-20241022',
      reasoning: 'claude-3-7-sonnet-20250219',
      fast: 'claude-3-5-haiku-20241022',
    },
  },

  // Google Gemini - Primary for reasoning agents  
  google: {
    client: google({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
    models: {
      reasoning: 'gemini-2.0-flash-exp',
      multimodal: 'gemini-1.5-pro',
      fast: 'gemini-1.5-flash',
    },
  },

  // Azure OpenAI - Fallback and specialized
  azure: {
    client: azure({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT!,
    }),
    models: {
      fallback: 'gpt-4o',
      fast: 'gpt-4o-mini',
    },
  },
} as const;

// Google Gen AI SDK for advanced features
export const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Agent-Provider Mapping (as per our architecture)
export const AGENT_PROVIDERS = {
  'design-agent': {
    reasoning: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
    coding: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
  },
  'frontend-agent': {
    primary: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
    planning: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
  },
  'content-agent': {
    strategy: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
    implementation: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
  },
  'testing-agent': {
    generation: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
    strategy: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
  },
  'performance-agent': {
    analysis: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
    optimization: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
  },
  'security-agent': {
    code: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
    analysis: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
  },
  'responsive-agent': {
    code: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
    planning: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
  },
  'deployment-agent': {
    planning: AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning),
    scripts: AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding),
  },
} as const;

// Utility functions
export function getProviderForAgent(agentId: keyof typeof AGENT_PROVIDERS, task: 'reasoning' | 'coding' | 'primary' | 'planning' | 'strategy' | 'implementation' | 'generation' | 'analysis' | 'optimization' | 'code' | 'scripts') {
  const agentConfig = AGENT_PROVIDERS[agentId];
  if (!agentConfig) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  
  const provider = agentConfig[task as keyof typeof agentConfig];
  if (!provider) {
    // Fallback logic
    if (task === 'reasoning' || task === 'strategy' || task === 'planning' || task === 'analysis') {
      return AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.reasoning);
    } else {
      return AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.coding);
    }
  }
  
  return provider;
}

export function getFallbackProvider() {
  return AI_PROVIDERS.azure.client(AI_PROVIDERS.azure.models.fallback);
}

// Provider health check
export async function checkProviderHealth() {
  const results = {
    anthropic: false,
    google: false,
    azure: false,
  };

  try {
    // Test Anthropic
    const anthropicTest = await AI_PROVIDERS.anthropic.client(AI_PROVIDERS.anthropic.models.fast);
    // Add actual health check logic here
    results.anthropic = true;
  } catch (error) {
    console.warn('Anthropic provider health check failed:', error);
  }

  try {
    // Test Google
    const googleTest = await AI_PROVIDERS.google.client(AI_PROVIDERS.google.models.fast);
    // Add actual health check logic here
    results.google = true;
  } catch (error) {
    console.warn('Google provider health check failed:', error);
  }

  try {
    // Test Azure
    const azureTest = await AI_PROVIDERS.azure.client(AI_PROVIDERS.azure.models.fast);
    // Add actual health check logic here
    results.azure = true;
  } catch (error) {
    console.warn('Azure provider health check failed:', error);
  }

  return results;
} 
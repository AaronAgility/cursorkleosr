import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAzure } from '@ai-sdk/azure';
import { GoogleGenAI } from '@google/genai';

// Provider Configuration with environment variable fallbacks
export const AI_PROVIDERS = {
  // Anthropic Claude - Primary for coding agents
  anthropic: {
    models: {
      coding: 'claude-3-5-sonnet-20241022',
      reasoning: 'claude-3-7-sonnet-20250219',
      fast: 'claude-3-5-haiku-20241022',
    },
  },

  // OpenAI - For GPT models
  openai: {
    models: {
      reasoning: 'gpt-4o',
      fast: 'gpt-4o-mini',
      legacy: 'gpt-3.5-turbo',
    },
  },

  // Google Gemini - Primary for reasoning agents  
  google: {
    models: {
      reasoning: 'gemini-2.0-flash-exp',
      multimodal: 'gemini-1.5-pro',
      fast: 'gemini-1.5-flash',
    },
  },

  // Azure OpenAI - Fallback and specialized
  azure: {
    models: {
      fallback: 'gpt-4o',
      fast: 'gpt-4o-mini',
    },
  },
} as const;

// Function to create providers with custom API keys from project settings
export function createProviderWithApiKey(modelId: string, apiKeys?: any) {
  // Create providers with API keys from project settings
  if (modelId.includes('claude')) {
    const anthropicProvider = createAnthropic({
      apiKey: apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY || '',
    });
    return anthropicProvider(modelId);
  } else if (modelId.includes('gpt') || modelId.includes('4o')) {
    const openaiProvider = createOpenAI({
      apiKey: apiKeys?.openai || process.env.OPENAI_API_KEY || '',
    });
    return openaiProvider(modelId);
  } else if (modelId.includes('gemini')) {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: apiKeys?.google || process.env.GOOGLE_API_KEY || '',
    });
    return googleProvider(modelId);
  }
  
  // Default fallback - use Claude 3.5 Sonnet
  const anthropicProvider = createAnthropic({
    apiKey: apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY || '',
  });
  return anthropicProvider('claude-3-5-sonnet-20241022');
}

// Legacy function for backward compatibility
export function getProviderForAgent() {
  return createProviderWithApiKey('claude-3-5-sonnet-20241022');
}

// Google Gen AI SDK for advanced features
export const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Azure client function
function createAzureProvider(apiKeys?: any) {
  const azureProvider = createAzure({
    apiKey: apiKeys?.azure || process.env.AZURE_OPENAI_API_KEY || '',
    baseURL: process.env.AZURE_OPENAI_ENDPOINT || '',
  });
  return azureProvider;
}

// Agent-Provider Mapping (as per our architecture)
export const AGENT_PROVIDERS = {
  'design-agent': {
    reasoning: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
    coding: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
  },
  'frontend-agent': {
    primary: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
    planning: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
  },
  'content-agent': {
    strategy: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
    implementation: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
  },
  'testing-agent': {
    generation: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
    strategy: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
  },
  'performance-agent': {
    analysis: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
    optimization: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
  },
  'security-agent': {
    code: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
    analysis: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
  },
  'responsive-agent': {
    code: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
    planning: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
  },
  'deployment-agent': {
    planning: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
    scripts: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
  },
  'pr-agent': {
    analysis: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys),
    review: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys),
  },
  'translation-agent': {
    translation: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.google.models.multimodal, apiKeys),
    review: (apiKeys?: any) => createProviderWithApiKey(AI_PROVIDERS.anthropic.models.fast, apiKeys),
  },
} as const;

// Updated utility function that accepts API keys
export function getProviderForAgentTask(
  agentId: keyof typeof AGENT_PROVIDERS, 
  task: string,
  apiKeys?: any
): any {
  const agentConfig = AGENT_PROVIDERS[agentId];
  if (!agentConfig) {
    throw new Error(`Unknown agent: ${agentId}`);
  }
  
  const providerFunction = agentConfig[task as keyof typeof agentConfig] as ((apiKeys?: any) => any) | undefined;
  if (!providerFunction) {
    // Fallback logic
    if (task === 'reasoning' || task === 'strategy' || task === 'planning' || task === 'analysis') {
      return createProviderWithApiKey(AI_PROVIDERS.google.models.reasoning, apiKeys);
    } else {
      return createProviderWithApiKey(AI_PROVIDERS.anthropic.models.coding, apiKeys);
    }
  }
  
  return providerFunction(apiKeys);
}

export function getFallbackProvider(apiKeys?: any) {
  const azureProvider = createAzureProvider(apiKeys);
  return azureProvider(AI_PROVIDERS.azure.models.fallback);
}

// Provider health check
export async function checkProviderHealth(apiKeys?: any) {
  const results = {
    anthropic: false,
    openai: false,
    google: false,
    azure: false,
  };

  try {
    // Test Anthropic
    createProviderWithApiKey(AI_PROVIDERS.anthropic.models.fast, apiKeys);
    // Add actual health check logic here
    results.anthropic = true;
  } catch (error) {
    console.warn('Anthropic provider health check failed:', error);
  }

  try {
    // Test OpenAI
    createProviderWithApiKey(AI_PROVIDERS.openai.models.fast, apiKeys);
    // Add actual health check logic here
    results.openai = true;
  } catch (error) {
    console.warn('OpenAI provider health check failed:', error);
  }

  try {
    // Test Google
    createProviderWithApiKey(AI_PROVIDERS.google.models.fast, apiKeys);
    // Add actual health check logic here
    results.google = true;
  } catch (error) {
    console.warn('Google provider health check failed:', error);
  }

  try {
    // Test Azure
    const azureProvider = createAzureProvider(apiKeys);
    azureProvider(AI_PROVIDERS.azure.models.fast);
    // Add actual health check logic here
    results.azure = true;
  } catch (error) {
    console.warn('Azure provider health check failed:', error);
  }

  return results;
} 
// Re-export functions from the root level ai-providers
export { 
  createProviderWithApiKey,
  getProviderForAgent,
  getProviderForAgentTask,
  AI_PROVIDERS,
  AGENT_PROVIDERS,
  getFallbackProvider,
  checkProviderHealth
} from "../../../lib/ai-providers";

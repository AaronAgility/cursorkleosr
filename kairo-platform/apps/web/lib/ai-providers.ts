import { anthropic } from "@ai-sdk/anthropic";

export function getProviderForAgent() {
  // For now, return a simple model setup
  // This will be enhanced when we integrate with the actual agent system
  return anthropic("claude-3-5-sonnet-20241022");
}

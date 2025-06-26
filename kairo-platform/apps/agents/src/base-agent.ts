import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import type { AgentContext, AgentResponse, ProjectSettings } from './types.js';

export abstract class BaseAgent {
  protected agentId: string;
  protected description: string;

  constructor(agentId: string, description: string) {
    this.agentId = agentId;
    this.description = description;
  }

  /**
   * Get the AI provider based on agent configuration
   */
  protected getProvider(context: AgentContext): any {
    const { agentConfig, projectSettings } = context;
    const modelId = agentConfig.model;
    const apiKeys = projectSettings.apiKeys;

    // For now, return a simple model configuration
    // This will be refined once we test the integration
    return {
      provider: modelId.includes('claude') ? 'anthropic' : 
               modelId.includes('gpt') || modelId.includes('4o') ? 'openai' :
               modelId.includes('gemini') ? 'google' : 'unknown',
      modelId,
      apiKey: modelId.includes('claude') ? apiKeys.anthropic :
              modelId.includes('gpt') || modelId.includes('4o') ? apiKeys.openai :
              modelId.includes('gemini') ? apiKeys.google : undefined
    };
  }

  /**
   * Build the system prompt for this agent
   */
  protected buildSystemPrompt(context: AgentContext): string {
    const { projectSettings, agentConfig } = context;
    
    const basePrompt = this.getBaseSystemPrompt();
    const customPrompt = agentConfig.customPrompt || '';
    const contextPrompt = this.getContextualPrompt(projectSettings);

    return [
      basePrompt,
      contextPrompt,
      customPrompt && `\n## Custom Instructions\n${customPrompt}`,
    ].filter(Boolean).join('\n\n');
  }

  /**
   * Abstract method that each agent must implement for their base prompt
   */
  protected abstract getBaseSystemPrompt(): string;

  /**
   * Get contextual prompt based on project settings
   */
  protected getContextualPrompt(settings: ProjectSettings): string {
    const { projectType, agilityGuid, sdkRules } = settings;
    
    let contextPrompt = `## Project Context\n`;
    contextPrompt += `- Project Type: ${projectType}\n`;
    
    if (agilityGuid) {
      contextPrompt += `- Agility CMS GUID: ${agilityGuid}\n`;
    }

    // Add relevant SDK rules
    const relevantRules = Object.entries(sdkRules).filter(([_, rule]) => rule);
    if (relevantRules.length > 0) {
      contextPrompt += `\n## SDK Guidelines\n`;
      relevantRules.forEach(([sdk, rule]) => {
        contextPrompt += `### ${sdk.toUpperCase()}\n${rule}\n\n`;
      });
    }

    return contextPrompt;
  }

  /**
   * Execute the agent with given context and user message
   */
  async execute(context: AgentContext, userMessage: string): Promise<AgentResponse> {
    try {
      const provider = this.getProvider(context);
      const systemPrompt = this.buildSystemPrompt(context);

      const { text } = await generateText({
        model: provider,
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return {
        agentId: this.agentId,
        response: text,
        actionItems: this.extractActionItems(text),
        nextSteps: this.extractNextSteps(text),
        collaborationRequests: this.extractCollaborationRequests(text),
      };
    } catch (error) {
      console.error(`Error executing ${this.agentId}:`, error);
      throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract action items from agent response
   */
  protected extractActionItems(response: string) {
    // Simple regex-based extraction - can be enhanced with more sophisticated parsing
    const actionPattern = /\[ACTION:([^\]]+)\]([^[]*)/g;
    const actions = [];
    let match;

    while ((match = actionPattern.exec(response)) !== null) {
      if (match[1] && match[2]) {
        actions.push({
          type: match[1].toLowerCase().replace(' ', '_') as any,
          description: match[2].trim(),
          details: {}
        });
      }
    }

    return actions.length > 0 ? actions : undefined;
  }

  /**
   * Extract next steps from agent response
   */
  protected extractNextSteps(response: string): string[] | undefined {
    const nextStepsPattern = /## Next Steps\n((?:- .+\n?)+)/;
    const match = response.match(nextStepsPattern);
    
    if (match && match[1]) {
      return match[1]
        .split('\n')
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2).trim());
    }

    return undefined;
  }

  /**
   * Extract collaboration requests from agent response
   */
  protected extractCollaborationRequests(response: string) {
    const collabPattern = /\[COLLABORATE:([^\]]+)\]([^[]*)/g;
    const requests = [];
    let match;

    while ((match = collabPattern.exec(response)) !== null) {
      if (match[1] && match[2]) {
        requests.push({
          targetAgent: match[1].trim(),
          context: match[2].trim(),
          priority: 'medium' as const
        });
      }
    }

    return requests.length > 0 ? requests : undefined;
  }

  /**
   * Validate agent context
   */
  protected validateContext(context: AgentContext): void {
    if (!context.agentConfig.enabled) {
      throw new Error(`Agent ${this.agentId} is not enabled`);
    }

    if (!context.projectSettings.enabledAgents.includes(this.agentId)) {
      throw new Error(`Agent ${this.agentId} is not in enabled agents list`);
    }
  }
} 
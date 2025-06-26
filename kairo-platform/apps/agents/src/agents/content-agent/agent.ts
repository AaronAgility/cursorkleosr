import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { CONTENT_AGENT_PROMPT, getContentContextualPrompt, enhanceContentRequest } from './prompt.js';

export class ContentAgent extends BaseAgent {
  constructor() {
    super('content-agent', 'CMS integration and SEO specialist focusing on content strategy and optimization');
  }

  protected getBaseSystemPrompt(): string {
    return CONTENT_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const contentSpecificContext = getContentContextualPrompt(settings.projectType, settings.agilityGuid);
    
    return baseContext + contentSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceContentRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
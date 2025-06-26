import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { DESIGN_AGENT_PROMPT, getDesignContextualPrompt, enhanceDesignRequest } from './prompt.js';

export class DesignAgent extends BaseAgent {
  constructor() {
    super('design-agent', 'UI/UX design specialist focusing on visual systems, accessibility, and design consistency');
  }

  protected getBaseSystemPrompt(): string {
    return DESIGN_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const designSpecificContext = getDesignContextualPrompt(settings.projectType);
    
    return baseContext + designSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    // Add design-specific pre-processing
    const enhancedMessage = enhanceDesignRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
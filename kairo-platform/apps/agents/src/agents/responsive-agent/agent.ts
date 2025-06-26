import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { RESPONSIVE_AGENT_PROMPT, getResponsiveContextualPrompt, enhanceResponsiveRequest } from './prompt.js';

export class ResponsiveAgent extends BaseAgent {
  constructor() {
    super('responsive-agent', 'Responsive design specialist focusing on multi-device support and PWA features');
  }

  protected getBaseSystemPrompt(): string {
    return RESPONSIVE_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const responsiveSpecificContext = getResponsiveContextualPrompt(settings.projectType);
    
    return baseContext + responsiveSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceResponsiveRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
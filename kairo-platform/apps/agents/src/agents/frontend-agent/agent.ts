import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { FRONTEND_AGENT_PROMPT, getFrontendContextualPrompt, enhanceFrontendRequest } from './prompt.js';

export class FrontendAgent extends BaseAgent {
  constructor() {
    super('frontend-agent', 'React/Next.js development specialist focusing on component architecture and modern frontend practices');
  }

  protected getBaseSystemPrompt(): string {
    return FRONTEND_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const frontendSpecificContext = getFrontendContextualPrompt(settings.projectType);
    
    return baseContext + frontendSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceFrontendRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
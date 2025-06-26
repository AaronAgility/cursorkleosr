import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { SECURITY_AGENT_PROMPT, getSecurityContextualPrompt, enhanceSecurityRequest } from './prompt.js';

export class SecurityAgent extends BaseAgent {
  constructor() {
    super('security-agent', 'Security specialist focusing on vulnerability detection and secure coding practices');
  }

  protected getBaseSystemPrompt(): string {
    return SECURITY_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const securitySpecificContext = getSecurityContextualPrompt(settings.projectType);
    
    return baseContext + securitySpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceSecurityRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
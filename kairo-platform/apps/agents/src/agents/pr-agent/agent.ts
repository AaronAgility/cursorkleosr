import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { PR_AGENT_PROMPT, getPRContextualPrompt, enhancePRRequest } from './prompt.js';

export class PRAgent extends BaseAgent {
  constructor() {
    super('pr-agent', 'Pull Request specialist focusing on code review, PR optimization, and merge strategies');
  }

  protected getBaseSystemPrompt(): string {
    return PR_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const prSpecificContext = getPRContextualPrompt(settings.projectType);
    
    return baseContext + prSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    // Add PR-specific pre-processing
    const enhancedMessage = enhancePRRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
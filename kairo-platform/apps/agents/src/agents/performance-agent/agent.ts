import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { PERFORMANCE_AGENT_PROMPT, getPerformanceContextualPrompt, enhancePerformanceRequest } from './prompt.js';

export class PerformanceAgent extends BaseAgent {
  constructor() {
    super('performance-agent', 'Performance optimization specialist focusing on Core Web Vitals and loading optimization');
  }

  protected getBaseSystemPrompt(): string {
    return PERFORMANCE_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const performanceSpecificContext = getPerformanceContextualPrompt(settings.projectType);
    
    return baseContext + performanceSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhancePerformanceRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
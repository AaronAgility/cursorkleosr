import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { TESTING_AGENT_PROMPT, getTestingContextualPrompt, enhanceTestingRequest } from './prompt.js';

export class TestingAgent extends BaseAgent {
  constructor() {
    super('testing-agent', 'Testing specialist focusing on Playwright E2E testing and comprehensive test strategies');
  }

  protected getBaseSystemPrompt(): string {
    return TESTING_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const testingSpecificContext = getTestingContextualPrompt(settings.projectType);
    
    return baseContext + testingSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceTestingRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
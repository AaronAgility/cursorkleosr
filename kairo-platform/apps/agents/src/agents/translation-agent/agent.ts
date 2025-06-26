import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { TRANSLATION_AGENT_PROMPT, getTranslationContextualPrompt, enhanceTranslationRequest } from './prompt.js';

export class TranslationAgent extends BaseAgent {
  constructor() {
    super('translation-agent', 'Translation specialist focusing on internationalization and localization workflows');
  }

  protected getBaseSystemPrompt(): string {
    return TRANSLATION_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const translationSpecificContext = getTranslationContextualPrompt(settings.projectType);
    
    return baseContext + translationSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceTranslationRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
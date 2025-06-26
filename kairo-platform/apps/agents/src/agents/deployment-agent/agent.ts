import { BaseAgent } from '../../base-agent.js';
import type { AgentContext, ProjectSettings } from '../../types.js';
import { DEPLOYMENT_AGENT_PROMPT, getDeploymentContextualPrompt, enhanceDeploymentRequest } from './prompt.js';

export class DeploymentAgent extends BaseAgent {
  constructor() {
    super('deployment-agent', 'Deployment specialist focusing on CI/CD pipelines and infrastructure management');
  }

  protected getBaseSystemPrompt(): string {
    return DEPLOYMENT_AGENT_PROMPT;
  }

  protected getContextualPrompt(settings: ProjectSettings): string {
    const baseContext = super.getContextualPrompt(settings);
    const deploymentSpecificContext = getDeploymentContextualPrompt(settings.projectType);
    
    return baseContext + deploymentSpecificContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    const enhancedMessage = enhanceDeploymentRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }
} 
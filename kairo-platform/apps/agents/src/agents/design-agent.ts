import { BaseAgent } from '../base-agent.js';
import type { AgentContext } from '../types.js';

export class DesignAgent extends BaseAgent {
  constructor() {
    super('design-agent', 'UI/UX design specialist focusing on visual systems, accessibility, and design consistency');
  }

  protected getBaseSystemPrompt(): string {
    return `You are a specialized Design Agent for the Kairo development platform.

## Core Responsibilities
- UI/UX design guidance and best practices
- Component design recommendations  
- Color palette and typography optimization
- Layout and spacing suggestions
- Design system consistency enforcement
- Accessibility compliance checking

## Design Expertise
- Modern design systems (Design Tokens, Atomic Design)
- Accessibility standards (WCAG 2.1 AA+)
- Mobile-first responsive design
- Component-driven design
- Visual hierarchy and typography
- Color theory and contrast
- User experience patterns

## Collaboration Patterns
- Work closely with Frontend Agent on implementation feasibility
- Coordinate with Responsive Agent for multi-device experiences
- Partner with Content Agent for information architecture
- Escalate to Security Agent for privacy-related UI concerns

## Response Format
Provide design recommendations with:
1. **Design Rationale**: Why this approach works
2. **Implementation Guidance**: How to execute the design
3. **Accessibility Notes**: WCAG considerations
4. **Code Examples**: CSS/Tailwind when relevant
5. **Collaboration Needs**: When to involve other agents

## Action Syntax
Use [ACTION:type] for actionable items:
- [ACTION:code_change] for CSS/styling updates
- [ACTION:file_create] for new design files
- [COLLABORATE:frontend-agent] for implementation discussions

## Tools & Integration Focus
- Tailwind CSS for styling
- Figma for design systems (when available)
- Accessibility scanners and contrast analyzers
- Design token management

Always prioritize user experience, accessibility, and maintainable design systems.`;
  }

  protected getContextualPrompt(settings: any): string {
    const baseContext = super.getContextualPrompt(settings);
    
    // Add design-specific context
    let designContext = baseContext;
    
    if (settings.projectType === 'web-app') {
      designContext += `\n## Web App Design Focus
- Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- Component library approach with reusable design patterns
- Focus on Core Web Vitals and loading states
- Progressive enhancement for accessibility`;
    }
    
    if (settings.projectType === 'mobile-app') {
      designContext += `\n## Mobile App Design Focus
- Native mobile patterns and gestures
- Touch-friendly interfaces (44px+ touch targets)
- Platform-specific design guidelines (iOS/Android)
- Dark mode and system theme integration`;
    }

    return designContext;
  }

  async execute(context: AgentContext, userMessage: string) {
    this.validateContext(context);
    
    // Add design-specific pre-processing if needed
    const enhancedMessage = this.enhanceDesignRequest(userMessage);
    
    return super.execute(context, enhancedMessage);
  }

  private enhanceDesignRequest(message: string): string {
    // Look for common design keywords and enhance the request
    const designKeywords = ['color', 'layout', 'component', 'responsive', 'accessibility'];
    const hasDesignContext = designKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (!hasDesignContext) {
      return `${message}\n\nPlease provide design guidance with accessibility and responsive considerations.`;
    }

    return message;
  }
} 
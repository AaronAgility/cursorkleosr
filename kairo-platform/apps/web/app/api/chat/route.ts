import { streamText } from 'ai';
import { getProviderForAgent } from '../../../lib/ai-providers';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, orchestrationType, projectSettings } = await req.json();

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // For now, we'll use the frontend agent as our main orchestration agent
    // In the future, this would be a specialized orchestration model
    const model = getProviderForAgent();

    // Enhance the system prompt to include orchestration context
    const systemPrompt = `You are the Main Orchestration Agent for Kairo, a multi-agent development platform.

Your role is to coordinate specialized agents to help users build and improve their projects. You have access to these agents:
${projectSettings?.enabledAgents?.map((agentId: string) => `- ${agentId}`).join('\n') || '- frontend-agent\n- design-agent\n- performance-agent'}

Project Configuration:
- Type: ${projectSettings?.projectType || 'web-app'}
- Orchestration Mode: ${projectSettings?.orchestrationMode || 'intelligent'}
- Enabled Agents: ${projectSettings?.enabledAgents?.length || 3} agents

When responding:
1. Analyze the user's request
2. Determine which agents should handle different aspects
3. Provide a coordinated response that mentions which agents you're leveraging
4. Use this format when delegating: [agent-name] for specific tasks

Example: "I'll coordinate with [design-agent] for the UI layout and [performance-agent] for optimization."

Be helpful, professional, and always explain your orchestration decisions.`;

    // Add system message to the beginning
    const enhancedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Stream the response using Vercel AI SDK
    const result = streamText({
      model,
      messages: enhancedMessages,
      temperature: 0.7,
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Enable streaming
export const runtime = 'edge'; 
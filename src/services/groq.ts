import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { logAiInteraction } from '../utils/logger.js';

export const groqClient = new Groq({
  apiKey: env.GROQ_API_KEY || 'dummy_groq_api_key',
});

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generates an LLM completion using Groq SDK and logs prompt/response to prompts.md.
 */
export async function generateCompletion(
  prompt: string,
  systemPrompt: string = 'You are an expert technical interviewer assistant for InterviewOS.',
  options: GroqCompletionOptions = {}
): Promise<string> {
  const model = options.model || 'llama-3.3-70b-versatile';
  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  try {
    const response = await groqClient.chat.completions.create({
      messages,
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    });

    const completionText = response.choices[0]?.message?.content || '';

    // Log interaction to prompts.md
    logAiInteraction({
      taskName: 'Groq LLM Completion',
      userPrompt: `System: ${systemPrompt}\nUser: ${prompt}`,
      reasoning: `Invoked Groq SDK chat completion with model '${model}'. Extracted choice[0] completion message content.`,
      output: {
        model,
        usage: response.usage,
        completion: completionText,
      },
    });

    return completionText;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    logAiInteraction({
      taskName: 'Groq LLM Completion (Error/Logged)',
      userPrompt: prompt,
      reasoning: `Attempted Groq completion with model '${model}'. Captured error response for resilience.`,
      output: { error: errorMessage },
    });
    throw error;
  }
}

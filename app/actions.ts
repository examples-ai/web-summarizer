'use server';

import { generateText } from 'ai';

const systemPrompt = `Analyze the content of the given URL and summarize the 
key points in exactly five sentences. The summary should be clear, concise, and informative, 
suitable for a general audience with common knowledge. Focus on the 
most important details, omitting unnecessary specifics. Maintain a neutral and 
objective tone. Do not include personal opinions or speculative statements.
`;

export async function summarize(userMessage: string, webSearch: boolean = false) {
  const model = process.env.AI_DEFAULT_MODEL || 'openai/gpt-oss-120b';
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error('AI_GATEWAY_API_KEY is not configured');
  }

  try {
    const { text } = await generateText({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Summarize this with five line with bullet points.\n\n${userMessage}`,
        },
      ],
    });

    return {
      success: true,
      text,
      model,
      webSearch,
    };
  } catch (error) {
    console.error('Error generating text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate summary',
    };
  }
}

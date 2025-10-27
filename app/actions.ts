'use server';

import { generateText, type StepResult, stepCountIs } from 'ai';
import readabilize from '@/lib/ai/tools/readabilize';

// Define the tools type based on what we're using
type Tools = {
  readabilize: ReturnType<typeof readabilize.create>;
};

const systemPrompt = `Analyze the content of the given URL and summarize the 
key points in exactly five sentences. The summary should be clear, concise, and informative, 
suitable for a general audience with common knowledge. Focus on the 
most important details, omitting unnecessary specifics. Maintain a neutral and 
objective tone. Do not include personal opinions or speculative statements.

FORMATTING REQUIREMENTS (CRITICAL):
- Respond in MARKDOWN format.
- Use UNORDERED LIST format with FIVE items.
- Each item should be a COMPLETE SENTENCE.
- Do NOT use numbering or bullet points other than dashes (-).
- Ensure proper grammar, punctuation, and spelling.
`;

export async function summarize(url: string, webSearch: boolean = false) {
  const model = process.env.AI_DEFAULT_MODEL_ID || 'openai/gpt-oss-20b';

  try {
    const { steps } = await generateText({
      model: model,
      tools: {
        readabilize: readabilize.create(),
      },
      stopWhen: stepCountIs(3),
      activeTools: ['readabilize'],
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Summarize content in five bullet points from return content of readabilize with url.\n\n${url}`,
        },
      ],
    });

    const results = extractText(steps || []);
    if (!results || results.length === 0) {
      throw new Error('No readabilized content found');
    }

    return {
      success: true,
      text: results.join('\n'),
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

function extractText(steps: StepResult<Tools>[]): string[] {
  if (steps.length === 0) {
    return [];
  }

  const stopSteps = steps.filter((s) => s.finishReason === 'stop');

  if (stopSteps.length === 0) {
    return [];
  }

  const results: string[] = [];

  for (const step of stopSteps) {
    if (step.content) {
      const text = step.content
        .filter((c) => 'text' in c)
        .map((c) => c.text)
        .filter(Boolean)
        .join('\n');
      if (text.trim()) {
        results.push(text.trim());
      }
    }
  }

  return results;
}

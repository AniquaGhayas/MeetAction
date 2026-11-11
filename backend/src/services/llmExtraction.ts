import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config';

// 1. Zod schema for single extracted action item
export const ExtractedActionItemSchema = z.object({
  description: z.string().min(1, 'Description is required').describe('Concise, actionable task description'),
  assignee: z.string().nullable().optional().describe('Person responsible for this task, or null if unassigned'),
  due_date: z.string().nullable().optional().describe('Estimated due date in YYYY-MM-DD format if mentioned, or null'),
  source_snippet: z.string().describe('Exact transcript sentence/quote that proves this action item'),
});

export type ExtractedActionItem = z.infer<typeof ExtractedActionItemSchema>;

// 2. Schema for full LLM response
export const ExtractionResultSchema = z.object({
  action_items: z.array(ExtractedActionItemSchema).default([]),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Prompt instruction to guide the LLM extraction
 */
function buildExtractionPrompt(transcript: string, currentDate: string): string {
  return `You are MeetAction's intelligent action item extractor.
Analyze the following meeting transcript and extract all explicit or strongly implied action items, tasks, commitments, and follow-ups.

Current Date context for resolving relative dates: ${currentDate}

Extraction Guidelines:
1. "description": Be specific and concise. Start with an action verb (e.g., "Implement login OAuth flow", "Prepare Q3 financial slide deck").
2. "assignee": Extract the person's name or username assigned to or volunteering for the task. If ambiguous or unassigned, return null.
3. "due_date": If a deadline is mentioned (e.g. "by next Friday", "before end of month", "October 12th"), resolve it to an ISO format date string (YYYY-MM-DD). If no timeframe is mentioned, return null.
4. "source_snippet": The exact phrase or sentence from the transcript that originated this task.
5. If the transcript is conversational with no actionable tasks, return an empty array for action_items.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "action_items": [
    {
      "description": "string",
      "assignee": "string or null",
      "due_date": "YYYY-MM-DD or null",
      "source_snippet": "string"
    }
  ]
}

Transcript:
\"\"\"
${transcript}
\"\"\"`;
}

/**
 * Extracts action items from transcript using configured LLM provider (OpenAI / Anthropic)
 */
export async function extractActionItemsFromTranscript(
  transcript: string,
  retries = 2
): Promise<ExtractedActionItem[]> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return [];
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const prompt = buildExtractionPrompt(trimmed, currentDate);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      let rawJsonContent = '';

      if (config.llmProvider === 'anthropic' && config.anthropicApiKey) {
        // Anthropic Claude fallback
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': config.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 2000,
            system: 'You are an action item extraction assistant. Always respond ONLY in valid JSON matching the schema requested.',
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
        }

        const data: any = await response.json();
        rawJsonContent = data.content?.[0]?.text || '{}';
      } else if (config.llmProvider === 'gemini' || config.geminiApiKey) {
        // Google Gemini Flash (Free tier available)
        const geminiKey = config.geminiApiKey || config.openaiApiKey;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errBody}`);
        }

        const data: any = await response.json();
        rawJsonContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      } else {
        // Default: OpenAI (gpt-4o-mini)
        if (!config.openaiApiKey) {
          throw new Error('OPENAI_API_KEY is not configured in .env');
        }

        const openai = new OpenAI({ apiKey: config.openaiApiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: 'You extract structured action items from meeting transcripts. You always output valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        rawJsonContent = completion.choices[0]?.message?.content || '{}';
      }

      // Parse JSON
      const parsedJson = JSON.parse(rawJsonContent);

      // Validate against strict Zod schema
      const validated = ExtractionResultSchema.parse(parsedJson);

      return validated.action_items;
    } catch (err: any) {
      console.warn(`[LLM Extraction] Attempt ${attempt} failed: ${err.message}`);
      lastError = err;
      if (attempt <= retries) {
        // Exponential backoff before retry
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw new Error(`Failed to extract action items after ${retries + 1} attempts: ${lastError?.message}`);
}

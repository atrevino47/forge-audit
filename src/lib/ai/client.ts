// src/lib/ai/client.ts
// Anthropic API client — routes between Sonnet (deep) and Haiku (simple)

import Anthropic from '@anthropic-ai/sdk';
import type { SupportedLanguage } from '../../../contracts/constants';

const client = new Anthropic();

export interface AIAnalysisParams {
  systemPrompt: string;
  userPrompt: string;
  language: SupportedLanguage;
  maxTokens?: number;
}

/**
 * Use Sonnet for tasks requiring deep reasoning:
 * branding, content quality, sentiment, action plans, landing page gen
 */
export async function analyzeWithSonnet(params: AIAnalysisParams): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: params.maxTokens ?? 4096,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

/**
 * Use Haiku for fast, formulaic checks:
 * technical SEO, performance metrics, completeness checklists, ad pixel detection
 */
export async function analyzeWithHaiku(params: AIAnalysisParams): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20241022',
    max_tokens: params.maxTokens ?? 2048,
    system: params.systemPrompt,
    messages: [{ role: 'user', content: params.userPrompt }],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

/**
 * Parse JSON from AI response with try/catch fallback.
 * Strips markdown fences if present, returns null on failure.
 */
export function parseAIJSON<T>(raw: string): T | null {
  try {
    // Strip markdown code fences the model may wrap around JSON
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

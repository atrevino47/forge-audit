// src/lib/audit/ai-bridge.ts
// Bridge between audit analyzers and the AI/Copy agent's client.
// Centralizes prompt construction + JSON parsing so analyzers stay prompt-free.

import { analyzeWithSonnet, analyzeWithHaiku, parseAIJSON } from '../ai/client';
import type { AIAnalysisResult } from './types';

const SYSTEM_PROMPT =
  'You are a digital marketing expert analyst. ' +
  'Analyze the provided data and return a JSON object with this exact shape:\n' +
  '{\n' +
  '  "findings": ["finding1", "finding2"],\n' +
  '  "recommendations": [\n' +
  '    {\n' +
  '      "title": "short actionable title",\n' +
  '      "description": "one-sentence actionable description",\n' +
  '      "priority": "high | medium | low",\n' +
  '      "effort": "quick-win | moderate | major-project",\n' +
  '      "impact": "high | medium | low"\n' +
  '    }\n' +
  '  ]\n' +
  '}\n' +
  'Return 3-5 recommendations sorted by priority. Respond ONLY with valid JSON — no markdown fences, no preamble.';

/**
 * Call AI analysis and return structured recommendations.
 * Retries once on failure per AGENT-AUDIT spec.
 *
 * @param task  - descriptive label (e.g. "seo-recommendations")
 * @param data  - arbitrary data for the model to analyze
 * @param language - response language
 * @param model - "sonnet" for deep analysis, "haiku" for fast checks
 */
export async function callAIForRecommendations(options: {
  task: string;
  data: Record<string, unknown>;
  language: 'en' | 'es';
  model: 'sonnet' | 'haiku';
}): Promise<AIAnalysisResult> {
  const { task, data, language, model } = options;
  const analyzeFn = model === 'sonnet' ? analyzeWithSonnet : analyzeWithHaiku;

  const langInstruction = language === 'es'
    ? ' Write all text content (titles, descriptions, findings) in Spanish.'
    : '';

  const systemPrompt = SYSTEM_PROMPT + langInstruction;
  const userPrompt = `Task: ${task}\n\nData:\n${JSON.stringify(data, null, 2)}`;

  // First attempt
  let raw: string;
  try {
    raw = await analyzeFn({ systemPrompt, userPrompt, language });
  } catch (firstError) {
    // Retry once per AGENT-AUDIT spec
    try {
      raw = await analyzeFn({ systemPrompt, userPrompt, language });
    } catch {
      throw firstError;
    }
  }

  const parsed = parseAIJSON<AIAnalysisResult>(raw);
  if (!parsed) {
    throw new Error(`AI returned unparseable response for task "${task}"`);
  }

  return parsed;
}

// src/lib/ai/index.ts
// Re-exports AI client and generators

export { analyzeWithSonnet, analyzeWithHaiku, parseAIJSON } from './client';
export type { AIAnalysisParams } from './client';
export { generateActionPlan } from './action-plan';
export { generateLandingPage } from '../landing-gen/generator';

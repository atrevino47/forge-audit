// Email design tokens and shared configuration
// Must stay in sync with docs/AGENT-ASSETS.md color tokens

export const emailColors = {
  bg: '#0B1120',
  surface: '#0F172A',
  card: '#1E293B',
  accent: '#D4A537',
  text: '#F8FAFC',
  muted: '#94A3B8',
  pass: '#22C55E',
  warning: '#F59E0B',
  fail: '#EF4444',
  border: 'rgba(212, 165, 55, 0.15)',
} as const;

export const BASE_URL = 'https://audit.forgedigital.com';

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function getStatusColor(status: 'pass' | 'warning' | 'fail'): string {
  return emailColors[status];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return emailColors.pass;
  if (score >= 60) return emailColors.warning;
  return emailColors.fail;
}

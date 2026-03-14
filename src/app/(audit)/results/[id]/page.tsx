import type { Metadata } from 'next';
import { ResultsLayout } from '@/components/results/ResultsLayout';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Audit Results | Forge Digital`,
    description: 'View your AI-powered digital presence audit results.',
    robots: { index: false, follow: false },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  return <ResultsLayout auditId={id} />;
}

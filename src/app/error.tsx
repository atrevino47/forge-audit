'use client';

import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forge-base px-4 text-center">
      <AlertCircle className="mb-6 h-16 w-16 text-forge-fail" />
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-forge-text">
        Something went wrong
      </h1>
      <p className="mb-8 text-lg text-forge-text-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center rounded-lg bg-forge-accent px-6 py-3 text-sm font-medium text-forge-base transition-colors hover:bg-forge-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}

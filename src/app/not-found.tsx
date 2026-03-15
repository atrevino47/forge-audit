import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forge-base px-4 text-center">
      <SearchX className="mb-6 h-16 w-16 text-forge-accent" />
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-forge-text">
        404
      </h1>
      <p className="mb-8 text-lg text-forge-text-muted">
        Page not found. The page you are looking for does not exist or has been
        moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-forge-accent px-6 py-3 text-sm font-medium text-forge-base transition-colors hover:bg-forge-accent-hover"
      >
        Back to Home
      </Link>
    </div>
  );
}

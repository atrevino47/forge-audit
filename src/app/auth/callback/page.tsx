'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Auth callback handling will be implemented by the Backend agent
    // For now, redirect to home after a brief delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-forge-base">
      <Logo size="lg" />
      <div className="mt-8 flex items-center gap-3 text-forge-text-muted">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Signing you in...</span>
      </div>
    </div>
  );
}

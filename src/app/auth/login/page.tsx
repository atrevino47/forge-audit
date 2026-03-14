'use client';

import { Logo } from '@/components/shared/Logo';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Chrome, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-forge-base">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block cursor-pointer">
            <Logo size="lg" />
          </Link>
        </div>
        <GlassCard className="p-8 rounded-2xl" hover={false}>
          <h1 className="text-xl font-semibold text-center mb-6">
            Sign in to your account
          </h1>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium cursor-pointer"
            >
              <Chrome className="size-4 mr-2" />
              Continue with Google
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-forge-glass-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-forge-card px-3 text-xs text-forge-text-muted">or</span>
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full h-12 px-4 text-sm rounded-xl bg-forge-card border border-forge-glass-border focus:border-forge-accent focus:outline-none transition-colors duration-200"
              />
              <Button
                className="w-full h-12 text-sm font-medium bg-forge-accent text-forge-base hover:bg-forge-accent-hover cursor-pointer"
              >
                <Mail className="size-4 mr-2" />
                Send Magic Link
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/db/client';

interface SaveResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string;
}

export function SaveResultsModal({ isOpen, onClose, auditId }: SaveResultsModalProps) {
  const t = useTranslations('results');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleGoogleAuth() {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/audit/results/${auditId}`,
      },
    });
    if (error) {
      console.error('OAuth error:', error.message);
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) return;
    setIsSending(true);
    try {
      await fetch('/api/auth/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, auditId }),
      });
      setMagicLinkSent(true);
    } catch {
      // Error handling — the request failed silently for now
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-forge-base/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md backdrop-blur-xl bg-forge-glass border border-forge-glass-border rounded-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 cursor-pointer text-forge-text-muted hover:text-forge-text transition-colors duration-200 p-1"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-forge-text">
                  {t('saveModal.title')}
                </h3>
                <p className="text-sm text-forge-text-muted mt-1.5">
                  {t('saveModal.subtitle')}
                </p>
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full cursor-pointer rounded-lg border border-forge-glass-border bg-white/5 hover:bg-white/10 text-forge-text font-medium py-3 px-4 button-micro hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-3 mb-4"
              >
                {/* Google icon - inline SVG */}
                <svg className="size-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t('saveModal.google')}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-forge-glass-border" />
                <span className="text-xs text-forge-text-muted">or</span>
                <div className="flex-1 h-px bg-forge-glass-border" />
              </div>

              {/* Email magic link */}
              {magicLinkSent ? (
                <div className="text-center py-4">
                  <Mail className="size-8 text-forge-accent mx-auto mb-3" />
                  <p className="text-sm text-forge-text font-medium">
                    Check your inbox
                  </p>
                  <p className="text-xs text-forge-text-muted mt-1">
                    We sent a magic link to {email}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('saveModal.emailPlaceholder')}
                    className="w-full rounded-lg border border-forge-glass-border bg-forge-surface px-4 py-2.5 text-sm text-forge-text placeholder:text-forge-text-muted/50 focus:outline-none input-focus-glow transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleMagicLink();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isSending || !email.trim()}
                    className={cn(
                      'w-full cursor-pointer rounded-lg bg-forge-accent hover:bg-forge-accent-hover text-forge-base font-semibold py-2.5 px-4 button-micro hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-2 text-sm',
                      (isSending || !email.trim()) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Mail className="size-4" />
                    {t('saveModal.magicLink')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

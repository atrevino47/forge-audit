'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  const t = useTranslations('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#categories', label: t('nav.whatYouLearn') },
    { href: '#faq', label: t('nav.faq') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-forge-glass-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <Logo size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-forge-text-muted hover:text-forge-text transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-forge-text-muted hover:text-forge-text cursor-pointer">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/audit/wizard">
              <Button
                size="sm"
                className="bg-forge-accent text-forge-base hover:bg-forge-accent-hover gold-glow cursor-pointer font-semibold"
              >
                {t('cta.startAuditShort')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button — min 44px touch target */}
          <button
            className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-forge-text-muted hover:text-forge-text button-micro active:scale-[0.95] cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden glass-surface border-t border-forge-glass-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-3 min-h-[44px] flex items-center text-sm text-forge-text-muted hover:text-forge-text transition-colors cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-forge-glass-border space-y-2">
                <Link href="/auth/login" className="block">
                  <Button variant="ghost" size="sm" className={cn('w-full justify-start text-forge-text-muted cursor-pointer')}>
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/audit/wizard" className="block">
                  <Button
                    size="sm"
                    className="w-full bg-forge-accent text-forge-base hover:bg-forge-accent-hover gold-glow cursor-pointer font-semibold"
                  >
                    {t('cta.startAuditShort')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

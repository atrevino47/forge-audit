'use client';

import { useTranslations } from '@/hooks/use-translations';
import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');

  return (
    <footer className="border-t border-forge-glass-border py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" />
            <p className="text-xs text-forge-text-muted">
              {tc('brand.tagline')}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-forge-text-muted">
            <Link href="/privacy" className="hover:text-forge-text transition-colors cursor-pointer">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-forge-text transition-colors cursor-pointer">
              {t('footer.terms')}
            </Link>
          </div>

          <p className="text-xs text-forge-text-muted/60">
            &copy; {new Date().getFullYear()} {tc('brand.name')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}

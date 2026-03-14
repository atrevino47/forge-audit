'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/use-translations';
import { GlassCard } from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import type { LandingPagePreviewProps } from '../../../contracts/component-props';

export function LandingPagePreview({ pageId, previewUrl }: LandingPagePreviewProps) {
  const t = useTranslations('results');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-forge-text">
            {t('preview.title')}
          </h2>
          <p className="text-sm text-forge-text-muted mt-1">
            {t('preview.subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-1.5 border-forge-glass-border text-forge-text-muted hover:text-forge-text"
          onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Open</span>
        </Button>
      </div>

      <GlassCard hover={false} className="p-0 overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <div className="flex items-center justify-center h-[400px] lg:h-[500px]">
            <Loader2 className="size-6 text-forge-accent animate-spin" />
          </div>
        )}

        {/* iframe */}
        <iframe
          src={previewUrl}
          title="Landing page preview"
          className={`w-full border-0 rounded-xl ${isLoading ? 'h-0' : 'h-[400px] lg:h-[500px]'}`}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin"
        />
      </GlassCard>
    </motion.section>
  );
}

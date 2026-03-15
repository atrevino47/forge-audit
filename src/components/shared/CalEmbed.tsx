'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CalEmbedProps {
  isOpen: boolean;
  onClose: () => void;
  prefillName?: string;
  prefillEmail?: string;
}

export function CalEmbed({ isOpen, onClose, prefillName, prefillEmail }: CalEmbedProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Build iframe URL with optional prefill params
  const baseUrl =
    process.env.NEXT_PUBLIC_CALCOM_EMBED_URL || 'https://cal.com/forgedigital/strategy';
  const url = new URL(baseUrl);

  if (prefillName) url.searchParams.set('name', prefillName);
  if (prefillEmail) url.searchParams.set('email', prefillEmail);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl overflow-hidden bg-forge-surface border border-white/10 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-forge-text-muted hover:text-forge-text"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {/* Cal.com iframe */}
            <iframe
              src={url.toString()}
              title="Book a strategy call"
              className="w-full h-[600px] border-0"
              allow="camera; microphone"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

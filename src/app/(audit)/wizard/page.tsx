'use client';

import { Suspense } from 'react';
import { WizardLayout } from '@/components/wizard/WizardLayout';

export default function WizardPage() {
  return (
    <Suspense>
      <WizardLayout />
    </Suspense>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-forge-base text-forge-text px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-forge-accent hover:underline mb-8 inline-block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-sm text-forge-text-muted leading-relaxed">
          <p><strong className="text-forge-text">Last updated:</strong> March 14, 2026</p>
          <p>Forge Digital (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates audit.forgedigital.com. This page informs you of our policies regarding the collection, use, and disclosure of personal data.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Information We Collect</h2>
          <p>When you use our audit tool, we collect the information you provide: your name, email address, business name, website URL, and social media profiles. We also collect your IP address for rate limiting purposes.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">How We Use Your Information</h2>
          <p>We use your information to: run your audit analysis, deliver your results, send you follow-up emails about your audit, and improve our services. We do not sell your personal data to third parties.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Data Storage</h2>
          <p>Your data is stored securely using Supabase (PostgreSQL) with row-level security policies. Payment information is processed by Stripe and never stored on our servers.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Contact</h2>
          <p>For questions about this policy, contact us at <a href="mailto:hello@forgedigital.com" className="text-forge-accent hover:underline">hello@forgedigital.com</a>.</p>
        </div>
      </div>
    </div>
  );
}

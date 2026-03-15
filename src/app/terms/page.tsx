import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-forge-base text-forge-text px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-forge-accent hover:underline mb-8 inline-block">&larr; Back to home</Link>
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-6 text-sm text-forge-text-muted leading-relaxed">
          <p><strong className="text-forge-text">Last updated:</strong> March 14, 2026</p>
          <p>By using audit.forgedigital.com, you agree to these terms. Please read them carefully.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Service Description</h2>
          <p>Forge Audit provides an AI-powered analysis of your online presence across 7 dimensions. The free audit is provided as-is. Competitor analysis and re-audit features are available as paid add-ons.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Payments</h2>
          <p>Paid features are processed through Stripe. All prices are in USD. Refunds are handled on a case-by-case basis.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Accuracy</h2>
          <p>Our audit results are generated using AI and automated analysis tools. While we strive for accuracy, results should be considered advisory and not a guarantee of performance.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Intellectual Property</h2>
          <p>The Forge Audit tool, its design, and all content are the property of Forge Digital. Generated landing page previews are provided for demonstration purposes.</p>
          <h2 className="text-lg font-semibold text-forge-text pt-4">Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:hello@forgedigital.com" className="text-forge-accent hover:underline">hello@forgedigital.com</a>.</p>
        </div>
      </div>
    </div>
  );
}

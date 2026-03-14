import { redirect } from 'next/navigation';

interface CampaignEntryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignEntryPage({ params }: CampaignEntryPageProps) {
  const { slug } = await params;

  // Track campaign click via API, then redirect to wizard with campaign context
  // The API call is fire-and-forget — don't block the redirect
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
    fetch(`${baseUrl}/api/campaigns/${slug}`, {
      method: 'GET',
    }).catch(() => {
      // Silently fail — tracking shouldn't block user flow
    });
  } catch {
    // Silently fail
  }

  redirect(`/audit/wizard?campaign=${encodeURIComponent(slug)}`);
}

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/db/client';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  const supabase = createServiceClient();

  const { data: page, error } = await supabase
    .from('generated_pages')
    .select('id, html, business_name')
    .eq('id', id)
    .single();

  if (error || !page) {
    notFound();
  }

  const html = page.html as string;

  return (
    <div className="min-h-screen">
      <iframe
        srcDoc={html}
        className="w-full h-screen border-0"
        title={`Landing Page Preview — ${page.business_name ?? 'Preview'}`}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-forge-base">
      <iframe
        src={`/api/landing-page/generate?id=${encodeURIComponent(id)}`}
        className="w-full h-screen border-0"
        title="Generated Landing Page Preview"
      />
    </div>
  );
}

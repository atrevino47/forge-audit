import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PageTransition } from '@/components/shared/PageTransition';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Forge Audit — Free AI-Powered Online Presence Audit',
    template: '%s | Forge Audit',
  },
  description:
    'Get a comprehensive AI-powered audit of your online presence across 7 dimensions — SEO, website quality, social media, branding, Google Business Profile, ads readiness, and reputation.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://audit.forgedigital.com'),
  openGraph: {
    title: 'Forge Audit — Free AI-Powered Online Presence Audit',
    description:
      'Get a comprehensive AI-powered audit of your online presence across 7 dimensions.',
    type: 'website',
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forge Audit — Free AI-Powered Online Presence Audit',
    description:
      'Get a comprehensive AI-powered audit of your online presence across 7 dimensions.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-forge-base text-forge-text`}
      >
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}

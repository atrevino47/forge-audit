import type { Metadata } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  variable: '--font-display',
  subsets: ['latin'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
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
        className={`${instrumentSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased bg-forge-base text-forge-text`}
      >
        {children}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}

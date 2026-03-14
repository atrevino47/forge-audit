import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
  title: 'Forge Audit — Free AI-Powered Digital Presence Audit',
  description:
    'Discover how your business really looks online. Get a free, AI-powered audit of your website, SEO, social media, branding, and more in under 60 seconds.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com'),
  openGraph: {
    title: 'Forge Audit — Free AI-Powered Digital Presence Audit',
    description:
      'Discover how your business really looks online. Get a free audit of 7 dimensions of your digital presence.',
    type: 'website',
    siteName: 'Forge Audit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forge Audit — Free Digital Presence Audit',
    description: 'AI-powered audit of your website, SEO, social media & more.',
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
        {children}
      </body>
    </html>
  );
}

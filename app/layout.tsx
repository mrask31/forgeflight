import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ForgeFlight - Cognitive Flight Deck',
  description: 'AI-powered flight training assistant for student pilots',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ForgeFlight',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#0070f3" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

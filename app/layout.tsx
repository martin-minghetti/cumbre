import type { Metadata } from 'next';
import { Anton, Newsreader, JetBrains_Mono } from 'next/font/google';
import { brand } from '@/config/brand';
import './globals.css';
import { cn } from '@/lib/utils';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${brand.name}. ${brand.tagline}`,
  description: brand.tagline,
  openGraph: {
    title: `${brand.name}. ${brand.tagline}`,
    description: brand.tagline,
    images: [{ url: '/og.jpg', width: 1344, height: 768 }],
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brand.name}. ${brand.tagline}`,
    description: brand.tagline,
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={cn(anton.variable, newsreader.variable, jetbrainsMono.variable)}
    >
      <body>{children}</body>
    </html>
  );
}

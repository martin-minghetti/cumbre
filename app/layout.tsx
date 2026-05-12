import type { Metadata } from 'next';
import { Anton, Geist } from 'next/font/google';
import { brand } from '@/config/brand';
import './globals.css';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const geist = Geist({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}

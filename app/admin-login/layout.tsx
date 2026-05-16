import type { ReactNode } from 'react';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

import '../(admin)/globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'Login. Cumbre Admin',
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        'admin-shell dark font-sans min-h-screen flex items-center justify-center bg-background',
        geist.variable,
      )}
    >
      {children}
    </div>
  );
}

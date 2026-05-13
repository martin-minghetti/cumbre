import type { ReactNode } from 'react';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/admin/AppSidebar';

import '../globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'Cumbre Admin',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn('admin-shell font-sans min-h-screen', geist.variable)}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col bg-background text-foreground">
          <header className="border-b p-3 flex items-center gap-3">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Cumbre · Admin</span>
          </header>
          <div className="flex-1">{children}</div>
          <Toaster />
        </main>
      </SidebarProvider>
    </div>
  );
}

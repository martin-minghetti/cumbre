import type { ReactNode } from 'react';

import '../globals.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}

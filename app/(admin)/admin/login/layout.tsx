import '@/app/(admin)/globals.css';

export const metadata = { title: 'Login - Cumbre Admin' };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="admin-shell min-h-screen flex items-center justify-center bg-background">
        {children}
      </body>
    </html>
  );
}

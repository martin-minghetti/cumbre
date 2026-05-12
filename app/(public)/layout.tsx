import { AgeGate } from '@/components/public/AgeGate';
import { Footer } from '@/components/public/Footer';
import { Nav } from '@/components/public/Nav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}

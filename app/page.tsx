import { brand } from '@/config/brand';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-display text-6xl mb-4">{brand.name}</h1>
        <p className="text-lg opacity-70">{brand.tagline}</p>
        <p className="text-sm opacity-40 mt-8">Phase 1 scaffold · {new Date().toISOString().split('T')[0]}</p>
      </div>
    </main>
  );
}

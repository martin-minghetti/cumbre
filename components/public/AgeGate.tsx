'use client';

import { useEffect, useState } from 'react';
import { brand } from '@/config/brand';

const STORAGE_KEY = 'cumbre_age_ok';

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ok = typeof window !== 'undefined' && window.sessionStorage.getItem(STORAGE_KEY) === '1';
    if (!ok) setOpen(true);
  }, []);

  function confirm() {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  function deny() {
    window.location.href = 'https://www.argentina.gob.ar/normativa';
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(5,6,8,0.94)] p-9 backdrop-blur-xl">
      <div className="max-w-[540px] border border-line bg-bg px-14 py-16 text-center">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.28em] text-accent">▲ Acceso restringido</p>
        <h2 className="mb-4 font-display text-[64px] uppercase leading-[0.92]">
          Tenés <em className="font-body font-light italic text-accent">{brand.ageGate.minAge}</em>?
        </h2>
        <p className="mb-8 leading-[1.5] text-muted">{brand.ageGate.message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={deny}
            className="border border-line-strong px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] transition hover:bg-snow hover:text-bg"
          >
            No, salir
          </button>
          <button
            onClick={confirm}
            className="border border-accent bg-accent px-7 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-bg transition hover:bg-snow"
          >
            Sí, entrar
          </button>
        </div>
      </div>
    </div>
  );
}

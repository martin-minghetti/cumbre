const STYLES = ['IPA', 'STOUT', 'LAGER', 'PILSNER', 'GOLDEN', 'PORTER', 'WHEAT', 'ALE'];

export function Marquee() {
  const sequence = STYLES.join(' · ') + ' · ';
  return (
    <div className="overflow-hidden border-y border-accent-deep bg-paper py-6 text-[#1a1410]">
      <div
        className="marquee-track flex gap-16 whitespace-nowrap font-display text-[32px] uppercase tracking-[0.02em]"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        <span>{sequence.repeat(3)}</span>
        <span aria-hidden="true">{sequence.repeat(3)}</span>
      </div>
    </div>
  );
}

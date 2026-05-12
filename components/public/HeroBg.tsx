export function HeroBg() {
  return (
    <>
      <div
        className="absolute inset-0 -z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 80% 40% at 50% 78%, rgba(200, 132, 58, 0.28), transparent 60%),
            radial-gradient(ellipse 60% 30% at 30% 65%, rgba(176, 90, 50, 0.18), transparent 70%),
            linear-gradient(180deg, #050608 0%, #0d0e10 40%, #1a1410 65%, #2a1a10 85%, #050608 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-[1] h-[38%] bg-[#050608]"
        style={{
          clipPath:
            'polygon(0% 100%, 0% 78%, 8% 60%, 15% 70%, 22% 45%, 28% 58%, 35% 28%, 42% 50%, 50% 32%, 57% 55%, 63% 38%, 70% 62%, 78% 48%, 86% 65%, 94% 55%, 100% 70%, 100% 100%)',
        }}
      />
    </>
  );
}

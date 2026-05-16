import Image from 'next/image';

export function HeroBg() {
  return (
    <>
      <Image
        src="/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-[2] object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 80% 40% at 50% 78%, rgba(200, 132, 58, 0.18), transparent 60%),
            linear-gradient(180deg, rgba(5,6,8,0.55) 0%, rgba(13,14,16,0.65) 40%, rgba(26,20,16,0.7) 65%, rgba(5,6,8,0.8) 100%)
          `,
        }}
      />
    </>
  );
}

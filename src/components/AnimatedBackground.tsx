import { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  color: string;
}

const COLORS = [
  'rgba(99,102,241,0.4)',   // indigo
  'rgba(139,92,246,0.35)',  // violet
  'rgba(59,130,246,0.3)',   // blue
  'rgba(236,72,153,0.25)',  // pink
  'rgba(34,197,94,0.2)',    // green
];

export const AnimatedBackground = () => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 5.5 + 2) % 100}%`,
      delay: `${(i * 0.43) % 8}s`,
      duration: `${7 + (i % 5)}s`,
      size: `${2 + (i % 3)}px`,
      color: COLORS[i % COLORS.length],
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep space bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,40,200,0.12) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(30,60,180,0.1) 0%, transparent 50%), ' +
            'radial-gradient(ellipse 50% 30% at 20% 90%, rgba(200,30,80,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Subtle pixel grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.012) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-4px',
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animation: `bg-particle ${p.duration} ${p.delay} linear infinite`,
          }}
        />
      ))}

      {/* Slow moving scanline */}
      <div
        className="absolute left-0 right-0 h-px opacity-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(160,100,255,0.6), transparent)',
          animation: 'scanline 8s linear infinite',
        }}
      />
    </div>
  );
};

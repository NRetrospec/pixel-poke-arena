import { useEffect, useState } from 'react';
import { PokemonCard } from '@/types/pokemon';
import { PokemonSprite } from './PokemonSprite';
import { getTypeColor } from '@/lib/typeColors';

export interface FaceoffData {
  playerCard: PokemonCard;
  opponentCard: PokemonCard;
  playerDamage: number;
  opponentDamage: number;
  playerDefeated: boolean;
  opponentDefeated: boolean;
  abilityTrigger?: string;
}

interface Props {
  data: FaceoffData;
  onComplete: () => void;
  isMobile?: boolean;
}

export const FaceOffOverlay = ({ data, onComplete, isMobile = false }: Props) => {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const { playerCard, opponentCard, playerDamage, opponentDamage, abilityTrigger } = data;

  const playerColor = getTypeColor(playerCard.types[0]);
  const opponentColor = getTypeColor(opponentCard.types[0]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const overlayStyle = isMobile
    ? { position: 'fixed' as const, inset: 0, zIndex: 50 }
    : { position: 'fixed' as const, inset: 0, zIndex: 50 };

  return (
    <div
      style={overlayStyle}
      className={`flex items-center justify-center transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(2,2,12,0.92)', backdropFilter: 'blur(4px)' }}
      />

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-lg px-4">
        {/* Ability trigger banner */}
        {abilityTrigger && (
          <div
            className="text-center font-bold uppercase tracking-widest text-sm animate-damage-pop px-6 py-2 rounded"
            style={{
              fontFamily: 'var(--font-pixel)',
              color: '#ff4444',
              background: 'rgba(255,30,30,0.15)',
              border: '2px solid #ff4444',
              boxShadow: '0 0 16px rgba(255,50,50,0.5)',
              fontSize: '0.6rem',
            }}
          >
            {abilityTrigger}
          </div>
        )}

        {/* Cards + VS layout */}
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Player card */}
          <div
            className={`flex-1 max-w-[160px] ${phase !== 'enter' ? 'animate-card-enter-left' : 'opacity-0'}`}
          >
            <FaceoffCard card={playerCard} color={playerColor} label="YOU" damage={opponentDamage} defeated={data.playerDefeated} />
          </div>

          {/* VS */}
          <div
            className={`flex flex-col items-center ${phase !== 'enter' ? 'animate-vs-flash' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.6rem',
                color: '#ff2d78',
                textShadow: '0 0 20px #ff2d78, 0 0 40px #ff2d78aa',
                letterSpacing: '0.1em',
              }}
            >
              VS
            </span>
          </div>

          {/* Opponent card */}
          <div
            className={`flex-1 max-w-[160px] ${phase !== 'enter' ? 'animate-card-enter-right' : 'opacity-0'}`}
          >
            <FaceoffCard card={opponentCard} color={opponentColor} label="OPPONENT" damage={playerDamage} defeated={data.opponentDefeated} />
          </div>
        </div>

        {/* HP bars */}
        <div className="w-full space-y-2">
          <HpBar label={playerCard.name.toUpperCase()} card={playerCard} color={playerColor} />
          <HpBar label={opponentCard.name.toUpperCase()} card={opponentCard} color={opponentColor} />
        </div>
      </div>
    </div>
  );
};

const FaceoffCard = ({
  card,
  color,
  label,
  damage,
  defeated,
}: {
  card: PokemonCard;
  color: string;
  label: string;
  damage: number;
  defeated: boolean;
}) => (
  <div
    className="relative rounded overflow-hidden pixel-card p-3 flex flex-col items-center gap-1"
    style={{
      border: `2px solid ${color}`,
      boxShadow: `0 0 14px ${color}80, 0 0 28px ${color}30, inset 0 0 12px ${color}10`,
    }}
  >
    {/* Window dots */}
    <div className="absolute top-2 right-2 flex gap-1">
      {[color, '#888', '#444'].map((c, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c, opacity: 0.8 }} />
      ))}
    </div>

    <div className="text-center" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color, marginBottom: 2 }}>
      {label}
    </div>

    <PokemonSprite
      pokemon={card}
      animState={defeated ? 'faint' : 'attack'}
      className="w-20 h-20"
    />

    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem', color: '#e2e8f0', textTransform: 'uppercase' }}>
      {card.name}
    </div>

    <div className="flex gap-3 text-center" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem' }}>
      <span style={{ color: '#94a3b8' }}>HP <span style={{ color: '#22c55e' }}>{card.stats.hp}</span></span>
      <span style={{ color: '#94a3b8' }}>ATK <span style={{ color: '#f97316' }}>{card.stats.attack}</span></span>
    </div>

    {/* Damage indicator */}
    {damage > 0 && (
      <div
        className="animate-damage-pop text-center"
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.6rem',
          color: '#ff4444',
          textShadow: '0 0 8px #ff4444',
        }}
      >
        -{damage}
      </div>
    )}
  </div>
);

const HpBar = ({ label, card, color }: { label: string; card: PokemonCard; color: string }) => {
  const pct = Math.max(0, Math.min(100, (card.stats.hp / Math.max(card.stats.hp, 1)) * 100));
  const barColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';

  return (
    <div className="flex items-center gap-2">
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color, minWidth: 70 }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-sm bg-gray-900 overflow-hidden border border-gray-700">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 4px ${barColor}` }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: '#94a3b8', minWidth: 40, textAlign: 'right' }}>
        {card.stats.hp}
      </span>
    </div>
  );
};

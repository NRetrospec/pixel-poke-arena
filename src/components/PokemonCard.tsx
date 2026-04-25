import { PokemonCard as PokemonCardType } from '@/types/pokemon';
import { getTypeColor } from '@/lib/typeColors';

interface PokemonCardProps {
  pokemon: PokemonCardType;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

const PokemonCard = ({ pokemon, selected, onSelect, compact = false }: PokemonCardProps) => {
  const primaryColor = getTypeColor(pokemon.types[0]);
  const secondaryColor = pokemon.types[1] ? getTypeColor(pokemon.types[1]) : primaryColor;

  const borderStyle = selected
    ? {
        borderColor: primaryColor,
        boxShadow: `0 0 16px ${primaryColor}90, 0 0 32px ${primaryColor}40, inset 0 0 16px ${primaryColor}15`,
        transform: 'scale(1.05)',
      }
    : {
        borderColor: `${primaryColor}60`,
        boxShadow: `0 0 6px ${primaryColor}30`,
      };

  return (
    <div
      className="relative overflow-hidden cursor-pointer rounded transition-all duration-200 pixel-card select-none"
      style={{
        border: `2px solid`,
        ...borderStyle,
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = primaryColor;
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 14px ${primaryColor}70, 0 0 28px ${primaryColor}30`;
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px) scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${primaryColor}60`;
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 6px ${primaryColor}30`;
          (e.currentTarget as HTMLDivElement).style.transform = '';
        }
      }}
    >
      {/* Top decoration row */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1">
        {/* Cost badge */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            boxShadow: `0 0 6px ${primaryColor}80`,
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.5rem',
          }}
        >
          {pokemon.cost}
        </div>

        {/* Window dots */}
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor, opacity: 0.9 }} />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
        </div>
      </div>

      {/* Sprite area */}
      <div
        className="mx-2 mb-1 flex items-center justify-center rounded"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor}12 0%, transparent 70%)`,
          aspectRatio: '1/1',
          border: `1px solid ${primaryColor}25`,
        }}
      >
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={compact ? 'w-14 h-14' : 'w-20 h-20'}
          style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          draggable={false}
        />
      </div>

      {/* Type badges */}
      <div className="flex gap-1 justify-center px-2 mb-1 flex-wrap">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="type-badge"
            style={{
              background: `${getTypeColor(type)}22`,
              color: getTypeColor(type),
              border: `1px solid ${getTypeColor(type)}50`,
            }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Name bar */}
      <div
        className="mx-2 px-2 py-1 rounded-sm mb-1"
        style={{
          background: `${primaryColor}18`,
          borderBottom: `1px solid ${primaryColor}40`,
        }}
      >
        <div
          className="uppercase truncate text-center"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: '#e2e8f0', letterSpacing: '0.05em' }}
        >
          {pokemon.name}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-2 pb-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <StatRow label="HP" value={pokemon.stats.hp} color="#22c55e" />
        <StatRow label="ATK" value={pokemon.stats.attack} color="#f97316" />
        <StatRow label="DEF" value={pokemon.stats.defense} color="#3b82f6" />
        <StatRow label="SPD" value={pokemon.stats.speed} color="#eab308" />
      </div>

      {/* Ability */}
      {pokemon.ability && (
        <div
          className="mx-2 mb-2 px-2 py-1 rounded-sm"
          style={{
            background: `${primaryColor}12`,
            border: `1px solid ${primaryColor}35`,
          }}
        >
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: primaryColor, marginBottom: 1 }}>
            {pokemon.ability.name}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.35rem', color: '#64748b', lineHeight: '1.4' }}>
            {pokemon.ability.description}
          </div>
        </div>
      )}
    </div>
  );
};

const StatRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center gap-1">
    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: '#64748b', minWidth: 20 }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color }}>{value}</span>
  </div>
);

export default PokemonCard;

export const getTypeColor = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'fire': return '#ef4444';
    case 'water': return '#3b82f6';
    case 'electric': return '#eab308';
    case 'grass': return '#22c55e';
    case 'poison': return '#a855f7';
    case 'psychic': return '#ec4899';
    case 'ice': return '#22d3ee';
    case 'dragon': return '#6366f1';
    case 'dark': return '#6b7280';
    case 'fairy': return '#f43f5e';
    case 'fighting': return '#f97316';
    case 'ground': return '#d97706';
    case 'flying': return '#38bdf8';
    case 'bug': return '#84cc16';
    case 'rock': return '#a8a29e';
    case 'ghost': return '#8b5cf6';
    case 'steel': return '#94a3b8';
    case 'normal': return '#9ca3af';
    default: return '#60a5fa';
  }
};

export interface PokemonCard {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  ability?: CardAbility;
  cost: 1 | 2 | 3; // Card point cost
  movementPoints: number;
}

export interface CardAbility {
  name: string;
  effect: 'double_damage' | 'regenerate' | 'stun' | 'shield' | 'speed_boost';
  description: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: PokemonCard[];
}

export interface GameState {
  player1: {
    deck: PokemonCard[];
    hand: PokemonCard[];
    field: (PokemonCard | null)[];
    hp: number;
  };
  player2: {
    deck: PokemonCard[];
    hand: PokemonCard[];
    field: (PokemonCard | null)[];
    hp: number;
  };
  currentTurn: 'player1' | 'player2';
  phase: 'play' | 'movement' | 'battle';
}

// Design tokens mirrored from src/index.css

export const C = {
  bg: "hsl(250, 100%, 6%)",
  bgAlt: "hsl(250, 50%, 9%)",
  primary: "hsl(16, 100%, 60%)",
  secondary: "hsl(330, 100%, 60%)",
  accent: "hsl(270, 100%, 65%)",
  text: "hsl(45, 100%, 95%)",
  textDim: "hsl(250, 10%, 70%)",
  cardBg: "hsl(250, 35%, 12%)",
  cardBg2: "hsl(250, 30%, 18%)",
  muted: "hsl(250, 20%, 25%)",
  black: "#000000",
} as const;

import { loadFont } from "@remotion/google-fonts/PressStart2P";
const { fontFamily: _pressStart } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
export const FONT = _pressStart;

export const SUNSET = `linear-gradient(180deg, ${C.primary} 0%, ${C.secondary} 50%, ${C.accent} 100%)`;
export const CARD_GRAD = `linear-gradient(135deg, ${C.cardBg} 0%, ${C.cardBg2} 100%)`;

export const TYPE_COLORS: Record<string, string> = {
  fire: "#ef4444",
  water: "#3b82f6",
  grass: "#22c55e",
  electric: "#eab308",
  psychic: "#ec4899",
  ghost: "#8b5cf6",
  dragon: "#6366f1",
  normal: "#9ca3af",
  ice: "#22d3ee",
  fighting: "#f97316",
  poison: "#a855f7",
  ground: "#d97706",
  flying: "#7c3aed",
  bug: "#84cc16",
  rock: "#78716c",
  steel: "#94a3b8",
  dark: "#6b7280",
  fairy: "#f472b6",
};

export type Card = {
  id: number;
  name: string;
  type: string;
  cost: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  ability: string | null;
  move: number;
};

export const DECK: Card[] = [
  { id: 6,   name: "CHARIZARD",  type: "fire",     cost: 3, hp: 78,  atk: 84,  def: 78,  spd: 100, ability: "Double Damage", move: 3 },
  { id: 9,   name: "BLASTOISE",  type: "water",    cost: 3, hp: 79,  atk: 83,  def: 100, spd: 78,  ability: "Shield",        move: 2 },
  { id: 3,   name: "VENUSAUR",   type: "grass",    cost: 3, hp: 80,  atk: 82,  def: 83,  spd: 80,  ability: "Regenerate",    move: 2 },
  { id: 25,  name: "PIKACHU",    type: "electric", cost: 1, hp: 35,  atk: 55,  def: 40,  spd: 90,  ability: null,            move: 3 },
  { id: 150, name: "MEWTWO",     type: "psychic",  cost: 3, hp: 106, atk: 110, def: 90,  spd: 130, ability: "Speed Boost",   move: 4 },
  { id: 94,  name: "GENGAR",     type: "ghost",    cost: 2, hp: 60,  atk: 65,  def: 60,  spd: 110, ability: "Stun",          move: 3 },
  { id: 130, name: "GYARADOS",   type: "water",    cost: 2, hp: 95,  atk: 125, def: 79,  spd: 81,  ability: null,            move: 3 },
  { id: 143, name: "SNORLAX",    type: "normal",   cost: 3, hp: 160, atk: 110, def: 65,  spd: 30,  ability: "Regenerate",    move: 1 },
  { id: 65,  name: "ALAKAZAM",   type: "psychic",  cost: 2, hp: 55,  atk: 50,  def: 45,  spd: 120, ability: "Speed Boost",   move: 4 },
  { id: 59,  name: "ARCANINE",   type: "fire",     cost: 2, hp: 90,  atk: 110, def: 80,  spd: 95,  ability: null,            move: 3 },
  { id: 131, name: "LAPRAS",     type: "water",    cost: 2, hp: 130, atk: 85,  def: 80,  spd: 60,  ability: "Shield",        move: 2 },
  { id: 149, name: "DRAGONITE",  type: "dragon",   cost: 3, hp: 91,  atk: 134, def: 95,  spd: 80,  ability: "Double Damage", move: 3 },
];

// Sprite URL from PokeAPI (same source the app uses)
export const SPRITE_URL = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

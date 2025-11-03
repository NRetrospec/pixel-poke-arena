import { useQuery } from "@tanstack/react-query";
import { PokemonCard, CardAbility } from "@/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const KANTO_LIMIT = 151;

const abilities: CardAbility[] = [
  { name: "Double Strike", effect: "double_damage", description: "Deal 2x damage" },
  { name: "Regenerate", effect: "regenerate", description: "Heal 20 HP each turn" },
  { name: "Stun", effect: "stun", description: "Freeze opponent for 1 turn" },
  { name: "Shield", effect: "shield", description: "Reduce damage by 50%" },
  { name: "Speed Boost", effect: "speed_boost", description: "+2 movement points" },
];

const fetchPokemonList = async (): Promise<PokemonCard[]> => {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${KANTO_LIMIT}`);
  const data = await response.json();
  
  const pokemonPromises = data.results.map(async (pokemon: any, index: number) => {
    const detailResponse = await fetch(pokemon.url);
    const details = await detailResponse.json();
    
    const stats = {
      hp: details.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 50,
      attack: details.stats.find((s: any) => s.stat.name === "attack")?.base_stat || 50,
      defense: details.stats.find((s: any) => s.stat.name === "defense")?.base_stat || 50,
      speed: details.stats.find((s: any) => s.stat.name === "speed")?.base_stat || 50,
    };
    
    // Randomly assign cost and movement
    const cost = ([1, 1, 2, 2, 3] as const)[Math.floor(Math.random() * 5)];
    const movementPoints = Math.floor(Math.random() * 3) + 1;
    
    // 30% chance to have special ability
    const ability = Math.random() > 0.7 
      ? abilities[Math.floor(Math.random() * abilities.length)]
      : undefined;
    
    return {
      id: details.id,
      name: details.name,
      sprite: details.sprites.front_default,
      types: details.types.map((t: any) => t.type.name),
      stats,
      ability,
      cost,
      movementPoints,
    };
  });
  
  return Promise.all(pokemonPromises);
};

export const usePokemon = () => {
  return useQuery({
    queryKey: ["pokemon-kanto"],
    queryFn: fetchPokemonList,
    staleTime: Infinity, // Cache forever since Kanto Pokémon won't change
  });
};

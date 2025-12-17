import { PokemonCard as PokemonCardType } from "@/types/pokemon";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sword, Shield, Zap } from "lucide-react";

interface PokemonCardProps {
  pokemon: PokemonCardType;
  selected?: boolean;
  onSelect?: () => void;
}

const PokemonCard = ({ pokemon, selected, onSelect }: PokemonCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 pixel-pattern ${
        selected
          ? "border-primary border-2 scale-110 shadow-glow glow-strong rotate-1"
          : "border-border hover-lift hover:border-accent hover:scale-105 hover:rotate-1 hover:glow-strong"
      } bg-gradient-card`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Cost Badge */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
          {pokemon.cost}
        </div>
        
        {/* Pokémon Image */}
        <div className="w-full aspect-square flex items-center justify-center mb-2 bg-muted/20 rounded">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-32 h-32 object-contain pixelated"
          />
        </div>
        
        {/* Name */}
        <h3 className="text-lg font-bold capitalize mb-2">{pokemon.name}</h3>
        
        {/* Types */}
        <div className="flex gap-1 mb-3">
          {pokemon.types.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <StatItem icon={<Heart className="w-3 h-3" />} label="HP" value={pokemon.stats.hp} />
          <StatItem icon={<Sword className="w-3 h-3" />} label="ATK" value={pokemon.stats.attack} />
          <StatItem icon={<Shield className="w-3 h-3" />} label="DEF" value={pokemon.stats.defense} />
          <StatItem icon={<Zap className="w-3 h-3" />} label="SPD" value={pokemon.stats.speed} />
        </div>
        
        {/* Movement Points */}
        <div className="mt-2 text-xs text-muted-foreground">
          Movement: {pokemon.movementPoints}
        </div>
        
        {/* Ability */}
        {pokemon.ability && (
          <div className="mt-2 p-2 bg-accent/20 rounded text-xs">
            <div className="font-bold text-accent">{pokemon.ability.name}</div>
            <div className="text-muted-foreground">{pokemon.ability.description}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StatItem = ({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
}) => {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
};

export default PokemonCard;

import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PokemonCard as PokemonCardType } from "@/types/pokemon";
import { Heart } from "lucide-react";

const Game = () => {
  const location = useLocation();
  const { deck, mode, difficulty } = location.state || {};
  
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [playerHand, setPlayerHand] = useState<PokemonCardType[]>(
    deck?.cards.slice(0, 5) || []
  );
  const [playerField, setPlayerField] = useState<(PokemonCardType | null)[]>(
    Array(5).fill(null)
  );
  const [opponentField, setOpponentField] = useState<(PokemonCardType | null)[]>(
    Array(5).fill(null)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Game Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-destructive" />
            <span className="text-xl font-bold">Player HP: {playerHP}</span>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">
              {currentTurn === "player" ? "Your Turn" : "Opponent's Turn"}
            </div>
            <div className="text-sm text-muted-foreground">
              {mode === "local" ? `AI (${difficulty})` : "PVP Match"}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Opponent HP: {opponentHP}</span>
            <Heart className="w-6 h-6 text-destructive" />
          </div>
        </div>

        {/* Opponent Field */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Opponent's Field</h3>
          <div className="grid grid-cols-5 gap-4">
            {opponentField.map((card, index) => (
              <FieldSlot key={`opp-${index}`} card={card} />
            ))}
          </div>
        </div>

        {/* Battlefield Center */}
        <div className="my-8 h-32 border-y-2 border-primary/50 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">⚔️</div>
            <div>Battle Zone</div>
          </div>
        </div>

        {/* Player Field */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Your Field</h3>
          <div className="grid grid-cols-5 gap-4">
            {playerField.map((card, index) => (
              <FieldSlot key={`player-${index}`} card={card} />
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Your Hand</h3>
          <div className="flex gap-4 justify-center">
            {playerHand.map((card, index) => (
              <HandCard key={index} card={card} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button size="lg" disabled={currentTurn !== "player"}>
            End Turn
          </Button>
        </div>
      </div>
    </div>
  );
};

const FieldSlot = ({ card }: { card: PokemonCardType | null }) => {
  return (
    <Card className="aspect-[3/4] bg-gradient-card border-border flex items-center justify-center">
      {card ? (
        <div className="text-center p-2">
          <img src={card.sprite} alt={card.name} className="w-20 h-20 mx-auto" />
          <div className="text-sm font-bold capitalize mt-1">{card.name}</div>
          <div className="text-xs text-muted-foreground">HP: {card.stats.hp}</div>
        </div>
      ) : (
        <div className="text-muted-foreground text-4xl">+</div>
      )}
    </Card>
  );
};

const HandCard = ({ card }: { card: PokemonCardType }) => {
  return (
    <Card className="w-32 aspect-[3/4] bg-gradient-card border-border cursor-pointer hover-lift p-2">
      <div className="relative">
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
          {card.cost}
        </div>
        <img src={card.sprite} alt={card.name} className="w-full" />
        <div className="text-xs font-bold capitalize text-center">{card.name}</div>
      </div>
    </Card>
  );
};

export default Game;

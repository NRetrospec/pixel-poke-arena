import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PokemonCard as PokemonCardType } from "@/types/pokemon";
import { Heart } from "lucide-react";

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Game = () => {
  const location = useLocation();
  const { deck, mode, difficulty } = location.state || {};

  const shuffledPlayerDeck = shuffleArray(deck?.cards || []);
  const shuffledOpponentDeck = shuffleArray(deck?.cards || []);

  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [currentTurn, setCurrentTurn] = useState<"player" | "opponent">("player");
  const [playerHand, setPlayerHand] = useState<PokemonCardType[]>(
    shuffledPlayerDeck.slice(0, 5)
  );
  const [opponentHand, setOpponentHand] = useState<PokemonCardType[]>(
    shuffledOpponentDeck.slice(0, 5)
  );
  const [playerDeck, setPlayerDeck] = useState<PokemonCardType[]>(
    shuffledPlayerDeck.slice(5)
  );
  const [opponentDeck, setOpponentDeck] = useState<PokemonCardType[]>(
    shuffledOpponentDeck.slice(5)
  );
  const [battlefield, setBattlefield] = useState<(PokemonCardType | null)[]>(
    Array(40).fill(null)
  );
  const [draggedCard, setDraggedCard] = useState<PokemonCardType | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [currentTurnCost, setCurrentTurnCost] = useState(0);

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

        {/* Battlefield */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Battlefield</h3>
          <div className="grid grid-cols-5 gap-0 bg-muted/20 p-2 rounded-lg">
            {battlefield.map((card, index) => (
              <FieldSlot
                key={index}
                card={card}
                index={index}
                onDrop={(card) => {
                  if (currentTurnCost + card.cost <= 3 && !battlefield[index]) {
                    const newBattlefield = [...battlefield];
                    const cardWithOwner = { ...card, owner: 'player' as const };
                    newBattlefield[index] = cardWithOwner;
                    setBattlefield(newBattlefield);
                    setPlayerHand(prev => prev.filter(c => c !== card));
                    setCurrentTurnCost(prev => prev + card.cost);
                  }
                }}
                canDrop={index >= 35} // Bottom row for player (indices 35-39)
                draggedCard={draggedCard}
                setDraggedCard={setDraggedCard}
                setDraggedIndex={setDraggedIndex}
              />
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Your Hand (Cost Used: {currentTurnCost}/3)</h3>
          <div className="flex gap-4 justify-center">
            {playerHand.map((card, index) => (
              <HandCard key={index} card={card} setDraggedCard={setDraggedCard} canPlay={currentTurnCost + card.cost <= 3} />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            disabled={currentTurn !== "player"}
            onClick={() => {
              const newBattlefield = [...battlefield];
              let newPlayerHP = playerHP;
              let newOpponentHP = opponentHP;

              // Player turn: move player cards up 1 row if possible
              const playerMoves: { from: number; to: number; card: PokemonCardType }[] = [];
              for (let col = 0; col < 5; col++) {
                for (let row = 7; row >= 0; row--) {
                  const index = row * 5 + col;
                  if (newBattlefield[index] && newBattlefield[index].owner === 'player') {
                    const card = newBattlefield[index];
                    if (row === 0) {
                      // Reached opponent's base, attack HP
                      newOpponentHP -= card.stats.attack;
                      newBattlefield[index] = null;
                    } else {
                      const nextIndex = (row - 1) * 5 + col;
                      if (!newBattlefield[nextIndex]) {
                        // Move up
                        playerMoves.push({ from: index, to: nextIndex, card });
                      } else if (newBattlefield[nextIndex].owner === 'opponent') {
                        // Combat: both attack each other
                        const playerResult = calculateBattleDamage(card, newBattlefield[nextIndex]);
                        const opponentResult = calculateBattleDamage(newBattlefield[nextIndex], card);
                        if (playerResult.defeated) {
                          newBattlefield[index] = null;
                        } else {
                          card.stats.hp = playerResult.defenderRemainingHP;
                        }
                        if (opponentResult.defeated) {
                          newBattlefield[nextIndex] = card;
                          newBattlefield[index] = null;
                        } else {
                          newBattlefield[nextIndex].stats.hp = opponentResult.defenderRemainingHP;
                        }
                      }
                      // If blocked by own card or other, stay
                    }
                  }
                }
              }
              // Apply player moves
              for (const move of playerMoves) {
                newBattlefield[move.to] = move.card;
                newBattlefield[move.from] = null;
              }

              setPlayerHP(newPlayerHP);
              setOpponentHP(newOpponentHP);
              setBattlefield(newBattlefield);
              setCurrentTurnCost(0); // Reset cost for next turn

              // Draw card if hand has less than 10 cards
              if (playerHand.length < 10 && playerDeck.length > 0) {
                const drawnCard = playerDeck[0];
                setPlayerHand(prev => [...prev, drawnCard]);
                setPlayerDeck(prev => prev.slice(1));
              }

              setCurrentTurn("opponent");

              // AI Turn
              setTimeout(() => {
                const battlefieldAfterShift = [...newBattlefield];
                let aiPlayerHP = newPlayerHP;
                let aiOpponentHP = newOpponentHP;

                // AI: move opponent cards down 1 row if possible
                const aiMoves: { from: number; to: number; card: PokemonCardType }[] = [];
                for (let col = 0; col < 5; col++) {
                  for (let row = 0; row <= 7; row++) {
                    const index = row * 5 + col;
                    if (battlefieldAfterShift[index] && battlefieldAfterShift[index].owner === 'opponent') {
                      const card = battlefieldAfterShift[index];
                      if (row === 7) {
                        // Reached player's base, attack HP
                        aiPlayerHP -= card.stats.attack;
                        battlefieldAfterShift[index] = null;
                      } else {
                        const nextIndex = (row + 1) * 5 + col;
                        if (!battlefieldAfterShift[nextIndex]) {
                          // Move down
                          aiMoves.push({ from: index, to: nextIndex, card });
                        } else if (battlefieldAfterShift[nextIndex].owner === 'player') {
                          // Combat: both attack each other
                          const opponentResult = calculateBattleDamage(card, battlefieldAfterShift[nextIndex]);
                          const playerResult = calculateBattleDamage(battlefieldAfterShift[nextIndex], card);
                          if (opponentResult.defeated) {
                            battlefieldAfterShift[index] = null;
                          } else {
                            card.stats.hp = opponentResult.defenderRemainingHP;
                          }
                          if (playerResult.defeated) {
                            battlefieldAfterShift[nextIndex] = card;
                            battlefieldAfterShift[index] = null;
                          } else {
                            battlefieldAfterShift[nextIndex].stats.hp = playerResult.defenderRemainingHP;
                          }
                        }
                        // If blocked by own card or other, stay
                      }
                    }
                  }
                }
                // Apply AI moves
                for (const move of aiMoves) {
                  battlefieldAfterShift[move.to] = move.card;
                  battlefieldAfterShift[move.from] = null;
                }

                setPlayerHP(aiPlayerHP);
                setOpponentHP(aiOpponentHP);
                setBattlefield(battlefieldAfterShift);

                // Draw card for AI if hand has less than 10 cards
                if (opponentHand.length < 10 && opponentDeck.length > 0) {
                  const drawnCard = opponentDeck[0];
                  setOpponentHand(prev => [...prev, drawnCard]);
                  setOpponentDeck(prev => prev.slice(1));
                }

                if (opponentHand.length > 0 && mode === "local") {
                  const randomCard = opponentHand[Math.floor(Math.random() * opponentHand.length)];
                  const availableSlots = [0, 1, 2, 3, 4]; // Top row for opponent
                  const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
                  const newBattlefieldAI = [...battlefieldAfterShift];
                  const cardWithOwner = { ...randomCard, owner: 'opponent' as const };
                  newBattlefieldAI[randomSlot] = cardWithOwner;
                  setBattlefield(newBattlefieldAI);
                  setOpponentHand(prev => prev.filter(c => c !== randomCard));
                }
                setCurrentTurn("player");
              }, 1000);
            }}
          >
            End Turn
          </Button>
        </div>
      </div>
    </div>
  );
};

const getTypeGlow = (types: string[]) => {
  const primaryType = types[0]?.toLowerCase();
  switch (primaryType) {
    case 'fire': return 'hover:shadow-red-500/50';
    case 'water': return 'hover:shadow-blue-500/50';
    case 'electric': return 'hover:shadow-yellow-500/50';
    case 'grass': return 'hover:shadow-green-500/50';
    case 'poison': return 'hover:shadow-purple-500/50';
    case 'psychic': return 'hover:shadow-pink-500/50';
    case 'ice': return 'hover:shadow-cyan-500/50';
    case 'dragon': return 'hover:shadow-indigo-500/50';
    case 'dark': return 'hover:shadow-gray-500/50';
    case 'fairy': return 'hover:shadow-rose-500/50';
    case 'fighting': return 'hover:shadow-orange-500/50';
    case 'ground': return 'hover:shadow-amber-500/50';
    case 'flying': return 'hover:shadow-sky-500/50';
    case 'bug': return 'hover:shadow-lime-500/50';
    case 'rock': return 'hover:shadow-stone-500/50';
    case 'ghost': return 'hover:shadow-violet-500/50';
    case 'steel': return 'hover:shadow-slate-500/50';
    case 'normal': return 'hover:shadow-neutral-500/50';
    default: return 'hover:shadow-blue-500/50';
  }
};

const getTypeMultiplier = (attackerType: string, defenderType: string): number => {
  // Placeholder: implement type effectiveness later
  return 1.0;
};

const calculateBattleDamage = (attacker: PokemonCardType, defender: PokemonCardType) => {
  // Base damage reduction: defense as percentage, capped at 90%
  const defenseReduction = Math.min(defender.stats.defense / 100, 0.9);
  const effectiveDamage = attacker.stats.attack * (1 - defenseReduction);

  // Random variance: ±5% (0.95 to 1.05)
  const variance = Math.random() * 0.1 + 0.95;

  // Type multiplier (placeholder)
  const typeMultiplier = getTypeMultiplier(attacker.types[0] || '', defender.types[0] || '');

  // Final damage
  const finalDamage = Math.max(1, Math.floor(effectiveDamage * variance * typeMultiplier));

  // Apply damage
  const newHP = Math.max(0, defender.stats.hp - finalDamage);
  const defeated = newHP <= 0;

  return {
    attacker: attacker.name,
    defender: defender.name,
    damage: finalDamage,
    defenderRemainingHP: newHP,
    defeated
  };
};

const FieldSlot = ({
  card,
  index,
  onDrop,
  canDrop,
  draggedCard,
  setDraggedCard,
  setDraggedIndex
}: {
  card: PokemonCardType | null;
  index: number;
  onDrop: (card: PokemonCardType) => void;
  canDrop: boolean;
  draggedCard: PokemonCardType | null;
  setDraggedCard: (card: PokemonCardType | null) => void;
  setDraggedIndex: (index: number | null) => void;
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (canDrop && draggedCard) {
      onDrop(draggedCard);
      setDraggedCard(null);
      setDraggedIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const glowClass = card ? getTypeGlow(card.types) : 'hover:shadow-blue-500/50';

  const slotContent = (
    <Card
      className={`w-20 h-24 bg-gradient-card border-border flex items-center justify-center cursor-pointer hover-lift hover:shadow-lg ${glowClass} transition-shadow`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {card ? (
        <div className="text-center p-1">
          <img src={card.sprite} alt={card.name} className="w-12 h-12 mx-auto" />
          <div className="text-xs font-bold capitalize mt-1">{card.name}</div>
          <div className="text-xs text-muted-foreground">HP: {card.stats.hp}</div>
        </div>
      ) : (
        <div className="text-muted-foreground text-2xl">+</div>
      )}
    </Card>
  );

  if (card) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {slotContent}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-bold capitalize">{card.name}</div>
            <div>HP: {card.stats.hp}</div>
            <div>Attack: {card.stats.attack}</div>
            <div>Defense: {card.stats.defense}</div>
            <div>Speed: {card.stats.speed}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return slotContent;
};

const HandCard = ({
  card,
  setDraggedCard,
  canPlay
}: {
  card: PokemonCardType;
  setDraggedCard: (card: PokemonCardType | null) => void;
  canPlay: boolean;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    setDraggedCard(card);
  };

  const glowClass = getTypeGlow(card.types);

  const cardContent = (
    <Card
      className={`w-32 aspect-[3/4] bg-gradient-card border-border cursor-pointer hover-lift hover:shadow-lg ${glowClass} transition-shadow p-2 ${canPlay ? '' : 'opacity-50 cursor-not-allowed'}`}
      draggable={canPlay}
      onDragStart={canPlay ? handleDragStart : undefined}
    >
      <div className="relative">
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
          {card.cost}
        </div>
        <img src={card.sprite} alt={card.name} className="w-full" />
        <div className="text-xs font-bold capitalize text-center">{card.name}</div>
      </div>
    </Card>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {cardContent}
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <div className="font-bold capitalize">{card.name}</div>
          <div>HP: {card.stats.hp}</div>
          <div>Attack: {card.stats.attack}</div>
          <div>Defense: {card.stats.defense}</div>
          <div>Speed: {card.stats.speed}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default Game;

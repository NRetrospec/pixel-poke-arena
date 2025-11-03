import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PokemonCard from "@/components/PokemonCard";
import { usePokemon } from "@/hooks/usePokemon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PokemonCard as PokemonCardType, Deck } from "@/types/pokemon";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const DECK_SIZE = 35;

const DeckBuilder = () => {
  const navigate = useNavigate();
  const { data: allPokemon, isLoading } = usePokemon();
  const [selectedCards, setSelectedCards] = useState<PokemonCardType[]>([]);
  const [deckName, setDeckName] = useState("My Deck");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPokemon = allPokemon?.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCard = (pokemon: PokemonCardType) => {
    if (selectedCards.find((card) => card.id === pokemon.id)) {
      setSelectedCards(selectedCards.filter((card) => card.id !== pokemon.id));
    } else if (selectedCards.length < DECK_SIZE) {
      setSelectedCards([...selectedCards, pokemon]);
    } else {
      toast.error(`Deck is full! Maximum ${DECK_SIZE} cards.`);
    }
  };

  const saveDeck = () => {
    if (selectedCards.length !== DECK_SIZE) {
      toast.error(`Deck must have exactly ${DECK_SIZE} cards!`);
      return;
    }

    const deck: Deck = {
      id: Date.now().toString(),
      name: deckName,
      cards: selectedCards,
    };

    // Save to localStorage
    const savedDecks = JSON.parse(localStorage.getItem("decks") || "[]");
    savedDecks.push(deck);
    localStorage.setItem("decks", JSON.stringify(savedDecks));
    
    toast.success("Deck saved successfully!");
    navigate("/play");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">Deck Builder</h1>
          <p className="text-muted-foreground text-lg">
            Select {DECK_SIZE} Pokémon for your deck ({selectedCards.length}/{DECK_SIZE})
          </p>
        </div>

        {/* Deck Controls */}
        <div className="mb-8 flex gap-4 flex-wrap items-center">
          <Input
            placeholder="Deck name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Search Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={saveDeck}
            disabled={selectedCards.length !== DECK_SIZE}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Deck
          </Button>
        </div>

        {/* Pokémon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPokemon?.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              selected={!!selectedCards.find((card) => card.id === pokemon.id)}
              onSelect={() => toggleCard(pokemon)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;

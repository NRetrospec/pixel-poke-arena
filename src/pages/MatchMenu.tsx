import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Deck } from "@/types/pokemon";
import { Bot, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MatchMenu = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const savedDecks = JSON.parse(localStorage.getItem("decks") || "[]");
    setDecks(savedDecks);
    if (savedDecks.length > 0) {
      setSelectedDeck(savedDecks[0]);
    }
  }, []);

  const startLocalMatch = (difficulty: "easy" | "hard") => {
    if (!selectedDeck) {
      toast.error("Please select a deck first!");
      return;
    }
    toast.success(`Starting ${difficulty} AI match...`);
    navigate("/game", { state: { mode: "local", difficulty, deck: selectedDeck } });
  };

  const startPVPMatch = () => {
    if (!selectedDeck) {
      toast.error("Please select a deck first!");
      return;
    }
    toast.info("PVP feature coming soon!");
    // Future: navigate to lobby/matchmaking
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-5xl font-bold mb-8 text-center">Choose Your Battle</h1>

        {/* Deck Selection */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-4">Select Your Deck</h2>
          {decks.length === 0 ? (
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No decks available</p>
                <Button onClick={() => navigate("/decks")} variant="outline">
                  Build a Deck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {decks.map((deck) => (
                <Card
                  key={deck.id}
                  className={`cursor-pointer transition-all ${
                    selectedDeck?.id === deck.id
                      ? "border-primary border-2 shadow-glow"
                      : "border-border hover:border-accent"
                  } bg-gradient-card`}
                  onClick={() => setSelectedDeck(deck)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{deck.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deck.cards.length} cards
                        </p>
                      </div>
                      <div className="flex -space-x-2">
                        {deck.cards.slice(0, 5).map((card, i) => (
                          <img
                            key={i}
                            src={card.sprite}
                            alt={card.name}
                            className="w-12 h-12 rounded-full border-2 border-background"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Match Type Selection */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Local AI Match */}
          <Card className="bg-gradient-card border-border hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Bot className="w-6 h-6 text-primary" />
                Local AI Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Practice against AI opponents at your chosen difficulty level
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => startLocalMatch("easy")}
                  disabled={!selectedDeck}
                  className="w-full"
                  variant="outline"
                >
                  Easy Mode
                </Button>
                <Button
                  onClick={() => startLocalMatch("hard")}
                  disabled={!selectedDeck}
                  className="w-full"
                >
                  Hard Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PVP Match */}
          <Card className="bg-gradient-card border-border hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-secondary" />
                PVP Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Challenge real players worldwide in real-time battles
              </p>
              <Button
                onClick={startPVPMatch}
                disabled={!selectedDeck}
                className="w-full bg-secondary hover:bg-secondary/90"
              >
                Find Opponent
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Coming soon: Lobby system and matchmaking
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchMenu;

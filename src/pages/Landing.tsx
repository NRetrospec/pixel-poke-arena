import { Link } from "react-router-dom";
import { Sparkles, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-sunset.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="relative z-10 text-center px-4 animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow">
            PokéBattle Arena
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground/90 max-w-2xl mx-auto">
            Build your ultimate deck and battle in pixel-perfect card combat
          </p>
          
          <Link to="/decks">
            <Button 
              size="lg"
              className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 shadow-glow animate-pulse-glow"
            >
              Start Battle
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Game Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-12 h-12" />}
              title="Deck Builder"
              description="Choose from 151 Kanto Pokémon to create your perfect deck"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              title="PVP Battles"
              description="Challenge players worldwide in real-time multiplayer matches"
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12" />}
              title="AI Opponents"
              description="Practice against AI with Easy and Hard difficulty modes"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="p-8 bg-gradient-card border border-border rounded-lg hover-lift shadow-card">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;

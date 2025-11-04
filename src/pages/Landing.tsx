import { Link } from "react-router-dom";
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


    </div>
  );
};



export default Landing;

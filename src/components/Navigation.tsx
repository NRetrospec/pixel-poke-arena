import { Link, useLocation } from "react-router-dom";
import { Swords } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Home" },
    { to: "/rules", label: "Rules" },
    { to: "/decks", label: "Decks" },
    { to: "/play", label: "Play" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover-lift">
          <Swords className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground">PokéBattle Arena</span>
        </Link>
        
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

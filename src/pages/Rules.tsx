import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Rules = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-5xl font-bold mb-8 text-center">Game Rules</h1>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <RuleCard
            title="Setup"
            rules={[
              "Each player builds a deck of 35 Pokémon cards",
              "Draw 5 cards at the start of the match",
              "The battlefield has 10 slots total (5 per player)",
            ]}
          />
          
          <RuleCard
            title="Card Points System"
            rules={[
              "Each card is labeled 1, 2, or 3 points",
              "Players can play cards totaling 3 points per turn",
              "Example: One 3-point card, or 1+2, or three 1-point cards",
            ]}
          />
          
          <RuleCard
            title="Turn Phases"
            rules={[
              "Play Phase: Deploy cards to the battlefield",
              "Movement Phase: Cards advance based on movement points",
              "Battle Phase: Cards that meet engage in combat",
              "Attack vs Defense with special abilities applied",
            ]}
          />
          
          <RuleCard
            title="Combat"
            rules={[
              "When cards face off, compare Attack vs Defense",
              "Special abilities can modify combat outcomes",
              "Examples: Double Damage, Regenerate, Stun",
              "Defeated cards are removed from the battlefield",
            ]}
          />
          
          <RuleCard
            title="Victory Conditions"
            rules={[
              "Defeat all opponent's cards on the field",
              "Reduce opponent's HP to zero",
              "Opponent cannot play any more cards",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const RuleCard = ({ title, rules }: { title: string; rules: string[] }) => {
  return (
    <Card className="bg-gradient-card border-border hover-lift">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {rules.map((rule, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-secondary font-bold">•</span>
              <span className="text-foreground/90">{rule}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Rules;

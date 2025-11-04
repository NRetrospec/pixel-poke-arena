# Pixel Poke Arena 🏆

Welcome to **Pixel Poke Arena**, an exciting turn-based strategy game where Pokemon battle across a dynamic 8x5 battlefield! Command your Pokemon army in epic clashes against AI opponents or human players in this pixel-perfect tactical experience.

## 🎮 Game Features

### Strategic Battlefield Combat
- **40-Slot Battlefield**: An 8-row by 5-column grid where Pokemon advance towards enemy lines
- **Drag & Drop Deployment**: Easily place your Pokemon from hand to the battlefield with intuitive drag-and-drop controls
- **Turn-Based Movement**: Pokemon automatically advance 1 row per turn towards the opponent
- **Epic Confrontations**: When opposing Pokemon meet, they engage in intense battles where both deal damage simultaneously

### Pokemon Management
- **Deck Building**: Create custom decks with your favorite Pokemon
- **Cost System**: Each Pokemon has a cost (1-3 points), with a 3-point limit per turn
- **Type-Based Visual Effects**: Pokemon glow with colors representing their types (Fire red, Water blue, etc.)
- **Detailed Stats**: HP, Attack, Defense, Speed, and Movement stats for strategic depth

### Combat System
- **Mutual Damage**: When Pokemon collide, both attackers deal damage based on their attack stats
- **Defense Calculations**: Damage is reduced by the defender's defense (capped at 90% reduction)
- **Type Multipliers**: Strategic type advantages (placeholder for future implementation)
- **HP-Based Survival**: Pokemon with depleted HP are removed from the battlefield
- **Base Attacks**: Pokemon that reach the opponent's base deal direct damage to HP

### Game Modes
- **Local AI Battles**: Challenge computer opponents with varying difficulty levels
- **PVP Potential**: Framework ready for player-vs-player matches
- **Match Menu**: Choose your deck and battle settings before entering combat

## 🚀 How to Play

1. **Build Your Deck**: Visit the Deck Builder to assemble your Pokemon team
2. **Choose Your Match**: Select AI difficulty or prepare for PVP battles
3. **Deploy Strategically**: Drag Pokemon from your hand to the bottom row of the battlefield
4. **Advance & Attack**: End your turn to move Pokemon forward and trigger battles
5. **Outlast Your Opponent**: Reduce the enemy's HP to 0 to claim victory!

## 🛠️ Technical Stack

Built with modern web technologies:
- **React** with TypeScript for robust component architecture
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for responsive, pixel-perfect styling
- **shadcn/ui** for beautiful, accessible UI components
- **React Router** for seamless navigation

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd pixel-poke-arena

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:8081` to start battling!

## 🎯 Game Rules

- **Turn Structure**: Play cards → End turn → Movement & Combat → Opponent's turn
- **Movement**: Pokemon advance 1 row per turn towards the opponent
- **Combat**: Simultaneous damage when Pokemon occupy the same space
- **Victory**: Reduce opponent's HP to 0 or eliminate all their Pokemon
- **Cost Limit**: Maximum 3 cost points per turn for card deployment

## 🌟 Features in Development

- Enhanced type effectiveness system
- Special abilities and effects
- Multiplayer online battles
- Tournament mode
- Custom Pokemon creation

## 📝 Contributing

We welcome contributions! Whether it's bug fixes, new features, or improvements to the game mechanics, feel free to submit pull requests or open issues.

## 🎨 Design Philosophy

Pixel Poke Arena combines the strategic depth of classic turn-based tactics with the charm of Pokemon in a clean, modern interface. Every decision matters as you position your Pokemon for maximum impact on the battlefield.

---

**Ready to command your Pokemon army? Let the battles begin! ⚔️**

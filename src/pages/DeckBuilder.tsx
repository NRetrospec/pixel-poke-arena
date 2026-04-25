import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import PokemonCard from '@/components/PokemonCard';
import { usePokemon } from '@/hooks/usePokemon';
import { PokemonCard as PokemonCardType, Deck } from '@/types/pokemon';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { toast } from 'sonner';
import { Loader2, Save, ArrowRight, Search, X } from 'lucide-react';

const DECK_SIZE = 35;

const DeckBuilder = () => {
  const navigate = useNavigate();
  const { data: allPokemon, isLoading } = usePokemon();
  const [selectedCards, setSelectedCards] = useState<PokemonCardType[]>([]);
  const [deckName, setDeckName] = useState('My Deck');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPokemon = allPokemon?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCard = (pokemon: PokemonCardType) => {
    if (selectedCards.find((c) => c.id === pokemon.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== pokemon.id));
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
    const deck: Deck = { id: Date.now().toString(), name: deckName, cards: selectedCards };
    const saved = JSON.parse(localStorage.getItem('decks') || '[]');
    saved.push(deck);
    localStorage.setItem('decks', JSON.stringify(saved));
    toast.success('Deck saved!');
    navigate('/play');
  };

  const progress = Math.round((selectedCards.length / DECK_SIZE) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#a855f7' }} />
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.6rem', color: '#94a3b8' }}>
            Loading Pokémon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      <Navigation />

      <div className="relative z-10 container mx-auto px-3 pt-20 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="mb-2"
            style={{ fontFamily: 'var(--font-pixel)', fontSize: 'clamp(0.8rem, 3vw, 1.4rem)', color: '#e2e8f0' }}
          >
            <span style={{ color: '#a855f7' }}>DECK</span>{' '}
            <span style={{ color: '#6366f1' }}>BUILDER</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: '#64748b' }}>
            Select {DECK_SIZE} Pokémon for your deck
          </p>
        </div>

        {/* Controls bar */}
        <div
          className="mb-6 p-3 rounded-lg flex flex-wrap gap-3 items-center"
          style={{
            background: 'rgba(8,8,22,0.85)',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 20px rgba(99,102,241,0.1)',
          }}
        >
          {/* Deck name */}
          <input
            className="bg-transparent outline-none border rounded px-3 py-1.5 text-sm"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.55rem',
              color: '#e2e8f0',
              border: '1px solid rgba(99,102,241,0.4)',
              minWidth: 120,
            }}
            placeholder="Deck name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
          />

          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              className="w-full bg-transparent outline-none border rounded pl-7 pr-6 py-1.5"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.55rem',
                color: '#e2e8f0',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchTerm('')}>
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-1 min-w-[100px]">
            <div className="flex justify-between items-center">
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#64748b' }}>
                {selectedCards.length}/{DECK_SIZE}
              </span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: progress === 100 ? '#22c55e' : '#a855f7' }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: progress === 100
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #6366f1, #a855f7)',
                  boxShadow: `0 0 6px ${progress === 100 ? '#22c55e' : '#a855f7'}`,
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={saveDeck}
            disabled={selectedCards.length !== DECK_SIZE}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.5rem',
              background: selectedCards.length === DECK_SIZE
                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                : 'rgba(99,102,241,0.15)',
              color: selectedCards.length === DECK_SIZE ? '#fff' : '#475569',
              border: `1px solid ${selectedCards.length === DECK_SIZE ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
              boxShadow: selectedCards.length === DECK_SIZE ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
              cursor: selectedCards.length !== DECK_SIZE ? 'not-allowed' : 'pointer',
            }}
          >
            <Save className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={() => navigate('/play')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.5rem',
              background: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <ArrowRight className="w-3 h-3" />
            My Decks
          </button>
        </div>

        {/* Selected strip (mobile shortcut) */}
        {selectedCards.length > 0 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#64748b', flexShrink: 0 }}>
              SELECTED:
            </span>
            {selectedCards.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCard(c)}
                className="flex-shrink-0 w-8 h-8 rounded overflow-hidden relative"
                style={{ border: `1px solid rgba(99,102,241,0.5)` }}
                title={c.name}
              >
                <img src={c.sprite} alt={c.name} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-red-500/60">
                  <X className="w-3 h-3 text-white" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pokemon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredPokemon?.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              selected={!!selectedCards.find((c) => c.id === pokemon.id)}
              onSelect={() => toggleCard(pokemon)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;

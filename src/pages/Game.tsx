import { useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { PokemonCard as PokemonCardType, AnimState } from '@/types/pokemon';
import { PokemonSprite } from '@/components/PokemonSprite';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { FaceOffOverlay, FaceoffData } from '@/components/FaceOffOverlay';
import { getTypeColor } from '@/lib/typeColors';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── helpers ───────────────────────────────────────────────────────────────────

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const calculateBattleDamage = (attacker: PokemonCardType, defender: PokemonCardType) => {
  const defReduction = Math.min(defender.stats.defense / 100, 0.9);
  const variance = Math.random() * 0.1 + 0.95;
  const damage = Math.max(1, Math.floor(attacker.stats.attack * (1 - defReduction) * variance));
  const newHP = Math.max(0, defender.stats.hp - damage);
  return { damage, defenderRemainingHP: newHP, defeated: newHP <= 0 };
};

// ─── Game ──────────────────────────────────────────────────────────────────────

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { deck, mode, difficulty } = location.state || {};
  const isMobile = useIsMobile();

  const shuffledPlayer = shuffleArray(deck?.cards || []);
  const shuffledOpponent = shuffleArray(deck?.cards || []);

  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [playerHand, setPlayerHand] = useState<PokemonCardType[]>(shuffledPlayer.slice(0, 5));
  const [opponentHand, setOpponentHand] = useState<PokemonCardType[]>(shuffledOpponent.slice(0, 5));
  const [playerDeck, setPlayerDeck] = useState<PokemonCardType[]>(shuffledPlayer.slice(5));
  const [opponentDeck, setOpponentDeck] = useState<PokemonCardType[]>(shuffledOpponent.slice(5));
  const [battlefield, setBattlefield] = useState<(PokemonCardType | null)[]>(Array(40).fill(null));
  const [draggedCard, setDraggedCard] = useState<PokemonCardType | null>(null);
  const [currentTurnCost, setCurrentTurnCost] = useState(0);
  const [animStates, setAnimStates] = useState<Record<number, AnimState>>({});

  // Mobile: tap-to-place
  const [selectedHandCard, setSelectedHandCard] = useState<PokemonCardType | null>(null);

  // Faceoff queue
  const [faceoffQueue, setFaceoffQueue] = useState<FaceoffData[]>([]);
  const [currentFaceoff, setCurrentFaceoff] = useState<FaceoffData | null>(null);
  const faceoffPendingRef = useRef(false);

  // HP tracking for bars
  const [slotMaxHP, setSlotMaxHP] = useState<Record<number, number>>({});

  // Placement order (lower = placed earlier = attacks first)
  const [placedAt, setPlacedAt] = useState<(number | null)[]>(Array(40).fill(null));
  const placementCounter = useRef(0);

  // Damage popups
  const [popups, setPopups] = useState<{ id: number; index: number; text: string }[]>([]);
  const popupId = useRef(0);

  // Game over
  const [gameOver, setGameOver] = useState<'victory' | 'defeat' | null>(null);

  const showPopup = useCallback((index: number, text: string) => {
    const id = ++popupId.current;
    setPopups((prev) => [...prev, { id, index, text }]);
    setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== id)), 1200);
  }, []);

  const placeCard = useCallback(
    (card: PokemonCardType, slotIndex: number) => {
      if (currentTurnCost + card.cost > 3) return;
      if (battlefield[slotIndex]) return;
      if (slotIndex < 35) return; // only bottom row for player

      const newBf = [...battlefield];
      const newMaxHP = { ...slotMaxHP };
      const newPlacedAt = [...placedAt];
      newBf[slotIndex] = { ...card, owner: 'player' };
      newMaxHP[slotIndex] = card.stats.hp;
      newPlacedAt[slotIndex] = ++placementCounter.current;

      setBattlefield(newBf);
      setSlotMaxHP(newMaxHP);
      setPlacedAt(newPlacedAt);
      setPlayerHand((prev) => prev.filter((c) => c !== card));
      setCurrentTurnCost((prev) => prev + card.cost);
      setSelectedHandCard(null);
    },
    [battlefield, currentTurnCost, slotMaxHP, placedAt]
  );

  const advanceFaceoffQueue = useCallback(
    (queue: FaceoffData[], bf: (PokemonCardType | null)[], php: number, ohp: number) => {
      if (queue.length === 0) {
        faceoffPendingRef.current = false;
        setBattlefield(bf);
        setPlayerHP(php);
        setOpponentHP(ohp);
        if (php <= 0) setGameOver('defeat');
        if (ohp <= 0) setGameOver('victory');
        return;
      }
      const [next, ...rest] = queue;
      setCurrentFaceoff(next);
      setFaceoffQueue(rest);
    },
    []
  );

  const handleFaceoffComplete = useCallback(() => {
    setCurrentFaceoff(null);
    // next faceoff will be triggered by the queue effect in JSX
  }, []);

  // ── End Turn ──────────────────────────────────────────────────────────────────
  //
  // Rule: only the ACTIVE side's Pokemon move each half-turn.
  // When a moving Pokemon runs into an enemy, BOTH engage simultaneously
  // (mutual damage). Actions resolve in placement-order (oldest card first).
  //
  const endTurn = useCallback(() => {
    if (currentTurn !== 'player') return;

    const bf = [...battlefield];
    let php = playerHP;
    let ohp = opponentHP;
    const anim: Record<number, AnimState> = {};
    const newPlacedAt = [...placedAt];
    const newMaxHP = { ...slotMaxHP };
    const faceoffs: FaceoffData[] = [];

    // Generic action-queue resolver used for both halves of the turn.
    // `moverOwner` is the side whose cards move this half.
    // `dir` is -1 for player (moves up) or +1 for opponent (moves down).
    // `baseHP` / `setBaseHP` are the HP targets hit when a card reaches the far edge.
    type TurnAction =
      | { kind: 'atkHP'; idx: number; order: number }
      | { kind: 'move'; idx: number; to: number; order: number }
      | { kind: 'fight'; idx: number; vs: number; order: number };

    const resolveHalfTurn = (
      moverOwner: 'player' | 'opponent',
      dir: -1 | 1,
      getEdgeHP: () => number,
      setEdgeHP: (v: number) => void,
    ) => {
      const actions: TurnAction[] = [];
      const edgeRow = dir === -1 ? 0 : 7;

      for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= 7; row++) {
          const idx = row * 5 + col;
          const card = bf[idx];
          if (!card || card.owner !== moverOwner) continue;
          const order = newPlacedAt[idx] ?? 9999;

          if (row === edgeRow) {
            // Reached the far edge — hits the enemy player's HP
            actions.push({ kind: 'atkHP', idx, order });
          } else {
            const target = (row + dir) * 5 + col;
            if (!bf[target]) {
              actions.push({ kind: 'move', idx, to: target, order });
            } else if (bf[target]?.owner !== moverOwner) {
              actions.push({ kind: 'fight', idx, vs: target, order });
            }
            // blocked by own card → stays put, no action needed
          }
        }
      }

      // Oldest-placed card acts first
      actions.sort((a, b) => a.order - b.order);

      for (const action of actions) {
        const mover = bf[action.idx];
        if (!mover) continue; // eliminated earlier this half-turn

        if (action.kind === 'atkHP') {
          setEdgeHP(getEdgeHP() - mover.stats.attack);
          showPopup(action.idx, `-${mover.stats.attack}`);
          bf[action.idx] = null;
          newPlacedAt[action.idx] = null;
          delete newMaxHP[action.idx];

        } else if (action.kind === 'move') {
          if (bf[action.to]) continue; // destination filled by an earlier action
          bf[action.to] = mover;
          bf[action.idx] = null;
          newPlacedAt[action.to] = newPlacedAt[action.idx];
          newPlacedAt[action.idx] = null;
          newMaxHP[action.to] = newMaxHP[action.idx];
          delete newMaxHP[action.idx];
          anim[action.to] = 'move';

        } else {
          // fight — BOTH cards engage simultaneously
          const defender = bf[action.vs];
          if (!defender) continue;

          const moverAtks = calculateBattleDamage(mover, defender);   // mover → defender
          const defAtks   = calculateBattleDamage(defender, mover);   // defender → mover

          const moverSurvives   = !defAtks.defeated;
          const defenderSurvives = !moverAtks.defeated;
          const moverNew   = moverSurvives   ? { ...mover,   stats: { ...mover.stats,   hp: defAtks.defenderRemainingHP   } } : null;
          const defenderNew = defenderSurvives ? { ...defender, stats: { ...defender.stats, hp: moverAtks.defenderRemainingHP } } : null;

          // Build faceoff display (always frame as player vs opponent for the overlay)
          const isPlayerMover = moverOwner === 'player';
          faceoffs.push({
            playerCard:      isPlayerMover ? { ...mover }   : { ...defender },
            opponentCard:    isPlayerMover ? { ...defender } : { ...mover },
            playerDamage:    isPlayerMover ? defAtks.damage   : moverAtks.damage,
            opponentDamage:  isPlayerMover ? moverAtks.damage : defAtks.damage,
            playerDefeated:  isPlayerMover ? !moverSurvives   : !defenderSurvives,
            opponentDefeated: isPlayerMover ? !defenderSurvives : !moverSurvives,
            abilityTrigger:  mover.ability?.effect === 'double_damage' ? 'DOUBLE STRIKE!' : undefined,
          });

          // Clear both positions first
          bf[action.idx] = null;
          bf[action.vs]  = null;

          if (defenderSurvives) {
            // Defender lives → stays in its slot; mover either survives (blocked) or is removed
            bf[action.vs] = defenderNew;
            if (moverSurvives) {
              bf[action.idx] = moverNew; // both survive, mover stays
            } else {
              newPlacedAt[action.idx] = null;
              delete newMaxHP[action.idx];
            }
          } else {
            // Defender defeated → clear its slot
            delete newMaxHP[action.vs];
            newPlacedAt[action.vs] = null;
            if (moverSurvives && moverNew) {
              // Mover advances into the now-empty slot
              bf[action.vs] = moverNew;
              newPlacedAt[action.vs] = newPlacedAt[action.idx];
              newMaxHP[action.vs] = newMaxHP[action.idx];
            }
            newPlacedAt[action.idx] = null;
            delete newMaxHP[action.idx];
          }

          anim[action.idx] = moverSurvives   ? 'attack' : 'faint';
          anim[action.vs]  = defenderSurvives ? 'hit'    : 'faint';
        }
      }
    };

    // ── Player half-turn (player cards move up) ────────────────────────────
    resolveHalfTurn('player', -1, () => ohp, (v) => { ohp = v; });

    setAnimStates(anim);
    setPlacedAt(newPlacedAt);
    setSlotMaxHP(newMaxHP);
    setCurrentTurnCost(0);

    if (playerHand.length < 10 && playerDeck.length > 0) {
      setPlayerHand((prev) => [...prev, playerDeck[0]]);
      setPlayerDeck((prev) => prev.slice(1));
    }

    setCurrentTurn('opponent');

    // ── Opponent half-turn (opponent cards move down), after a short pause ──
    setTimeout(() => {
      const bfAI = bf; // already a working copy from above
      let phpAI = php;
      let ohpAI = ohp;
      const animAI: Record<number, AnimState> = {};
      const newPlacedAtAI = newPlacedAt;
      const newMaxHPAI = newMaxHP;

      // Re-point the resolver to the AI's copy (same object, just aliased)
      const resolveAI = (
        moverOwner: 'player' | 'opponent',
        dir: -1 | 1,
        getEdgeHP: () => number,
        setEdgeHP: (v: number) => void,
      ) => {
        type TurnActionAI =
          | { kind: 'atkHP'; idx: number; order: number }
          | { kind: 'move'; idx: number; to: number; order: number }
          | { kind: 'fight'; idx: number; vs: number; order: number };

        const actionsAI: TurnActionAI[] = [];
        const edgeRow = dir === -1 ? 0 : 7;

        for (let col = 0; col < 5; col++) {
          for (let row = 0; row <= 7; row++) {
            const idx = row * 5 + col;
            const card = bfAI[idx];
            if (!card || card.owner !== moverOwner) continue;
            const order = newPlacedAtAI[idx] ?? 9999;
            if (row === edgeRow) {
              actionsAI.push({ kind: 'atkHP', idx, order });
            } else {
              const target = (row + dir) * 5 + col;
              if (!bfAI[target]) {
                actionsAI.push({ kind: 'move', idx, to: target, order });
              } else if (bfAI[target]?.owner !== moverOwner) {
                actionsAI.push({ kind: 'fight', idx, vs: target, order });
              }
            }
          }
        }

        actionsAI.sort((a, b) => a.order - b.order);

        for (const action of actionsAI) {
          const mover = bfAI[action.idx];
          if (!mover) continue;

          if (action.kind === 'atkHP') {
            setEdgeHP(getEdgeHP() - mover.stats.attack);
            bfAI[action.idx] = null;
            newPlacedAtAI[action.idx] = null;
            delete newMaxHPAI[action.idx];

          } else if (action.kind === 'move') {
            if (bfAI[action.to]) continue;
            bfAI[action.to] = mover;
            bfAI[action.idx] = null;
            newPlacedAtAI[action.to] = newPlacedAtAI[action.idx];
            newPlacedAtAI[action.idx] = null;
            newMaxHPAI[action.to] = newMaxHPAI[action.idx];
            delete newMaxHPAI[action.idx];
            animAI[action.to] = 'move';

          } else {
            const defender = bfAI[action.vs];
            if (!defender) continue;

            const moverAtks = calculateBattleDamage(mover, defender);
            const defAtks   = calculateBattleDamage(defender, mover);
            const moverSurvives    = !defAtks.defeated;
            const defenderSurvives = !moverAtks.defeated;
            const moverNew   = moverSurvives   ? { ...mover,   stats: { ...mover.stats,   hp: defAtks.defenderRemainingHP   } } : null;
            const defenderNew = defenderSurvives ? { ...defender, stats: { ...defender.stats, hp: moverAtks.defenderRemainingHP } } : null;

            const isPlayerMover = moverOwner === 'player';
            faceoffs.push({
              playerCard:      isPlayerMover ? { ...mover }   : { ...defender },
              opponentCard:    isPlayerMover ? { ...defender } : { ...mover },
              playerDamage:    isPlayerMover ? defAtks.damage   : moverAtks.damage,
              opponentDamage:  isPlayerMover ? moverAtks.damage : defAtks.damage,
              playerDefeated:  isPlayerMover ? !moverSurvives   : !defenderSurvives,
              opponentDefeated: isPlayerMover ? !defenderSurvives : !moverSurvives,
              abilityTrigger:  mover.ability?.effect === 'double_damage' ? 'DOUBLE STRIKE!' : undefined,
            });

            bfAI[action.idx] = null;
            bfAI[action.vs]  = null;

            if (defenderSurvives) {
              bfAI[action.vs] = defenderNew;
              if (moverSurvives) {
                bfAI[action.idx] = moverNew;
              } else {
                newPlacedAtAI[action.idx] = null;
                delete newMaxHPAI[action.idx];
              }
            } else {
              delete newMaxHPAI[action.vs];
              newPlacedAtAI[action.vs] = null;
              if (moverSurvives && moverNew) {
                bfAI[action.vs] = moverNew;
                newPlacedAtAI[action.vs] = newPlacedAtAI[action.idx];
                newMaxHPAI[action.vs] = newMaxHPAI[action.idx];
              }
              newPlacedAtAI[action.idx] = null;
              delete newMaxHPAI[action.idx];
            }

            animAI[action.idx] = moverSurvives   ? 'attack' : 'faint';
            animAI[action.vs]  = defenderSurvives ? 'hit'    : 'faint';
          }
        }
      };

      resolveAI('opponent', 1, () => phpAI, (v) => { phpAI = v; });

      // AI places a card
      if (opponentHand.length > 0 && mode === 'local') {
        const rCard = opponentHand[Math.floor(Math.random() * opponentHand.length)];
        const freeSlots = [0, 1, 2, 3, 4].filter((i) => !bfAI[i]);
        if (freeSlots.length > 0) {
          const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
          bfAI[slot] = { ...rCard, owner: 'opponent' };
          newPlacedAtAI[slot] = ++placementCounter.current;
          newMaxHPAI[slot] = rCard.stats.hp;
          setOpponentHand((prev) => prev.filter((c) => c !== rCard));
        }
      }

      if (opponentHand.length < 10 && opponentDeck.length > 0) {
        setOpponentHand((prev) => [...prev, opponentDeck[0]]);
        setOpponentDeck((prev) => prev.slice(1));
      }

      setAnimStates(animAI);
      setPlacedAt(newPlacedAtAI);
      setSlotMaxHP(newMaxHPAI);

      // Apply game state; show faceoffs as overlays in chronological order
      setBattlefield([...bfAI]);
      setPlayerHP(phpAI);
      setOpponentHP(ohpAI);
      if (phpAI <= 0) setGameOver('defeat');
      if (ohpAI <= 0) setGameOver('victory');

      if (faceoffs.length > 0) {
        const [first, ...rest] = faceoffs;
        setFaceoffQueue(rest);
        setCurrentFaceoff(first);
      }

      setCurrentTurn('player');
      setTimeout(() => setAnimStates({}), 1200);
    }, 1000);
  }, [
    currentTurn, battlefield, playerHP, opponentHP, playerHand, playerDeck,
    opponentHand, opponentDeck, placedAt, slotMaxHP, showPopup, mode,
  ]);

  // ── Drag & drop (desktop) ──────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      if (draggedCard) placeCard(draggedCard, slotIndex);
      setDraggedCard(null);
    },
    [draggedCard, placeCard]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  // Cell size: fixed px so the grid never stretches.
  // Mobile: 5 cells must fit in ~360px screen → 64px each.
  // Desktop: larger cells, grid centred on page.
  const CELL = isMobile ? 64 : 80;

  const playerHPPct   = Math.max(0, playerHP);
  const opponentHPPct = Math.max(0, opponentHP);

  const onSelectHandCard = (card: PokemonCardType) => {
    setSelectedHandCard(selectedHandCard === card ? null : card);
  };

  const BattleGrid = () => (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(5, ${CELL}px)`,
        // rows are auto — height is determined by the cells (square via explicit height)
        background: 'rgba(4,4,16,0.92)',
        border: '1px solid rgba(99,102,241,0.3)',
        boxShadow: '0 0 24px rgba(99,102,241,0.12)',
        position: 'relative',
      }}
    >
      {/* Mid-field divider line */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: CELL * 5, // after 5 opponent rows
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      {battlefield.map((card, index) => {
        const row = Math.floor(index / 5);
        const isPlayerZone = row >= 5;
        const isDropZone = index >= 35;
        const maxHP = slotMaxHP[index] ?? (card?.stats.hp ?? 1);
        return (
          <FieldSlot
            key={index}
            card={card}
            index={index}
            size={CELL}
            animState={animStates[index] ?? 'idle'}
            isPlayerZone={isPlayerZone}
            isDropZone={isDropZone}
            maxHP={maxHP}
            selectedHandCard={selectedHandCard}
            draggedCard={draggedCard}
            popups={popups.filter((p) => p.index === index)}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onTapSlot={() => {
              if (selectedHandCard && isDropZone && currentTurn === 'player') {
                placeCard(selectedHandCard, index);
              }
            }}
          />
        );
      })}
    </div>
  );

  const HandArea = () => (
    <div style={{ background: 'rgba(4,4,14,0.88)', borderTop: '1px solid rgba(99,102,241,0.2)', padding: '6px 8px 8px' }}>
      {/* Cost pips + label */}
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.42rem', color: '#64748b' }}>
          HAND — COST {currentTurnCost}/3
        </span>
        <div className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              width: 10, height: 10, borderRadius: 2,
              background: currentTurnCost >= n ? '#6366f1' : 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.45)',
              boxShadow: currentTurnCost >= n ? '0 0 5px #6366f1' : 'none',
            }} />
          ))}
        </div>
      </div>
      {/* Cards */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {playerHand.map((card, i) => (
          <HandCard
            key={i}
            card={card}
            size={isMobile ? 60 : 72}
            canPlay={currentTurnCost + card.cost <= 3 && currentTurn === 'player'}
            isSelected={selectedHandCard === card}
            onDragStart={() => setDraggedCard(card)}
            onSelect={() => onSelectHandCard(card)}
          />
        ))}
        {playerHand.length === 0 && (
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#374151' }}>No cards</span>
        )}
      </div>
      {/* End turn */}
      <button
        className="mt-2 w-full py-2 rounded transition-all duration-150"
        disabled={currentTurn !== 'player' || !!gameOver}
        onClick={endTurn}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.55rem',
          letterSpacing: '0.1em',
          background: currentTurn === 'player' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(30,30,50,0.6)',
          color: currentTurn === 'player' ? '#fff' : '#374151',
          border: `1px solid ${currentTurn === 'player' ? '#6366f1' : 'rgba(99,102,241,0.15)'}`,
          boxShadow: currentTurn === 'player' ? '0 0 14px rgba(99,102,241,0.4)' : 'none',
          cursor: currentTurn !== 'player' ? 'not-allowed' : 'pointer',
        }}
      >
        {currentTurn === 'player' ? 'END TURN' : "OPPONENT'S TURN…"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      <Navigation />

      {currentFaceoff && (
        <FaceOffOverlay
          data={currentFaceoff}
          isMobile={isMobile}
          onComplete={() => {
            setCurrentFaceoff(null);
            if (faceoffQueue.length > 0) {
              setTimeout(() => {
                const [next, ...rest] = faceoffQueue;
                setCurrentFaceoff(next);
                setFaceoffQueue(rest);
              }, 300);
            }
          }}
        />
      )}

      {gameOver && (
        <GameOverScreen
          result={gameOver}
          onRestart={() => window.location.reload()}
          onChangeDeck={() => navigate('/play')}
        />
      )}

      {/* ── MOBILE layout ── */}
      {isMobile && (
        <div className="flex flex-col" style={{ paddingTop: 56, height: '100dvh' }}>
          <HPStrip label="OPPONENT" hp={opponentHP} pct={opponentHPPct} flip />
          <div className="flex-1 overflow-y-auto flex items-start justify-center py-1">
            <BattleGrid />
          </div>
          <HPStrip label="YOU" hp={playerHP} pct={playerHPPct} />
          <HandArea />
        </div>
      )}

      {/* ── DESKTOP layout ── */}
      {!isMobile && (
        <div className="flex flex-col items-center" style={{ paddingTop: 64, minHeight: '100dvh' }}>
          {/* Opponent HP full-width */}
          <div className="w-full max-w-3xl px-6 mb-2">
            <HPStrip label="OPPONENT" hp={opponentHP} pct={opponentHPPct} flip />
          </div>

          {/* Main content: grid + hand side-by-side on wide screens */}
          <div className="flex gap-6 items-start px-6">
            {/* Battle grid */}
            <div>
              <div
                className="mb-1 flex justify-between"
                style={{ width: CELL * 5 }}
              >
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#ef4444' }}>OPPONENT</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#22c55e' }}>YOU ↓</span>
              </div>
              <BattleGrid />
            </div>

            {/* Right panel: hand cards + end turn */}
            <div style={{ minWidth: 200, maxWidth: 280 }}>
              <div
                className="rounded-lg p-3"
                style={{ background: 'rgba(4,4,16,0.88)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                {/* Mode info */}
                <div className="mb-3" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: '#475569' }}>
                  {mode === 'local' ? `vs AI (${difficulty})` : 'PVP'}
                </div>

                {/* Cost pips */}
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.42rem', color: '#64748b' }}>COST {currentTurnCost}/3</span>
                  <div className="flex gap-1">
                    {[1,2,3].map((n) => (
                      <div key={n} style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: currentTurnCost >= n ? '#6366f1' : 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.45)',
                        boxShadow: currentTurnCost >= n ? '0 0 5px #6366f1' : 'none',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Hand label + hint */}
                <div className="mb-2" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: '#475569' }}>
                  HAND ({playerHand.length}) — click card then bottom row
                </div>

                {/* Cards grid */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {playerHand.map((card, i) => (
                    <HandCard
                      key={i}
                      card={card}
                      size={72}
                      canPlay={currentTurnCost + card.cost <= 3 && currentTurn === 'player'}
                      isSelected={selectedHandCard === card}
                      onDragStart={() => setDraggedCard(card)}
                      onSelect={() => onSelectHandCard(card)}
                    />
                  ))}
                  {playerHand.length === 0 && (
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: '#374151' }}>No cards</span>
                  )}
                </div>

                {/* End turn */}
                <button
                  className="w-full py-2.5 rounded transition-all duration-150"
                  disabled={currentTurn !== 'player' || !!gameOver}
                  onClick={endTurn}
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.1em',
                    background: currentTurn === 'player' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(30,30,50,0.6)',
                    color: currentTurn === 'player' ? '#fff' : '#374151',
                    border: `1px solid ${currentTurn === 'player' ? '#6366f1' : 'rgba(99,102,241,0.15)'}`,
                    boxShadow: currentTurn === 'player' ? '0 0 14px rgba(99,102,241,0.4)' : 'none',
                    cursor: currentTurn !== 'player' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {currentTurn === 'player' ? 'END TURN' : "OPP TURN…"}
                </button>
              </div>
            </div>
          </div>

          {/* Player HP */}
          <div className="w-full max-w-3xl px-6 mt-2">
            <HPStrip label="YOU" hp={playerHP} pct={playerHPPct} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FieldSlot ─────────────────────────────────────────────────────────────────

interface SlotProps {
  card: PokemonCardType | null;
  index: number;
  size: number;
  animState: AnimState;
  isPlayerZone: boolean;
  isDropZone: boolean;
  maxHP: number;
  selectedHandCard: PokemonCardType | null;
  draggedCard: PokemonCardType | null;
  popups: { id: number; text: string }[];
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onTapSlot: () => void;
}

const FieldSlot = ({
  card, index, size, animState, isPlayerZone, isDropZone, maxHP,
  selectedHandCard, draggedCard, popups, onDrop, onDragOver, onTapSlot,
}: SlotProps) => {
  const typeColor = card ? getTypeColor(card.types[0]) : null;
  const hpPct = card ? Math.max(0, Math.min(100, (card.stats.hp / maxHP) * 100)) : 100;
  const hpColor = hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#eab308' : '#ef4444';

  const canReceive = isDropZone && !card;
  const glowing   = canReceive && (draggedCard || selectedHandCard);

  const inner = (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: canReceive ? 'pointer' : 'default',
        boxSizing: 'border-box',
        // Pixel grid texture
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '6px 6px',
        background: card
          ? `radial-gradient(ellipse at 50% 60%, ${typeColor}22 0%, rgba(3,3,14,0.92) 72%)`
          : isPlayerZone
            ? 'rgba(6,6,24,0.88)'
            : 'rgba(3,3,14,0.82)',
        border: card
          ? `1px solid ${typeColor}90`
          : glowing
            ? '1px solid rgba(250,210,0,0.55)'
            : isPlayerZone
              ? '1px solid rgba(99,102,241,0.18)'
              : '1px solid rgba(60,60,100,0.15)',
        boxShadow: card
          ? `0 0 10px ${typeColor}50, inset 0 0 8px ${typeColor}12`
          : glowing
            ? '0 0 12px rgba(250,210,0,0.3), inset 0 0 8px rgba(250,210,0,0.08)'
            : 'none',
      }}
      onDrop={(e) => onDrop(e, index)}
      onDragOver={onDragOver}
      onClick={onTapSlot}
    >
      {card ? (
        <>
          {/* Sprite — canvas sized exactly to cell */}
          <PokemonSprite
            pokemon={card}
            animState={animState}
            className=""
            style={{ width: size, height: size, display: 'block' }}
          />
          {/* HP bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(0,0,0,0.7)' }}>
            <div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 4px ${hpColor}`, transition: 'width 0.3s' }} />
          </div>
          {/* Type colour dot top-left */}
          <div style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, borderRadius: '50%', background: typeColor ?? '#888', boxShadow: `0 0 4px ${typeColor}` }} />
        </>
      ) : glowing ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(250,210,0,0.35)', fontSize: size * 0.35 }}>+</span>
        </div>
      ) : null}

      {popups.map((p) => (
        <div key={p.id} className="animate-damage-pop" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: '#ff4444', textShadow: '0 0 6px #ff4444' }}>{p.text}</span>
        </div>
      ))}
    </div>
  );

  if (card) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.42rem' }}>
            <div className="font-bold uppercase mb-1" style={{ color: typeColor ?? '#fff' }}>{card.name}</div>
            <div>HP: {card.stats.hp}/{maxHP}</div>
            <div>ATK: {card.stats.attack} · DEF: {card.stats.defense}</div>
            {card.ability && <div style={{ color: '#a855f7', marginTop: 2 }}>{card.ability.name}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  return inner;
};

// ─── HandCard ──────────────────────────────────────────────────────────────────

interface HandCardProps {
  card: PokemonCardType;
  size: number;
  canPlay: boolean;
  isSelected: boolean;
  onDragStart: () => void;
  onSelect: () => void;
}

const HandCard = ({ card, size, canPlay, isSelected, onDragStart, onSelect }: HandCardProps) => {
  const color = getTypeColor(card.types[0]);
  const spriteSize = size - 16;

  return (
    <div
      className="flex-shrink-0 relative rounded overflow-hidden pixel-card cursor-pointer transition-all duration-150"
      style={{
        width: size,
        border: isSelected ? `2px solid ${color}` : `1px solid ${color}55`,
        boxShadow: isSelected ? `0 0 16px ${color}90, 0 0 30px ${color}30` : `0 0 5px ${color}25`,
        opacity: canPlay ? 1 : 0.38,
        transform: isSelected ? 'translateY(-6px)' : undefined,
      }}
      draggable={canPlay}
      onDragStart={canPlay ? onDragStart : undefined}
      onClick={onSelect}
    >
      {/* Cost badge */}
      <div style={{
        position: 'absolute', top: 4, left: 4, width: 16, height: 16, borderRadius: '50%', zIndex: 10,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        fontFamily: 'var(--font-pixel)', fontSize: '0.38rem', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 5px ${color}`,
      }}>
        {card.cost}
      </div>
      {/* Dots */}
      <div style={{ position: 'absolute', top: 5, right: 4, display: 'flex', gap: 2, zIndex: 10 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, opacity: 0.9 }} />
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#555' }} />
      </div>
      {/* Sprite area */}
      <div style={{
        height: spriteSize + 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse at center, ${color}14 0%, transparent 70%)`,
      }}>
        <img
          src={card.sprite}
          alt={card.name}
          style={{ width: spriteSize, height: spriteSize, imageRendering: 'pixelated', objectFit: 'contain' }}
          draggable={false}
        />
      </div>
      {/* Name */}
      <div style={{
        padding: '2px 4px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-pixel)', fontSize: '0.32rem', color: '#94a3b8',
        background: `${color}10`, borderTop: `1px solid ${color}22`,
      }}>
        {card.name.toUpperCase()}
      </div>
    </div>
  );
};

// ─── HP Strip ──────────────────────────────────────────────────────────────────

const HPStrip = ({ label, hp, pct, flip = false }: { label: string; hp: number; pct: number; flip?: boolean }) => {
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
  const labelColor = flip ? '#ef4444' : '#22c55e';
  return (
    <div style={{ padding: '4px 10px', background: 'rgba(3,3,14,0.88)', borderBottom: flip ? '1px solid rgba(99,102,241,0.15)' : undefined, borderTop: !flip ? '1px solid rgba(99,102,241,0.15)' : undefined, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color: labelColor, minWidth: 80 }}>{label}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 2, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}bb)`, boxShadow: `0 0 6px ${color}`, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', color, minWidth: 48, textAlign: 'right' }}>{hp}/100</span>
    </div>
  );
};

// ─── Game Over Screen ──────────────────────────────────────────────────────────

const GameOverScreen = ({
  result,
  onRestart,
  onChangeDeck,
}: { result: 'victory' | 'defeat'; onRestart: () => void; onChangeDeck: () => void }) => {
  const isVictory = result === 'victory';
  const color = isVictory ? '#22c55e' : '#ef4444';
  const title = isVictory ? 'VICTORY!' : 'DEFEAT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,2,12,0.92)', backdropFilter: 'blur(6px)' }}>
      <div
        className="flex flex-col items-center gap-6 px-8 py-10 rounded-xl"
        style={{
          background: 'rgba(6,6,22,0.95)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 40px ${color}50, 0 0 80px ${color}20`,
          maxWidth: 340,
          width: '90%',
        }}
      >
        {/* Title */}
        <div
          className="animate-victory-pulse text-center"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(1.2rem, 8vw, 2rem)',
            color,
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
            letterSpacing: '0.1em',
          }}
        >
          {title}
        </div>

        {/* Flavor text */}
        <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.55rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.8 }}>
          {isVictory
            ? "The opponent's HP reached zero.\nYou are the champion!"
            : 'Your HP reached zero.\nBetter luck next time!'}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded transition-all duration-200"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.6rem',
              background: `linear-gradient(135deg, ${color}cc, ${color}80)`,
              color: '#fff',
              border: `1px solid ${color}`,
              boxShadow: `0 0 12px ${color}40`,
              letterSpacing: '0.08em',
            }}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onChangeDeck}
            className="w-full py-3 rounded transition-all duration-200"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.6rem',
              background: 'rgba(99,102,241,0.15)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.4)',
            }}
          >
            CHANGE DECK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;

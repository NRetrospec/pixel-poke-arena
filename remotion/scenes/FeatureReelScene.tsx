import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, DECK, FONT, SUNSET, TYPE_COLORS } from "../constants";
import { PokemonCardMock } from "../components/PokemonCardMock";
import { BattleGridMock, GridCard } from "../components/BattleGridMock";
import { HPBar } from "../components/HPBar";

// ─────────────────────────────────────────
// Sub-scene A: Deck Builder (local F 0–99)
// ─────────────────────────────────────────
const DeckBuilderScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [82, 99], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Search bar cursor blink
  const cursorVisible = Math.floor(frame / 10) % 2 === 0;

  // Progress counter counts up
  const count = Math.floor(
    interpolate(frame, [30, 90], [0, 12], { extrapolateRight: "clamp" })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: fadeIn * fadeOut,
        display: "flex",
        flexDirection: "column",
        padding: "60px 48px 40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          borderBottom: `2px solid ${C.muted}`,
          paddingBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 34,
            background: SUNSET,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          DECK BUILDER
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 20,
            color: count >= 35 ? C.primary : C.textDim,
          }}
        >
          {count}/35 CARDS
        </div>
      </div>

      {/* Search bar */}
      <div
        style={{
          border: `2px solid ${C.muted}`,
          borderRadius: 4,
          padding: "12px 18px",
          marginBottom: 28,
          fontFamily: FONT,
          fontSize: 18,
          color: C.textDim,
          backgroundColor: C.cardBg,
          display: "flex",
          gap: 10,
        }}
      >
        <span>🔍</span>
        <span>SEARCH POKÉMON</span>
        <span style={{ opacity: cursorVisible ? 1 : 0, color: C.primary }}>|</span>
      </div>

      {/* Card grid — 4 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          flex: 1,
        }}
      >
        {DECK.map((card, i) => (
          <PokemonCardMock
            key={card.id}
            card={card}
            delay={18 + i * 5}
            w={220}
            showAbility={i < 4}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────
// Sub-scene B: Battlefield (local F 0–99)
// ─────────────────────────────────────────
const BATTLE_GRID: (GridCard | null)[] = [
  // Opponent row
  { id: 130, name: "GYARADOS",  type: "water",  hp: 55, maxHp: 95 },
  null,
  { id: 94,  name: "GENGAR",    type: "ghost",  hp: 40, maxHp: 60 },
  null,
  { id: 149, name: "DRAGONITE", type: "dragon", hp: 72, maxHp: 91 },
  // Mid row (empty)
  null, null, null, null, null,
  // Mid row (empty)
  null, null, null, null, null,
  // Player row
  { id: 25,  name: "PIKACHU",   type: "electric", hp: 35, maxHp: 35 },
  null,
  { id: 6,   name: "CHARIZARD", type: "fire",     hp: 78, maxHp: 78 },
  null,
  { id: 150, name: "MEWTWO",    type: "psychic",  hp: 106, maxHp: 106 },
];

const BattlefieldScreen: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [82, 99], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const costS = spring({
    frame: Math.max(0, frame - 60),
    fps: 30,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: fadeIn * fadeOut,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "50px 30px",
      }}
    >
      {/* Turn & cost header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            background: SUNSET,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          TURN 4
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: FONT, fontSize: 20, color: C.textDim }}>
            COST:
          </span>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: i < 2 ? C.primary : "transparent",
                border: `2px solid ${C.primary}`,
                boxShadow: i < 2 ? `0 0 8px ${C.primary}` : "none",
                transform: `scale(${i < 2 ? costS : 1})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Opponent HP */}
      <div style={{ width: "100%", marginBottom: 16 }}>
        <HPBar
          label="OPPONENT"
          startHp={67}
          endHp={67}
          maxHp={100}
          drainStart={0}
          drainEnd={0}
          width={984}
        />
      </div>

      {/* Battlefield grid */}
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <BattleGridMock
          grid={BATTLE_GRID}
          cols={5}
          rows={4}
          opponentRows={1}
          slotSize={176}
        />
      </div>

      {/* Player HP */}
      <div style={{ width: "100%", marginTop: 16 }}>
        <HPBar
          label="YOU"
          startHp={100}
          endHp={100}
          maxHp={100}
          drainStart={0}
          drainEnd={0}
          width={984}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────
// Sub-scene C: Combat (local F 0–99)
// ─────────────────────────────────────────
const CombatScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Attack lunge: Charizard moves toward Dragonite
  const attackProgress = interpolate(frame, [25, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const attackX = interpolate(
    attackProgress,
    [0, 0.35, 0.65, 1],
    [0, 160, 160, 0]
  );

  // Defender flash
  const flashOpacity = interpolate(frame, [38, 45, 55, 62], [0, 0.7, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CRITICAL HIT pop-in
  const critS = spring({
    frame: Math.max(0, frame - 48),
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const critScale = interpolate(critS, [0, 1], [0, 1]);
  const critOpacity = interpolate(frame, [48, 58, 88, 99], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // HP drain
  const fireColor = TYPE_COLORS["fire"];
  const dragonColor = TYPE_COLORS["dragon"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: fadeIn,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "40px 60px",
      }}
    >
      {/* VS matchup */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          width: "100%",
        }}
      >
        {/* Attacker: Charizard */}
        <div style={{ transform: `translateX(${attackX}px)` }}>
          <PokemonCardMock
            card={DECK[0]}
            delay={0}
            w={290}
            showAbility
            glowIntensity={1.5}
          />
        </div>

        {/* VS text */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 52,
            background: SUNSET,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            flexShrink: 0,
          }}
        >
          VS
        </div>

        {/* Defender: Dragonite */}
        <div style={{ position: "relative" }}>
          {/* Hit flash */}
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 6,
              backgroundColor: "#ef4444",
              opacity: flashOpacity,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <PokemonCardMock
            card={DECK[11]}
            delay={8}
            w={290}
            flipX
          />
        </div>
      </div>

      {/* HP bars */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
        <HPBar
          label="CHARIZARD"
          startHp={78}
          endHp={78}
          maxHp={78}
          drainStart={0}
          drainEnd={0}
          width={960}
        />
        <HPBar
          label="DRAGONITE"
          startHp={91}
          endHp={25}
          maxHp={91}
          drainStart={40}
          drainEnd={70}
          width={960}
        />
      </div>

      {/* CRITICAL HIT badge */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${critScale}) rotate(-8deg)`,
          opacity: critOpacity,
          backgroundColor: C.primary,
          color: "#000",
          fontFamily: FONT,
          fontSize: 42,
          padding: "16px 36px",
          borderRadius: 4,
          boxShadow: `0 0 40px ${C.primary}, 0 0 80px ${C.primary}88`,
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        ⚡ CRITICAL HIT!
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────
// Main FeatureReelScene
// ─────────────────────────────────────────
export const FeatureReelScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Sequence from={0} durationInFrames={100} premountFor={15}>
        <DeckBuilderScreen />
      </Sequence>
      <Sequence from={100} durationInFrames={100} premountFor={15}>
        <BattlefieldScreen />
      </Sequence>
      <Sequence from={200} durationInFrames={100} premountFor={15}>
        <CombatScreen />
      </Sequence>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, SUNSET, TYPE_COLORS } from "../constants";
import { BattleGridMock, GridCard } from "../components/BattleGridMock";
import { HPBar } from "../components/HPBar";

// Full 5-col × 5-row hero battlefield (25 slots)
const HERO_GRID: (GridCard | null)[] = [
  // Row 0 — opponent front
  { id: 130, name: "GYARADOS",  type: "water",    hp: 22, maxHp: 95  },
  null,
  { id: 149, name: "DRAGONITE", type: "dragon",   hp: 9,  maxHp: 91  },
  null,
  { id: 94,  name: "GENGAR",    type: "ghost",    hp: 11, maxHp: 60  },
  // Row 1 — opponent advancing
  null, null, null, null, null,
  // Row 2 — center
  null, null, null, null, null,
  // Row 3 — player advancing
  null,
  { id: 9,   name: "BLASTOISE", type: "water",    hp: 79, maxHp: 79  },
  null,
  { id: 3,   name: "VENUSAUR",  type: "grass",    hp: 80, maxHp: 80  },
  null,
  // Row 4 — player zone
  { id: 25,  name: "PIKACHU",   type: "electric", hp: 35, maxHp: 35  },
  null,
  { id: 6,   name: "CHARIZARD", type: "fire",     hp: 78, maxHp: 78  },
  null,
  { id: 150, name: "MEWTWO",    type: "psychic",  hp: 106, maxHp: 106 },
];

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade in / out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [192, 209], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sceneOpacity = fadeIn * fadeOut;

  // Dramatic zoom-in starting at F30
  const zoom = interpolate(frame, [30, 150], [0.92, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "DOUBLE DAMAGE!" badge
  const badgeS = spring({
    frame: Math.max(0, frame - 55),
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const badgeScale = interpolate(badgeS, [0, 1], [0, 1]);
  const badgeOpacity = interpolate(frame, [55, 68, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgePulse = interpolate(
    frame % 20,
    [0, 10, 20],
    [1, 1.06, 1],
    { extrapolateRight: "clamp" }
  );

  // Opponent HP drains 67 → 8 over F80–130
  // Attack slot: index 2 (Dragonite), attack from slot 12 (center-col player)
  const attackProgress = interpolate(frame, [65, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hitProgress = interpolate(frame, [78, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "VICTORY IS YOURS" text
  const victoryS = spring({
    frame: Math.max(0, frame - 140),
    fps,
    config: { damping: 13, stiffness: 110 },
  });
  const victoryOpacity = Math.min(1, victoryS * 2) *
    interpolate(frame, [195, 209], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const victoryY = interpolate(victoryS, [0, 1], [50, 0]);

  // Low HP warning flash on opponent side
  const warningFlash =
    frame > 90
      ? interpolate(frame % 16, [0, 8, 16], [0.08, 0.22, 0.08])
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: sceneOpacity,
      }}
    >
      {/* Dramatic background glow centered on Charizard */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 600px at 50% 72%, ${TYPE_COLORS["fire"]}28 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Opponent low-HP warning overlay (top half) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "42%",
          backgroundColor: "#ef4444",
          opacity: warningFlash,
          pointerEvents: "none",
        }}
      />

      {/* Zoom wrapper */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "50px 28px 40px",
          gap: 20,
        }}
      >
        {/* Opponent HP */}
        <HPBar
          label="OPPONENT"
          startHp={67}
          endHp={8}
          maxHp={100}
          drainStart={80}
          drainEnd={130}
          width={1024}
        />

        {/* Gradient bar */}
        <div
          style={{
            width: "100%",
            height: 2,
            background: SUNSET,
            opacity: 0.4,
          }}
        />

        {/* Battlefield */}
        <BattleGridMock
          grid={HERO_GRID}
          cols={5}
          rows={5}
          opponentRows={1}
          attackSlot={12}
          attackProgress={attackProgress}
          hitSlot={2}
          flashProgress={hitProgress}
          slotSize={168}
        />

        <div
          style={{
            width: "100%",
            height: 2,
            background: SUNSET,
            opacity: 0.4,
          }}
        />

        {/* Player HP */}
        <HPBar
          label="YOU"
          startHp={100}
          endHp={100}
          maxHp={100}
          drainStart={0}
          drainEnd={0}
          width={1024}
        />
      </div>

      {/* DOUBLE DAMAGE! badge */}
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${badgeScale * badgePulse}) rotate(-6deg)`,
          opacity: badgeOpacity,
          backgroundColor: TYPE_COLORS["fire"],
          color: "#000",
          fontFamily: FONT,
          fontSize: 36,
          padding: "14px 32px",
          borderRadius: 4,
          boxShadow: `0 0 30px ${TYPE_COLORS["fire"]}, 0 0 60px ${TYPE_COLORS["fire"]}88`,
          whiteSpace: "nowrap",
          zIndex: 20,
        }}
      >
        🔥 DOUBLE DAMAGE!
      </div>

      {/* VICTORY IS YOURS */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 52,
          background: SUNSET,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          transform: `translateY(${victoryY}px)`,
          opacity: victoryOpacity,
          padding: "0 40px",
        }}
      >
        VICTORY IS YOURS.
      </div>
    </AbsoluteFill>
  );
};

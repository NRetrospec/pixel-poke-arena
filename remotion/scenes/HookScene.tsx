import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, SUNSET } from "../constants";

// Deterministic star field using golden-angle distribution
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((Math.sin(i * 2.399963) + 1) / 2) * 100,
  y: ((Math.cos(i * 2.399963 * 1.618) + 1) / 2) * 100,
  r: 1 + (i % 3),
  baseOpacity: 0.2 + (i % 5) * 0.08,
  phase: i % 40,
}));

const StarField: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {STARS.map((s, i) => {
        const twinkle = interpolate(
          (frame + s.phase) % 40,
          [0, 20, 40],
          [s.baseOpacity, s.baseOpacity * 2.5, s.baseOpacity],
          { extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: "50%",
              backgroundColor: "white",
              opacity: twinkle,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Pixel scanline overlay
const Scanlines: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
    {Array.from({ length: 64 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          top: `${(i / 64) * 100}%`,
          left: 0,
          right: 0,
          height: "0.8%",
          backgroundColor: "rgba(0,0,0,0.12)",
        }}
      />
    ))}
  </AbsoluteFill>
);

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade-in
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "STOP" — crashes in from above with spring
  const stopS = spring({
    frame: Math.max(0, frame - 3),
    fps,
    config: { damping: 9, stiffness: 160 },
  });
  const stopScale = interpolate(stopS, [0, 1], [3.5, 1]);
  const stopOpacity = Math.min(1, stopS * 1.8);

  // Horizontal divider expands outward
  const dividerW = interpolate(stopS, [0, 1], [0, 900]);

  // "SCROLLING." typewriter (chars 0–10 over frames 22–52)
  const scrollChars = Math.floor(
    interpolate(frame, [22, 52], [0, 10], { extrapolateRight: "clamp" })
  );
  const cursorVisible = scrollChars < 10 && Math.floor(frame / 7) % 2 === 0;

  // White flash
  const flashOpacity = interpolate(
    frame,
    [54, 58, 60, 64],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "START BATTLING." — fires in after flash
  const battleS = spring({
    frame: Math.max(0, frame - 62),
    fps,
    config: { damping: 11, stiffness: 140 },
  });
  const battleScale = interpolate(battleS, [0, 1], [2.2, 1]);
  const battleOpacity = Math.min(1, battleS * 2);

  // Ambient purple glow that intensifies
  const glowR = interpolate(frame, [0, 60, 90], [0, 300, 420]);
  const glowOpacity = interpolate(frame, [0, 30, 90], [0, 0.25, 0.45]);

  // Card teasers slide up from bottom
  const cardY = interpolate(frame, [75, 89], [180, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [75, 86], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD_COLORS = [C.primary, C.secondary, C.accent, C.primary, C.secondary];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: bgOpacity }}>
      <StarField />

      {/* Ambient radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${glowR}px at 50% 52%, hsl(16 100% 35% / ${glowOpacity}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "0 60px",
        }}
      >
        {/* STOP */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 150,
            color: C.text,
            transform: `scale(${stopScale})`,
            opacity: stopOpacity,
            textShadow: `0 0 30px ${C.primary}, 0 0 70px ${C.primary}80`,
            letterSpacing: 6,
          }}
        >
          STOP
        </div>

        {/* Sunset divider */}
        <div
          style={{
            width: dividerW,
            height: 4,
            background: SUNSET,
            boxShadow: `0 0 18px ${C.primary}`,
          }}
        />

        {/* SCROLLING. typewriter */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 68,
            color: C.text,
            letterSpacing: 2,
            opacity: interpolate(frame, [22, 32], [0, 1], {
              extrapolateRight: "clamp",
            }),
            minHeight: 90,
            textAlign: "center",
          }}
        >
          {"SCROLLING.".slice(0, scrollChars)}
          {cursorVisible && (
            <span style={{ color: C.primary }}>▮</span>
          )}
        </div>

        {/* START BATTLING. — gradient text */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 106,
            background: SUNSET,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: `scale(${battleScale})`,
            opacity: battleOpacity,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          START{"\n"}BATTLING.
        </div>
      </AbsoluteFill>

      {/* Card silhouette teasers */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: `translateX(-50%) translateY(${cardY}px)`,
          opacity: cardOpacity,
          display: "flex",
          gap: 14,
        }}
      >
        {CARD_COLORS.map((col, i) => (
          <div
            key={i}
            style={{
              width: 56,
              height: 78,
              background: `linear-gradient(135deg, ${C.cardBg}, ${C.cardBg2})`,
              border: `2px solid ${col}`,
              borderRadius: 4,
              opacity: 1 - i * 0.12,
              boxShadow: `0 0 12px ${col}66`,
            }}
          />
        ))}
      </div>

      {/* White flash */}
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      <Scanlines />
    </AbsoluteFill>
  );
};

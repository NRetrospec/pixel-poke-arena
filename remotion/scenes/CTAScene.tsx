import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT, SUNSET, TYPE_COLORS } from "../constants";

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background: dark → sunset gradient flood
  const gradientOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "PIXEL" (line 1)
  const pixelS = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const pixelScale = interpolate(pixelS, [0, 1], [2.5, 1]);
  const pixelOpacity = Math.min(1, pixelS * 2);

  // "POKE" (line 2)
  const pokeS = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const pokeScale = interpolate(pokeS, [0, 1], [2.5, 1]);

  // "ARENA" (line 3)
  const arenaS = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { damping: 10, stiffness: 130 },
  });
  const arenaScale = interpolate(arenaS, [0, 1], [2.5, 1]);

  // Tagline fades in
  const taglineOpacity = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Play button pulses
  const buttonS = spring({
    frame: Math.max(0, frame - 58),
    fps,
    config: { damping: 12, stiffness: 110 },
  });
  const buttonScale = interpolate(buttonS, [0, 1], [0, 1]);

  const buttonPulse = interpolate(
    frame % 24,
    [0, 12, 24],
    [1, 1.04, 1],
    { extrapolateRight: "clamp" }
  );

  // Particle burst on load
  const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    color: [C.primary, C.secondary, C.accent][i % 3],
    dist: 180 + (i % 4) * 60,
  }));

  const particleProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const particleOpacity = interpolate(frame, [0, 8, 28, 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Sunset gradient backdrop */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 1200px at 50% 45%, hsl(16 100% 15% / ${gradientOpacity * 0.85}) 0%, hsl(270 100% 10% / ${gradientOpacity * 0.6}) 60%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Horizontal accent lines */}
      {[0.28, 0.75].map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${y * 100}%`,
            left: 0,
            right: 0,
            height: 2,
            background: SUNSET,
            opacity: gradientOpacity * 0.4,
          }}
        />
      ))}

      {/* Particle burst */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {PARTICLES.map((p, i) => {
          const x = Math.cos(p.angle) * p.dist * particleProgress;
          const y = Math.sin(p.angle) * p.dist * particleProgress;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "38%",
                left: "50%",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: p.color,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: particleOpacity,
                boxShadow: `0 0 12px ${p.color}`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Logo block */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          paddingBottom: 200,
        }}
      >
        {/* PIXEL */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 120,
            color: C.text,
            transform: `scale(${pixelScale})`,
            opacity: pixelOpacity,
            textShadow: `0 0 30px ${C.primary}88`,
            lineHeight: 1.15,
          }}
        >
          PIXEL
        </div>

        {/* POKE — gradient */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 120,
            background: SUNSET,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: `scale(${pokeScale})`,
            opacity: Math.min(1, pokeS * 2),
            lineHeight: 1.15,
          }}
        >
          POKÉ
        </div>

        {/* ARENA */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 120,
            color: C.text,
            transform: `scale(${arenaScale})`,
            opacity: Math.min(1, arenaS * 2),
            textShadow: `0 0 30px ${C.accent}88`,
            lineHeight: 1.15,
          }}
        >
          ARENA
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            color: C.textDim,
            opacity: taglineOpacity,
            marginTop: 32,
            letterSpacing: 4,
          }}
        >
          BUILD · BATTLE · WIN
        </div>
      </AbsoluteFill>

      {/* PLAY FREE NOW button */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: "50%",
          transform: `translate(-50%, 0) scale(${buttonScale * buttonPulse})`,
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            background: SUNSET,
            fontFamily: FONT,
            fontSize: 36,
            color: "#000",
            fontWeight: "bold",
            padding: "24px 64px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            boxShadow: `0 0 40px ${C.primary}88, 0 0 80px ${C.primary}44`,
            cursor: "pointer",
          }}
        >
          ▶ PLAY FREE NOW
        </div>
      </div>

      {/* Bottom star decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 18,
          color: C.textDim,
          opacity: taglineOpacity * 0.7,
        }}
      >
        ★ ★ ★ ★ ★
      </div>
    </AbsoluteFill>
  );
};

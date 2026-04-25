import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, DECK, FONT, SPRITE_URL, SUNSET, TYPE_COLORS } from "../constants";

// Deterministic stars (reuse from HookScene concept but different seed)
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: ((Math.sin(i * 3.14159 + 1.2) + 1) / 2) * 100,
  y: ((Math.cos(i * 2.71828 + 0.7) + 1) / 2) * 100,
  r: 1 + (i % 3),
  opacity: 0.15 + (i % 4) * 0.07,
  phase: (i * 7) % 50,
}));

type LineProps = {
  text: string;
  delay: number;
  fontSize: number;
  gradient?: boolean;
  color?: string;
};

const AnimLine: React.FC<LineProps> = ({
  text,
  delay,
  fontSize,
  gradient = false,
  color = C.text,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  const ty = interpolate(s, [0, 1], [70, 0]);
  const opacity = Math.min(1, s * 2);

  const gradStyle: React.CSSProperties = gradient
    ? {
        background: SUNSET,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color };

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize,
        lineHeight: 1.5,
        textAlign: "center",
        transform: `translateY(${ty}px)`,
        opacity,
        ...gradStyle,
      }}
    >
      {text}
    </div>
  );
};

const MiniCard: React.FC<{ card: (typeof DECK)[0]; delay: number }> = ({
  card,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = TYPE_COLORS[card.type] ?? "#9ca3af";

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const tx = interpolate(s, [0, 1], [120, 0]);

  return (
    <div
      style={{
        width: 120,
        height: 160,
        background: `linear-gradient(135deg, ${C.cardBg} 0%, ${C.cardBg2} 100%)`,
        border: `2px solid ${tc}`,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateX(${tx}px) scale(${s})`,
        opacity: Math.min(1, s * 1.8),
        boxShadow: `0 0 20px ${tc}55`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ width: "100%", height: 3, background: tc, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img
          src={SPRITE_URL(card.id)}
          style={{
            width: 70,
            height: 70,
            imageRendering: "pixelated",
            filter: `drop-shadow(0 0 6px ${tc}88)`,
          }}
        />
      </div>
      <div
        style={{
          width: "100%",
          padding: "3px 6px",
          backgroundColor: `${tc}22`,
          borderTop: `1px solid ${tc}44`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 8,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.name}
        </div>
      </div>
    </div>
  );
};

export const ContextScene: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const sceneExitOpacity = interpolate(frame, [195, 209], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        opacity: sceneOpacity * sceneExitOpacity,
      }}
    >
      {/* Stars */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {STARS.map((s, i) => {
          const twinkle = interpolate(
            (frame + s.phase) % 50,
            [0, 25, 50],
            [s.opacity, s.opacity * 2, s.opacity],
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

      {/* Gradient accent bar at top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: SUNSET,
        }}
      />

      {/* Main text block */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: "0 60px",
          paddingBottom: 360,
        }}
      >
        <AnimLine text="151 POKÉMON." delay={5} fontSize={88} gradient />
        <AnimLine text="ONE BATTLEFIELD." delay={40} fontSize={64} color={C.text} />
        <AnimLine text="ZERO MERCY." delay={75} fontSize={80} gradient />
      </AbsoluteFill>

      {/* Card showcase row */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          overflow: "hidden",
          padding: "0 40px",
        }}
      >
        {DECK.slice(0, 6).map((card, i) => (
          <MiniCard key={card.id} card={card} delay={120 + i * 12} />
        ))}
      </div>

      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 22,
          color: C.textDim,
          opacity: interpolate(frame, [150, 170], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        AND 145 MORE...
      </div>
    </AbsoluteFill>
  );
};

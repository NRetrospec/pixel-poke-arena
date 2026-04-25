import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SUNSET } from "../constants";

type Props = {
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  gradient?: boolean;
  glow?: boolean;
  exitAt?: number;
  align?: "left" | "center" | "right";
  lineHeight?: number;
};

export const TextCard: React.FC<Props> = ({
  text,
  delay = 0,
  fontSize = 80,
  color = C.text,
  gradient = false,
  glow = false,
  exitAt = 99999,
  align = "center",
  lineHeight = 1.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const exitOpacity = interpolate(frame, [exitAt - 12, exitAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(entrance, [0, 1], [50, 0]);
  const opacity = Math.min(1, entrance * 2) * exitOpacity;

  const gradientStyle: React.CSSProperties = gradient
    ? {
        background: SUNSET,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color };

  const glowStyle: React.CSSProperties = glow
    ? {
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
      }
    : {};

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize,
        lineHeight,
        textAlign: align,
        transform: `translateY(${translateY}px)`,
        opacity,
        ...gradientStyle,
        ...(gradient ? {} : glowStyle),
      }}
    >
      {text}
    </div>
  );
};

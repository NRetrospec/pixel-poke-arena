import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, CARD_GRAD, FONT, SPRITE_URL, TYPE_COLORS, Card } from "../constants";

type Props = {
  card: Card;
  delay?: number;
  w?: number;
  showAbility?: boolean;
  flipX?: boolean;
  glowIntensity?: number;
};

export const PokemonCardMock: React.FC<Props> = ({
  card,
  delay = 0,
  w = 200,
  showAbility = false,
  flipX = false,
  glowIntensity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = TYPE_COLORS[card.type] ?? "#9ca3af";
  const h = Math.round(w * 1.38);

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const scale = entrance;
  const opacity = Math.min(1, entrance * 2);
  const fontSize = (mult: number) => Math.max(10, Math.floor(w * mult));

  return (
    <div
      style={{
        width: w,
        height: h,
        background: CARD_GRAD,
        border: `2px solid ${tc}`,
        borderRadius: 4,
        overflow: "hidden",
        transform: `scale(${scale})`,
        opacity,
        boxShadow: `0 0 ${20 * glowIntensity}px ${tc}66, 0 0 ${40 * glowIntensity}px ${tc}22, inset 0 0 20px ${tc}0a`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Type accent stripe */}
      <div style={{ width: "100%", height: 3, background: tc, flexShrink: 0 }} />

      {/* Cost dots */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "5px 8px 2px",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: i < card.cost ? tc : "transparent",
              border: `1.5px solid ${tc}`,
              boxShadow: i < card.cost ? `0 0 6px ${tc}` : "none",
            }}
          />
        ))}
      </div>

      {/* Sprite */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={SPRITE_URL(card.id)}
          style={{
            width: w * 0.6,
            height: w * 0.6,
            imageRendering: "pixelated",
            filter: `drop-shadow(0 2px 10px ${tc}aa)`,
            transform: flipX ? "scaleX(-1)" : "none",
          }}
        />
      </div>

      {/* Name bar */}
      <div
        style={{
          backgroundColor: `${tc}22`,
          padding: "4px 8px",
          borderTop: `1px solid ${tc}44`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: fontSize(0.062),
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.name}
        </div>
      </div>

      {/* Stats 2×2 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          padding: "4px 8px 6px",
          backgroundColor: "rgba(0,0,0,0.25)",
          flexShrink: 0,
        }}
      >
        {(
          [
            ["HP", card.hp],
            ["ATK", card.atk],
            ["DEF", card.def],
            ["SPD", card.spd],
          ] as [string, number][]
        ).map(([lbl, val]) => (
          <div key={lbl} style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span
              style={{
                fontFamily: FONT,
                fontSize: fontSize(0.045),
                color: C.textDim,
              }}
            >
              {lbl}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: fontSize(0.048),
                color: tc,
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Ability badge */}
      {showAbility && card.ability && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 0,
            backgroundColor: tc,
            color: "#000",
            fontFamily: FONT,
            fontSize: fontSize(0.042),
            padding: "2px 6px",
            borderRadius: "0 2px 2px 0",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          }}
        >
          {card.ability}
        </div>
      )}
    </div>
  );
};

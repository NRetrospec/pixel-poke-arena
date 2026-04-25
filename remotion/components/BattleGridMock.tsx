import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, SPRITE_URL, TYPE_COLORS } from "../constants";

export type GridCard = {
  id: number;
  name: string;
  type: string;
  hp: number;
  maxHp: number;
};

type SlotProps = {
  card: GridCard | null;
  delay: number;
  isPlayer: boolean;
  attackOffset?: number;
  flashRed?: number;
};

const Slot: React.FC<SlotProps> = ({
  card,
  delay,
  isPlayer,
  attackOffset = 0,
  flashRed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tc = card ? (TYPE_COLORS[card.type] ?? "#9ca3af") : C.muted;

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const pct = card ? card.hp / card.maxHp : 1;
  const barColor =
    pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        backgroundColor: card ? `${tc}18` : `${C.muted}14`,
        border: `2px solid ${card ? tc : C.muted}`,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${card ? entrance : 1}) translateX(${attackOffset}px)`,
        boxShadow: card ? `0 0 14px ${tc}55` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {card ? (
        <>
          {/* Red flash on hit */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#ef4444",
              opacity: flashRed * 0.6,
              pointerEvents: "none",
            }}
          />
          <Img
            src={SPRITE_URL(card.id)}
            style={{
              width: "68%",
              height: "68%",
              imageRendering: "pixelated",
              transform: isPlayer ? "scaleX(-1)" : "none",
              filter: `drop-shadow(0 0 5px ${tc}88)`,
            }}
          />
          {/* HP mini-bar */}
          <div
            style={{
              position: "absolute",
              bottom: 3,
              left: 5,
              right: 5,
              height: 4,
              backgroundColor: C.muted,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct * 100}%`,
                height: "100%",
                backgroundColor: barColor,
              }}
            />
          </div>
        </>
      ) : (
        <span
          style={{ fontFamily: FONT, fontSize: 12, color: C.muted, opacity: 0.35 }}
        >
          +
        </span>
      )}
    </div>
  );
};

type Props = {
  grid: (GridCard | null)[];
  cols: number;
  rows: number;
  opponentRows: number;
  attackSlot?: number;
  attackProgress?: number;
  hitSlot?: number;
  flashProgress?: number;
  slotSize?: number;
};

export const BattleGridMock: React.FC<Props> = ({
  grid,
  cols,
  rows,
  opponentRows,
  attackSlot,
  attackProgress = 0,
  hitSlot,
  flashProgress = 0,
  slotSize = 160,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${slotSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${slotSize}px)`,
        gap: 10,
      }}
    >
      {grid.map((card, i) => {
        const row = Math.floor(i / cols);
        const isPlayer = row >= opponentRows;
        const col = i % cols;

        // attack: horizontal lunge toward opponent column
        let attackOffset = 0;
        if (attackSlot === i) {
          attackOffset = interpolate(
            attackProgress,
            [0, 0.4, 0.7, 1],
            [0, isPlayer ? -120 : 120, isPlayer ? -120 : 120, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
        }

        const flashRed = hitSlot === i ? flashProgress : 0;

        return (
          <Slot
            key={i}
            card={card}
            delay={20 + i * 4}
            isPlayer={isPlayer}
            attackOffset={attackOffset}
            flashRed={flashRed}
          />
        );
      })}
    </div>
  );
};

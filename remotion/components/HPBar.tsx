import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../constants";

type Props = {
  label: string;
  startHp: number;
  endHp: number;
  maxHp: number;
  drainStart: number;
  drainEnd: number;
  width?: number;
};

export const HPBar: React.FC<Props> = ({
  label,
  startHp,
  endHp,
  maxHp,
  drainStart,
  drainEnd,
  width = 400,
}) => {
  const frame = useCurrentFrame();
  const hp = Math.max(
    0,
    drainStart === drainEnd
      ? startHp
      : Math.round(
          interpolate(frame, [drainStart, drainEnd], [startHp, endHp], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        )
  );
  const pct = hp / maxHp;
  const barColor =
    pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#eab308" : "#ef4444";
  const flash =
    pct < 0.2 ? (Math.floor(frame / 8) % 2 === 0 ? 1 : 0.35) : 1;

  return (
    <div style={{ width, fontFamily: FONT }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          color: C.text,
          marginBottom: 8,
          opacity: flash,
        }}
      >
        <span>{label}</span>
        <span>
          {hp}/{maxHp}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 20,
          backgroundColor: C.muted,
          border: `2px solid ${C.muted}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            backgroundColor: barColor,
            boxShadow: `0 0 12px ${barColor}`,
            opacity: flash,
          }}
        />
      </div>
    </div>
  );
};

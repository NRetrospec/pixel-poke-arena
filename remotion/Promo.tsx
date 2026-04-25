import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { C } from "./constants";
import { HookScene } from "./scenes/HookScene";
import { ContextScene } from "./scenes/ContextScene";
import { FeatureReelScene } from "./scenes/FeatureReelScene";
import { HeroScene } from "./scenes/HeroScene";
import { CTAScene } from "./scenes/CTAScene";

// Storyboard (all frame ranges reference global timeline at 30fps):
//
//  0– 89  (0–3s)   Hook          — "STOP SCROLLING. START BATTLING."
//  90–299  (3–10s)  Context       — 151 Pokémon card cascade
// 300–599  (10–20s) Feature Reel  — Deck Builder → Battlefield → Combat
// 600–809  (20–27s) Hero          — Epic battle, DOUBLE DAMAGE!, HP drain
// 810–899  (27–30s) CTA           — Logo burst + PLAY FREE NOW

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Sequence from={0} durationInFrames={90} premountFor={0}>
        <HookScene />
      </Sequence>

      <Sequence from={90} durationInFrames={210} premountFor={30}>
        <ContextScene />
      </Sequence>

      <Sequence from={300} durationInFrames={300} premountFor={30}>
        <FeatureReelScene />
      </Sequence>

      <Sequence from={600} durationInFrames={210} premountFor={30}>
        <HeroScene />
      </Sequence>

      <Sequence from={810} durationInFrames={90} premountFor={30}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

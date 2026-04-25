import { useRef, useEffect } from 'react';
import { PokemonCard, AnimState } from '@/types/pokemon';
import { useAnimationLoop } from '@/hooks/useAnimationLoop';

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * Math.min(Math.max(t, 0), 1);

interface Props {
  pokemon: PokemonCard;
  animState: AnimState;
  className?: string;
  style?: React.CSSProperties;
}

export const PokemonSprite = ({ pokemon, animState, className = '', style }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgLoadedRef = useRef(false);
  const stateTimeRef = useRef(0);
  // Refs so the rAF closure always reads the latest values without re-creating the loop
  const animStateRef = useRef<AnimState>(animState);
  const prevAnimStateRef = useRef<AnimState>(animState);
  animStateRef.current = animState;

  useEffect(() => {
    imgLoadedRef.current = false;
    const img = new Image();
    img.onload = () => { imgLoadedRef.current = true; };
    img.src = pokemon.animatedSprite || pokemon.sprite;
    imgRef.current = img;
  }, [pokemon.animatedSprite, pokemon.sprite]);

  useAnimationLoop((dt: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoadedRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = animStateRef.current;

    // Detect state change → reset elapsed timer
    if (state !== prevAnimStateRef.current) {
      stateTimeRef.current = 0;
      prevAnimStateRef.current = state;
    }
    stateTimeRef.current += dt;
    const t = stateTimeRef.current;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();

    let tx = 0, ty = 0, sx = 1, sy = 1, angle = 0, alpha = 1;
    let showRed = false, redA = 0;

    switch (state) {
      case 'idle': {
        ty = Math.sin(t * 0.002) * 3;
        const b = 1 + Math.sin(t * 0.001) * 0.02;
        sx = b; sy = b;
        break;
      }
      case 'attack': {
        if (t < 150) {
          tx = lerp(0, -10, t / 150);
        } else if (t < 400) {
          const p = (t - 150) / 250;
          tx = lerp(-10, 28, p);
          const sq = Math.sin(p * Math.PI);
          sx = 1 - 0.15 * sq;
          sy = 1 + 0.15 * sq;
        } else if (t < 800) {
          tx = lerp(28, 0, (t - 400) / 400);
        }
        break;
      }
      case 'hit': {
        const p = Math.min(t / 400, 1);
        // Decaying oscillation for knockback feel
        tx = -18 * (1 - p) * Math.cos(p * Math.PI * 2);
        if (t < 300) {
          showRed = true;
          redA = 0.6 * (1 - t / 300);
        }
        // Random screen shake applied to canvas element
        if (t < 250) {
          const s = 4 * (1 - t / 250);
          canvas.style.transform = `translate(${(Math.random() - 0.5) * s * 2}px,${(Math.random() - 0.5) * s * 2}px)`;
        } else {
          canvas.style.transform = '';
        }
        break;
      }
      case 'faint': {
        const p = Math.min(t / 800, 1);
        angle = p * (Math.PI / 2);
        ty = p * H * 0.4;
        alpha = 1 - p;
        break;
      }
      case 'move': {
        const p = Math.min(t / 300, 1);
        const lean = Math.sin(p * Math.PI);
        sx = 1 - lean * 0.08;
        sy = 1 + lean * 0.12;
        ty = -lean * 3;
        break;
      }
    }

    if (state !== 'hit') canvas.style.transform = '';

    ctx.globalAlpha = alpha;
    ctx.translate(W / 2 + tx, H / 2 + ty);
    ctx.rotate(angle);
    ctx.scale(sx, sy);
    ctx.drawImage(img, -W / 2, -H / 2, W, H);

    // Red flash overlay via source-atop composite
    if (showRed) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = redA;
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(-W / 2, -H / 2, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  });

  return (
    <canvas
      ref={canvasRef}
      width={96}
      height={96}
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    />
  );
};

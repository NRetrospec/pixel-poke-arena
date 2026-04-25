import { useEffect, useRef } from 'react';

export const useAnimationLoop = (callback: (dt: number) => void) => {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  // Always keep the ref pointing at the latest callback (updated each render)
  callbackRef.current = callback;

  useEffect(() => {
    const loop = (timestamp: number) => {
      const dt = lastTimeRef.current
        ? Math.min(timestamp - lastTimeRef.current, 50)
        : 16;
      lastTimeRef.current = timestamp;
      callbackRef.current(dt);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
};

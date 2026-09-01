import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric value counting up from 0 (or its previous value) to
 * `target` whenever `target` changes. Used for stat-card figures so numbers
 * arrive with a bit of life instead of snapping in. Non-numeric targets are
 * returned unchanged (callers pass whole formatted strings for those).
 */
export default function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();
  const startRef = useRef();
  const fromRef = useRef(0);

  useEffect(() => {
    const to = Number(target);
    if (Number.isNaN(to)) {
      setValue(target);
      return undefined;
    }

    fromRef.current = 0;
    startRef.current = null;

    const step = (timestamp) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(fromRef.current + (to - fromRef.current) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

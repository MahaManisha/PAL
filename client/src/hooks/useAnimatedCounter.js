// Hook: useAnimatedCounter
// Reusable animated count-up hook respecting prefers-reduced-motion and accessibility.
import { useState, useEffect } from 'react';

const useAnimatedCounter = (target, duration = 2000, startTrigger = false) => {
  const [count, setCount] = useState(0);
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!startTrigger) return;
    if (prefersReduced) {
      setCount(target);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startTrigger, prefersReduced]);

  return count;
};

export default useAnimatedCounter;

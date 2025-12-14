import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const useScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positionsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const positions = positionsRef.current;
    return () => {
      positions.set(location.key, window.scrollY);
    };
  }, [location.key]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = positionsRef.current.get(location.key);
    const shouldRestore = navigationType === "POP" && typeof saved === "number";

    if (shouldRestore) {
      const targetY = saved;
      const start = window.performance?.now?.() ?? Date.now();
      const maxDurationMs = 1200;
      let raf = 0;

      const step = () => {
        window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
        if (Math.abs(window.scrollY - targetY) <= 2) return;
        const now = window.performance?.now?.() ?? Date.now();
        if (now - start > maxDurationMs) return;
        raf = window.requestAnimationFrame(step);
      };

      step();
      return () => window.cancelAnimationFrame(raf);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [location.key, navigationType]);
};

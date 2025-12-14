import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useSettings } from "../../store/settingsContext";

const SCROLL_THRESHOLD = 640;

export const ScrollToTopFab = () => {
  const { musicEnabled } = useSettings();
  const [musicCollapsed] = useLocalStorage<boolean>("lovestory:music-collapsed", false);
  const [visible, setVisible] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > SCROLL_THRESHOLD : false,
  );

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bottomClass = musicEnabled ? (musicCollapsed ? "bottom-32" : "bottom-48") : "bottom-6";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed right-4 ${bottomClass} z-40 rounded-full border border-line/15 bg-paper/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground shadow-paper backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-polaroid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}
          aria-label="Lên đầu trang"
        >
          ↑ Lên đầu
        </motion.button>
      )}
    </AnimatePresence>
  );
};


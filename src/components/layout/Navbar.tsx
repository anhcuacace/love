import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useSettings } from "../../store/settingsContext";

const navItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Bảng dán", path: "/board" },
  { label: "Hành trình", path: "/our-story" },
  { label: "Album của em", path: "/her-gallery" },
  { label: "Album chung", path: "/our-gallery" },
  { label: "Bản đồ", path: "/memories-map" },
  { label: "Thư", path: "/letters" },
  { label: "Trò chơi", path: "/games" },
  { label: "Cài đặt", path: "/settings" },
];

const themeEmojis = {
  scrapbook: "📷",
  light: "☀️",
  dark: "🌙",
  romantic: "💖",
};

const canPrefetch = () => {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } })
    .connection;
  if (connection?.saveData) return false;
  if (typeof connection?.effectiveType === "string" && connection.effectiveType.includes("2g")) {
    return false;
  }
  return true;
};

const prefetchRoute = (path: string) => {
  switch (path) {
    case "/":
      void import("../sections/Home/HomePage");
      break;
    case "/board":
      void import("../sections/Board/BoardPage");
      break;
    case "/our-story":
      void import("../sections/OurStory/OurStoryPage");
      break;
    case "/her-gallery":
      void import("../sections/HerGallery/HerGalleryPage");
      break;
    case "/our-gallery":
      void import("../sections/OurGallery/OurGalleryPage");
      break;
    case "/memories-map":
      void import("../sections/MemoriesMap/MemoriesMapPage");
      break;
    case "/letters":
      void import("../sections/Letters/LettersPage");
      break;
    case "/games":
      void import("../sections/Games/GamesPage");
      break;
    case "/settings":
      void import("../sections/Settings/SettingsPage");
      break;
    default:
      break;
  }
};

export const Navbar = () => {
  const { theme, setTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const cycleTheme = () => {
    const order = ["scrapbook", "light", "dark", "romantic"] as const;
    const currentIndex = order.indexOf(theme);
    const nextTheme = order[(currentIndex + 1) % order.length];
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!canPrefetch()) return;

    navItems.forEach((item) => prefetchRoute(item.path));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const root = headerRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-line/15 bg-paper/80 backdrop-blur-sm"
    >
      <div className="container-responsive flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
            {themeEmojis[theme]}
          </div>
          <div className="leading-tight">
            <div>Our Love Story</div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Album kỷ niệm
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => prefetchRoute(item.path)}
              onFocus={() => prefetchRoute(item.path)}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-semibold transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  isActive ? "bg-accent-soft text-accent" : "text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("lovestory:open-command-palette"))}
            className="hidden items-center gap-2 rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:flex"
            aria-label="Tìm nhanh (Ctrl/⌘K)"
          >
            <span className="hidden lg:inline">Tìm nhanh</span>
            <span className="rounded-md border border-line/15 bg-surface/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Ctrl/⌘ K
            </span>
          </button>
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Đổi giao diện (hiện tại: ${theme})`}
            className="flex items-center gap-2 rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm text-foreground shadow-sm transition hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="text-base">{themeEmojis[theme]}</span>
            <span className="hidden sm:inline">Giao diện</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/15 bg-paper text-foreground shadow-sm transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <span className="text-sm font-semibold">
              {open ? "Đóng" : "Menu"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            id="mobile-nav"
            className="border-t border-line/15 bg-paper/95 md:hidden"
          >
            <div className="container-responsive flex flex-col gap-2 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      isActive ? "border-accent/40 bg-accent-soft text-accent" : "text-foreground"
                    }`
                  }
                  onMouseEnter={() => prefetchRoute(item.path)}
                  onFocus={() => prefetchRoute(item.path)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

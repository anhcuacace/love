import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { useScrollManager } from "../hooks/useScrollManager";
import { Footer } from "../components/layout/Footer";
import { MusicDock } from "../components/layout/MusicDock";
import { Navbar } from "../components/layout/Navbar";
import { CommandPalette } from "../components/layout/CommandPalette";
import { RouteLoading } from "../components/layout/RouteLoading";
import { ScrollToTopFab } from "../components/layout/ScrollToTopFab";
import { useSettings } from "../store/settingsContext";

const BoardPage = lazy(() =>
  import("../components/sections/Board/BoardPage").then((module) => ({
    default: module.BoardPage,
  })),
);
const HomePage = lazy(() =>
  import("../components/sections/Home/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);
const OurStoryPage = lazy(() =>
  import("../components/sections/OurStory/OurStoryPage").then((module) => ({
    default: module.OurStoryPage,
  })),
);
const HerGalleryPage = lazy(() =>
  import("../components/sections/HerGallery/HerGalleryPage").then((module) => ({
    default: module.HerGalleryPage,
  })),
);
const OurGalleryPage = lazy(() =>
  import("../components/sections/OurGallery/OurGalleryPage").then((module) => ({
    default: module.OurGalleryPage,
  })),
);
const MemoriesMapPage = lazy(() =>
  import("../components/sections/MemoriesMap/MemoriesMapPage").then((module) => ({
    default: module.MemoriesMapPage,
  })),
);
const LettersPage = lazy(() =>
  import("../components/sections/Letters/LettersPage").then((module) => ({
    default: module.LettersPage,
  })),
);
const GamesPage = lazy(() =>
  import("../components/sections/Games/GamesPage").then((module) => ({
    default: module.GamesPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../components/sections/Settings/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../components/sections/NotFound/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);

const ScrollManager = () => {
  useScrollManager();
  return null;
};

const RouterShell = () => {
  const { musicEnabled } = useSettings();
  const [musicCollapsed] = useLocalStorage<boolean>("lovestory:music-collapsed", false);
  const bottomPadding = musicEnabled ? (musicCollapsed ? "pb-28" : "pb-40") : "";
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <a
        href="#main"
        onClick={() => {
          const main = document.getElementById("main");
          if (main instanceof HTMLElement) main.focus();
        }}
        className="sr-only z-50 rounded-xl border border-line/15 bg-paper px-4 py-2 text-sm font-semibold text-foreground shadow-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        Bỏ qua điều hướng
      </a>
      <Navbar key={pathname} />
      <main id="main" tabIndex={-1} className={`flex-1 outline-none ${bottomPadding}`}>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/her-gallery" element={<HerGalleryPage />} />
            <Route path="/our-gallery" element={<OurGalleryPage />} />
            <Route path="/memories-map" element={<MemoriesMapPage />} />
            <Route path="/letters" element={<LettersPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MusicDock />
      <ScrollToTopFab />
      <CommandPalette />
    </div>
  );
};

export const AppRouter = () => {
  const baseUrl = import.meta.env.BASE_URL;
  const basename = baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

  return (
    <BrowserRouter basename={basename}>
      <ScrollManager />
      <RouterShell />
    </BrowserRouter>
  );
};

# Our Love Story — Polaroid Scrapbook SPA (React + Vite)

Static SPA theo phong cách **Polaroid Scrapbook** để lưu giữ kỷ niệm: dòng thời gian, album, bản đồ kỷ niệm, thư và trò chơi nhỏ. Build cho GitHub Pages với React 19, TypeScript, Vite, TailwindCSS, React Router và Framer Motion.

## Quick start

```bash
npm install
npm run dev      # chạy dev server
npm run build    # type-check + build production
npm run preview  # xem thử bản build
```

## Deploying to GitHub Pages

Repo đã có sẵn workflow deploy ở `.github/workflows/deploy-pages.yml`.

1. Push code lên GitHub (branch `main` hoặc `master`).
2. Vào **Settings → Pages → Build and deployment** chọn **Source: GitHub Actions**.
3. Mỗi lần push, GitHub Actions sẽ:
   - Build Vite với `base` tự động (repo pages: `/<repo>/`, user pages: `/`)
   - Copy `dist/index.html` → `dist/404.html` để deep-link React Router hoạt động trên GitHub Pages
   - Deploy `dist/` lên GitHub Pages

## Project structure

- `src/main.tsx`: Mounts the app, wraps `SettingsProvider`, loads global styles.
- `src/App.tsx`: Renders the router shell.
- `src/routes/AppRouter.tsx`: Defines all routes and shared layout (navbar, footer, scroll-to-top).
- `src/store/settingsProvider.tsx`: Applies theme class to `<html>`, persists theme/language/music via localStorage.
- `src/store/settingsContext.ts`: Context + types (`Theme`, `Language`) + `useSettings()`.
- `src/hooks/useLocalStorage.ts`, `src/hooks/useScrollToTop.ts`: Reusable hooks.
- `src/styles/globals.css`: Tailwind setup, scrapbook tokens (paper/ink), fonts, helpers (incl. `.torn-bottom` torn-paper utility).
- `src/components/layout/*`: `Navbar`, `Footer`, `PageContainer` wrappers.
- `src/components/common/*`: `Button`, `Card`, `SectionTitle`, `Modal`, `Polaroid`, `Sticker`, `StickyNote`.
- `src/components/sections/*`: Pages for Home, Board (scrapbook), Our Story, Her Gallery, Our Gallery, Memories Map, Letters, Games, Settings + `NotFound` (all responsive and wired to sample data/state).
- `src/data/*.sample.json`: Sample data for timeline, galleries, letters, places, quotes.

## Scrapbook UI

- `Polaroid`, `Sticker`, `StickyNote`: các building blocks kiểu scrapbook.
- Her Gallery dùng layout collage/masonry (CSS columns + `break-inside-avoid`) để ảnh trông “xếp album” tự nhiên hơn.
- Utility `.torn-bottom` tạo hiệu ứng “xé giấy” cho panel/filter.

## Theming & settings

- Themes: `scrapbook | light | dark | romantic` (default `scrapbook`) applied as classes on `<html>` (`theme-scrapbook`, etc.) to swap CSS variables.
- Language: `vi | en` stored for later i18n wiring (UI hiện ưu tiên tiếng Việt).
- Music: `MusicDock` (play/pause, next/prev, shuffle/loop, volume, playlist) và lưu state vào localStorage.
- All persisted via `useLocalStorage`; update UI through `useSettings()`.

## Adding features next

- Replace sample JSON with real content or fetch static JSON; shape is illustrated in `src/data/*.sample.json`.
- Add real map (Leaflet/MapLibre) + markers/popup instead of the current layout demo.
- Flesh out mini games (quiz/puzzle) và thêm các tính năng “xuất/nhập” scrapbook (export JSON/image) nếu cần.
- Polish scrapbook UI: washi tape, torn paper edges, more sticker variants.

Feel free to extend components in `components/common` for shared UI patterns and keep pages wrapped in `PageContainer` for consistent spacing and document titles.

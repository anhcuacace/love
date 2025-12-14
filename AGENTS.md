# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Front-end source. Key areas: `components/layout` (chrome), `components/common` (shared UI), `components/sections/*` (pages), `routes/AppRouter.tsx` (routing), `store/settingsContext.tsx` (global state), `hooks/*`, `styles/globals.css` (Tailwind + tokens), `data/*.sample.json` (dummy content).
- Config: `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, `vite.config.ts`, `index.html`.
- Assets: place static files in `public/` and reference as `/file.ext`.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — Vite dev server with HMR.
- `npm run build` — type-check (tsc -b) then production bundle.
- `npm run preview` — serve the production bundle locally.
- `npm run lint` — ESLint (Vite React defaults).

## Coding Style & Naming Conventions
- Stack: React 18 + TypeScript + Tailwind; prefer functional components and hooks.
- Styling: favor Tailwind utilities; colors derive from CSS variables in `globals.css`. Avoid ad-hoc inline styles when a utility exists.
- Naming: components PascalCase; hooks `useSomething`; section files mirror routes; sample data ends with `.sample.json`.
- Indentation: 2 spaces; keep imports grouped (libs, then local). Use `// TODO:` for planned work.

## Testing Guidelines
- No formal tests yet. When adding, co-locate (e.g., `Component.test.tsx`) and use Vitest + React Testing Library.
- Aim for smoke coverage on routes and critical hooks (settings persistence) once tests exist.

## Commit & Pull Request Guidelines
- Commits: clear, imperative summaries (e.g., `Add settings context`, `Style navbar`, `Wire sample data`). Group related changes; avoid noisy formatting-only commits.
- PRs: include a short description, screenshots/GIFs for UI updates, steps to verify (commands run), and link issues when relevant. Note remaining TODOs in the body.

## Security & Configuration Tips
- No backend; never commit secrets. For map/music keys, use env vars or config files ignored by git.
- Optimize public assets (WebP/AVIF preferred) for GitHub Pages. If deploying to a subpath, set `base` in `vite.config.ts`.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
const resolveBase = () => {
  if (process.env.VITE_BASE) return process.env.VITE_BASE;

  const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  const isGithubActions = Boolean(process.env.GITHUB_ACTIONS);
  const isUserSite = Boolean(repo && repo.endsWith(".github.io"));

  if (isGithubActions && repo && !isUserSite) return `/${repo}/`;

  return "/";
};

export default defineConfig(() => ({
  base: resolveBase(),
  plugins: [react()],
}));

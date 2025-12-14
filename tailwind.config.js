/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['"Space Grotesk"', "sans-serif"],
        hand: ['"Caveat"', "cursive"],
      },
      colors: {
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        accentSoft: "var(--color-accent-soft)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      boxShadow: {
        glow: "0 12px 50px rgb(var(--color-accent) / 0.25)",
        paper: "0 16px 40px rgba(15, 23, 42, 0.14)",
        polaroid: "0 18px 55px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        "romantic-gradient":
          "radial-gradient(circle at 20% 20%, rgba(255, 209, 220, 0.35), transparent 35%), radial-gradient(circle at 80% 0%, rgba(165, 180, 252, 0.35), transparent 30%), linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #0f172a 100%)",
      },
    },
  },
  plugins: [],
}

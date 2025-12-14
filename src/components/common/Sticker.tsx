import type { ReactNode } from "react";

const variants = {
  accent: "bg-accent-soft text-accent border border-line/10",
  paper: "bg-paper text-foreground border border-line/15",
  ink: "bg-foreground/85 text-paper border border-line/10",
  lemon: "bg-amber-200/70 text-amber-950 border border-line/10",
  mint: "bg-emerald-200/70 text-emerald-950 border border-line/10",
  sky: "bg-sky-200/70 text-sky-950 border border-line/10",
  rose: "bg-rose-200/70 text-rose-950 border border-line/10",
  lavender: "bg-violet-200/70 text-violet-950 border border-line/10",
} as const;

type StickerProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export const Sticker = ({ children, variant = "accent", className }: StickerProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-sm ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
};

import type { ReactNode } from "react";

const variantClasses = {
  lemon: "bg-amber-100 text-amber-950",
  mint: "bg-emerald-100 text-emerald-950",
  sky: "bg-sky-100 text-sky-950",
  accent: "bg-accent-soft text-foreground",
  paper: "bg-paper text-foreground",
} as const;

const tiltClasses = {
  none: "rotate-0",
  left: "-rotate-1",
  right: "rotate-1",
} as const;

type StickyNoteProps = {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: keyof typeof variantClasses;
  tilt?: keyof typeof tiltClasses;
  showTape?: boolean;
  className?: string;
};

export const StickyNote = ({
  eyebrow,
  title,
  children,
  footer,
  variant = "lemon",
  tilt = "left",
  showTape = true,
  className,
}: StickyNoteProps) => {
  const tapeClasses = showTape
    ? "before:content-[''] before:absolute before:left-1/2 before:-top-4 before:h-7 before:w-28 before:-translate-x-1/2 before:rotate-[-2deg] before:rounded-md before:bg-white/40 before:border before:border-line/10 before:shadow-sm before:opacity-90"
    : "";

  return (
    <aside
      className={`relative ${tiltClasses[tilt]} rounded-2xl border border-line/15 p-4 shadow-paper ${variantClasses[variant]} ${tapeClasses} after:content-[''] after:absolute after:right-3 after:top-3 after:h-8 after:w-8 after:bg-white/35 after:shadow-sm after:opacity-70 after:[clip-path:polygon(0_0,100%_0,100%_100%)] ${className ?? ""}`}
    >
      {eyebrow && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70">
          {eyebrow}
        </div>
      )}
      {title && (
        <div className="mt-1 font-hand text-2xl leading-snug">{title}</div>
      )}
      {children && <div className="mt-3 space-y-2 text-sm">{children}</div>}
      {footer && <div className="mt-3">{footer}</div>}
    </aside>
  );
};


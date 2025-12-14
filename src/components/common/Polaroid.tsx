import type { KeyboardEvent, ReactNode } from "react";

const tiltClasses = [
  "-rotate-2",
  "-rotate-1",
  "rotate-0",
  "rotate-1",
  "rotate-2",
] as const;

const hashSeed = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(hash);
};

type PolaroidProps = {
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  tiltSeed?: string;
  showTape?: boolean;
  className?: string;
  aspectClassName?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

export const Polaroid = ({
  src,
  alt,
  caption,
  meta,
  badge,
  footer,
  onClick,
  tiltSeed,
  showTape = true,
  className,
  aspectClassName,
  imageClassName,
  loading = "lazy",
}: PolaroidProps) => {
  const hasDetails = Boolean(meta || caption || footer);
  const tilt =
    tiltSeed && tiltSeed.length > 0
      ? tiltClasses[hashSeed(tiltSeed) % tiltClasses.length]
      : "rotate-0";

  const tapeClasses = showTape
    ? "before:content-[''] before:absolute before:left-10 before:-top-4 before:h-7 before:w-28 before:rotate-[-8deg] before:rounded-md before:bg-amber-200/70 before:shadow-sm before:border before:border-line/10 before:opacity-90 after:content-[''] after:absolute after:right-10 after:-top-4 after:h-7 after:w-28 after:rotate-[10deg] after:rounded-md after:bg-sky-200/60 after:shadow-sm after:border after:border-line/10 after:opacity-80"
    : "";

  const interactiveClasses = onClick
    ? "cursor-pointer transition hover:-translate-y-1 hover:shadow-polaroid"
    : "";

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.currentTarget !== event.target) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <figure
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? caption ?? alt : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative ${tilt} rounded-2xl border border-line/15 bg-paper p-4 shadow-paper outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${tapeClasses} ${interactiveClasses} ${className ?? ""}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-line/10 bg-surface">
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`${aspectClassName ?? "aspect-[4/5]"} w-full object-cover ${imageClassName ?? ""}`}
        />
        {badge && <div className="absolute left-3 top-3">{badge}</div>}
      </div>

      {hasDetails && (
        <div className="mt-3 space-y-1">
          {meta && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
              {meta}
            </div>
          )}
          {caption && (
            <figcaption className="font-hand text-xl text-foreground">
              {caption}
            </figcaption>
          )}
          {footer && <div className="pt-1">{footer}</div>}
        </div>
      )}
    </figure>
  );
};

import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Card = ({
  title,
  description,
  actions,
  children,
  className,
}: CardProps) => {
  return (
    <div
      className={`glass-card rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-paper ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children && <div className="mt-4 space-y-3 text-sm text-foreground">{children}</div>}
    </div>
  );
};

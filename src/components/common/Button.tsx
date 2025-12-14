import type React from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const variantClasses = {
  primary:
    "bg-accent text-surface shadow-paper hover:-translate-y-0.5 hover:shadow-polaroid active:translate-y-0",
  secondary:
    "border border-line/15 bg-paper text-foreground shadow-sm hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-paper active:translate-y-0",
  ghost: "text-foreground underline underline-offset-4 decoration-line/30 hover:text-accent hover:decoration-accent/40",
};

type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
  to?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  children,
  variant = "primary",
  className,
  to,
  type,
  ...rest
}: ButtonProps) => {
  const classes = `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className ?? ""}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {children}
    </button>
  );
};

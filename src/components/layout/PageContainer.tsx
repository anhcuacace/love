import { useEffect } from "react";
import type { ReactNode } from "react";

interface PageContainerProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ title, children, className }: PageContainerProps) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Our Love Story`;
    }
  }, [title]);

  return (
    <div className={`section-padding ${className ?? ""}`}>
      <div className="container-responsive space-y-10">{children}</div>
    </div>
  );
};

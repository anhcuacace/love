import { useEffect, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  initialFocusRef,
}: ModalProps) => {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKey);

    const raf = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? closeButtonRef.current;
      target?.focus();
    });

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.cancelAnimationFrame(raf);

      if (previousBodyOverflowRef.current !== null) {
        document.body.style.overflow = previousBodyOverflowRef.current;
      }
      previousBodyOverflowRef.current = null;

      const previous = previousFocusRef.current;
      previousFocusRef.current = null;
      previous?.focus?.();
    };
  }, [initialFocusRef, open]);

  if (!open) return null;

  const getFocusableElements = () => {
    const root = dialogRef.current;
    if (!root) return [];
    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    return elements.filter((element) => element.offsetParent !== null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : "Modal"}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        ref={dialogRef}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line/15 bg-paper p-6 shadow-polaroid"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusables = getFocusableElements();
          if (focusables.length === 0) {
            event.preventDefault();
            dialogRef.current?.focus();
            return;
          }

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;

          if (event.shiftKey) {
            if (active === first || active === dialogRef.current) {
              event.preventDefault();
              last?.focus();
            }
          } else if (active === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h3 id={titleId} className="text-xl font-semibold">
                {title}
              </h3>
            )}
            {subtitle && (
              <p id={subtitleId} className="text-xs uppercase tracking-[0.2em] text-muted">
                {subtitle}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line/15 bg-paper px-3 py-1 text-sm text-muted shadow-sm transition hover:border-accent/40 hover:text-foreground"
          >
            Đóng
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 text-sm text-foreground">
          <div className="space-y-4">{children}</div>
        </div>
        {footer && <div className="mt-6 flex shrink-0 justify-end">{footer}</div>}
      </div>
    </div>
  );
};

import { Component } from "react";
import type { ReactNode } from "react";

import { Button } from "./Button";
import { Sticker } from "./Sticker";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Unhandled error", error, errorInfo);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const showDetails = import.meta.env.DEV;

    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="torn-bottom rounded-3xl border border-line/15 bg-paper p-6 shadow-paper">
            <div className="flex flex-wrap items-center gap-3">
              <Sticker variant="rose">Có lỗi</Sticker>
              <p className="text-sm text-muted">
                Một lỗi không mong muốn đã xảy ra. Bạn có thể tải lại trang hoặc quay về trang chủ.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Tải lại
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.assign("/")}
              >
                Về trang chủ
              </Button>
            </div>

            {showDetails && (
              <pre className="mt-5 max-h-64 overflow-auto rounded-2xl border border-line/15 bg-surface/30 p-4 text-xs text-foreground">
                {error.stack ?? error.message}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
}


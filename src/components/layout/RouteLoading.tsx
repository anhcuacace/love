import { Sticker } from "../common/Sticker";

export const RouteLoading = () => {
  return (
    <div className="section-padding">
      <div className="container-responsive">
        <div
          className="torn-bottom rounded-3xl border border-line/15 bg-paper p-6 shadow-paper"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Sticker variant="lemon">Đang tải</Sticker>
            <p className="text-sm text-muted">Một chút thôi…</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-2xl border border-line/10 bg-surface/30" />
            <div className="h-24 animate-pulse rounded-2xl border border-line/10 bg-surface/30" />
          </div>
        </div>
      </div>
    </div>
  );
};


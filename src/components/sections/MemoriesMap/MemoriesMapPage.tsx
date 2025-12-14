import { useMemo, useState } from "react";

import placesData from "../../../data/places.sample.json";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { SectionTitle } from "../../common/SectionTitle";
import { Sticker } from "../../common/Sticker";
import { PageContainer } from "../../layout/PageContainer";

type Place = {
  id: string;
  name: string;
  city: string;
  date: string;
  note: string;
  image?: string;
};

const markerPositions: Record<string, { x: number; y: number }> = {
  "place-1": { x: 46, y: 58 },
  "place-2": { x: 32, y: 32 },
  "place-3": { x: 66, y: 74 },
};

const formatDate = (input: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(input));

export const MemoriesMapPage = () => {
  const places = placesData as Place[];
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(places[0]?.id ?? null);

  const cities = useMemo(() => {
    const uniq = new Set<string>();
    places.forEach((place) => uniq.add(place.city));
    return Array.from(uniq);
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return places
      .filter((place) => cityFilter === "all" || place.city === cityFilter)
      .filter((place) => {
        if (!term) return true;
        return (
          place.name.toLowerCase().includes(term) ||
          place.note.toLowerCase().includes(term) ||
          place.city.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cityFilter, places, searchTerm]);

  const effectiveActiveId = useMemo(() => {
    if (filteredPlaces.length === 0) return null;
    if (activeId && filteredPlaces.some((place) => place.id === activeId)) {
      return activeId;
    }
    return filteredPlaces[0]?.id ?? null;
  }, [activeId, filteredPlaces]);

  const activePlace =
    filteredPlaces.find((place) => place.id === effectiveActiveId) ?? filteredPlaces[0] ?? null;

  const stats = useMemo(() => {
    const sorted = [...places].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return {
      total: places.length,
      cities: cities.length,
      span:
        sorted.length > 0
          ? `${formatDate(sorted[0].date)} → ${formatDate(sorted[sorted.length - 1].date)}`
          : "Đang cập nhật",
    };
  }, [cities.length, places]);

  return (
    <PageContainer title="Bản đồ kỷ niệm">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Bản đồ"
          title="Những nơi đã qua"
          subtitle="Chọn thành phố, nhấp marker để xem chi tiết kỷ niệm."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Tổng địa điểm</p>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted">Số nơi đã ghé thăm</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Thành phố</p>
            <p className="text-2xl font-semibold text-foreground">{stats.cities}</p>
            <p className="text-xs text-muted">Số thành phố đã lưu</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Khoảng thời gian</p>
            <p className="text-sm text-foreground">{stats.span}</p>
          </div>
        </div>

        <div className="torn-bottom rounded-2xl border border-line/15 bg-paper p-4 shadow-paper md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Sticker variant="lemon">Bộ lọc</Sticker>
              <p className="text-sm text-muted">
                {filteredPlaces.length}/{places.length} địa điểm · chọn thành phố hoặc gõ từ khóa.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <label className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Tìm kiếm
              </label>
              <input
                type="search"
                placeholder="Tên nơi, thành phố, ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-line/15 bg-surface/30 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCityFilter("all")}
              aria-pressed={cityFilter === "all"}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                cityFilter === "all"
                  ? "bg-accent text-surface shadow-paper"
                  : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {cities.map((city) => {
              const active = cityFilter === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    active
                      ? "bg-accent text-surface shadow-paper"
                      : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-line/15 bg-paper shadow-paper">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.12),transparent_30%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(74,222,128,0.12),transparent_28%)]" />

            {filteredPlaces.length === 0 ? (
              <div className="relative z-10 flex h-full items-center justify-center text-center text-sm text-muted">
                Chưa có địa điểm nào cho bộ lọc hiện tại.
              </div>
            ) : (
              <>
                <div className="absolute inset-6 rounded-3xl border border-line/10" />
                {filteredPlaces.map((place, index) => {
                  const pos =
                    markerPositions[place.id] ?? {
                      x: 20 + (index * 18) % 60,
                      y: 25 + (index * 24) % 40,
                    };
                  const active = place.id === effectiveActiveId;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setActiveId(place.id)}
                      aria-pressed={active}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-semibold shadow-lg transition ${
                        active
                          ? "border-accent bg-accent text-surface shadow-paper"
                          : "border-line/15 bg-paper text-foreground shadow-sm hover:border-accent/60 hover:text-accent"
                      }`}
                      aria-label={`Chọn ${place.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-foreground shadow" />
                        {place.name}
                      </div>
                      <span className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-muted">
                        {place.city}
                      </span>
                    </button>
                  );
                })}

                {activePlace && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-line/15 bg-paper/95 p-4 shadow-paper backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-accent">Địa điểm</p>
                        <h3 className="text-lg font-semibold text-foreground">{activePlace.name}</h3>
                        <p className="text-sm text-muted">
                          {activePlace.city} · {formatDate(activePlace.date)}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        Lên đầu
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-foreground">{activePlace.note}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            {filteredPlaces.map((place) => {
              const active = place.id === effectiveActiveId;
              return (
                <Card
                  key={place.id}
                  title={place.name}
                  description={`${place.city} · ${formatDate(place.date)}`}
                  className={active ? "border-accent/40 shadow-paper" : ""}
                  actions={
                    <Button variant="secondary" onClick={() => setActiveId(place.id)}>
                      Xem marker
                    </Button>
                  }
                >
                  <p className="text-muted">{place.note}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {active ? "Đang hiển thị trên bản đồ." : "Nhấn để focus marker trên bản đồ."}
                  </p>
                </Card>
              );
            })}
            {filteredPlaces.length === 0 && (
              <div className="rounded-2xl border border-line/15 bg-paper p-6 text-center text-muted shadow-paper">
                Không tìm thấy địa điểm phù hợp. Thử đổi bộ lọc nhé.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

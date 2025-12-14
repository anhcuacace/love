import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import timelineData from "../../../data/timeline.sample.json";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Polaroid } from "../../common/Polaroid";
import { Sticker } from "../../common/Sticker";
import { StickyNote } from "../../common/StickyNote";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";

type TimelineItem = {
  id: string;
  date: string;
  title: string;
  category: string;
  description: string;
  location?: string;
  media?: string[];
  note?: string;
};

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Chuyến đi", value: "chuyến đi" },
  { label: "Sinh nhật", value: "sinh nhật" },
  { label: "Kỷ niệm đặc biệt", value: "kỷ niệm đặc biệt" },
  { label: "Khoảnh khắc", value: "khoảnh khắc" },
] as const;

const categorySticker: Record<string, Parameters<typeof Sticker>[0]["variant"]> = {
  "chuyến đi": "sky",
  "sinh nhật": "lemon",
  "kỷ niệm đặc biệt": "rose",
  "khoảnh khắc": "mint",
};

const formatDate = (input: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(input));

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

export const OurStoryPage = () => {
  const timeline = useMemo(
    () =>
      [...(timelineData as TimelineItem[])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [],
  );

  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(timeline[0]?.id ?? null);
  const [expandAll, setExpandAll] = useState(false);

  const filteredTimeline = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return timeline.filter((item) => {
      const matchesFilter = filter === "all" || item.category.toLowerCase() === filter;
      const matchesSearch =
        term.length === 0 ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        (item.location ?? "").toLowerCase().includes(term) ||
        item.media?.some((m) => m.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm, timeline]);

  const summary = useMemo(() => {
    const total = timeline.length;
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const places = new Set(timeline.map((item) => item.location).filter(Boolean)).size;
    const years = new Set(timeline.map((item) => new Date(item.date).getFullYear())).size;
    return {
      total,
      span:
        first && last
          ? `${formatDate(first.date)} → ${formatDate(last.date)}`
          : "Đang cập nhật",
      places,
      years,
    };
  }, [timeline]);

  const years = useMemo(() => {
    const set = new Set<number>();
    timeline.forEach((item) => set.add(new Date(item.date).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [timeline]);

  const handleFilterChange = (value: (typeof filters)[number]["value"]) => {
    setFilter(value);
    setExpandAll(false);
    const next = timeline.find(
      (item) => value === "all" || item.category.toLowerCase() === value,
    );
    setExpandedId(next?.id ?? null);
  };

  const handleYearJump = (year: number) => {
    setExpandAll(false);
    const next = filteredTimeline.find(
      (item) => new Date(item.date).getFullYear() === year,
    );
    setExpandedId(next?.id ?? null);
  };

  return (
    <PageContainer title="Hành trình">
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Dòng thời gian"
          title="Hành trình của chúng ta"
          subtitle="Giao diện tối giản: lướt nhanh thấy mốc chính, mở ra là đầy đủ nội dung, ảnh và ghi chú."
        />

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Tổng mốc</p>
            <p className="text-2xl font-semibold text-foreground">{summary.total}</p>
            <p className="text-xs text-muted">Số kỷ niệm đã lưu</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Khoảng thời gian</p>
            <p className="text-sm text-foreground">{summary.span}</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Địa điểm</p>
            <p className="text-2xl font-semibold text-foreground">{summary.places}</p>
            <p className="text-xs text-muted">Nơi hai đứa đã ghé</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Số năm</p>
            <p className="text-2xl font-semibold text-foreground">{summary.years}</p>
            <p className="text-xs text-muted">Số năm đã ghi lại</p>
          </div>
        </div>

        <div className="torn-bottom rounded-2xl border border-line/15 bg-paper p-4 shadow-paper md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Sticker variant="lemon">Bộ lọc nhanh</Sticker>
              <p className="text-sm text-muted">
                {filteredTimeline.length}/{timeline.length} mốc, gõ từ khóa để thu gọn danh sách.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <label className="text-[11px] uppercase tracking-[0.3em] text-muted">Tìm kiếm</label>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên mốc, địa điểm, caption media..."
                className="w-full rounded-xl border border-line/15 bg-surface/30 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleFilterChange(item.value)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-accent text-surface shadow-paper"
                      : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2 text-xs">
              <Button
                variant={expandAll ? "secondary" : "ghost"}
                className="px-3 py-1"
                onClick={() => setExpandAll((prev) => !prev)}
              >
                {expandAll ? "Thu gọn hết" : "Mở hết nội dung"}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="text-[11px] uppercase tracking-[0.3em]">Chọn nhanh theo năm:</span>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleYearJump(year)}
                className="rounded-full border border-line/15 bg-paper px-3 py-1 shadow-sm transition hover:border-accent/60 hover:text-foreground"
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute left-2 top-0 hidden h-full w-px bg-line/20 md:block" />
          {filteredTimeline.map((item, index) => {
            const isOpen = expandAll || expandedId === item.id;
            const media = item.media ?? [];
            const categoryVariant =
              categorySticker[item.category.toLowerCase()] ?? "paper";
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="relative md:pl-6"
              >
                <span className="absolute left-0 top-6 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-sm md:block" />
                <Card
                  title={item.title}
                  description={`${formatDate(item.date)} · ${item.location ?? "Nơi bí mật"}`}
                  actions={
                    <Button
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                    >
                      {isOpen ? "Thu gọn" : "Mở chi tiết"}
                    </Button>
                  }
                  className="relative overflow-hidden"
                >
                  <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper">
                    #{index + 1}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Sticker variant={categoryVariant}>{item.category}</Sticker>
                    <Sticker variant="paper">{formatDate(item.date)}</Sticker>
                    {item.location && (
                      <Sticker variant="paper">{item.location}</Sticker>
                    )}
                    <Sticker variant="paper">{media.length} tệp</Sticker>
                  </div>

                  {!isOpen && (
                    <p className="line-clamp-2 text-foreground opacity-90">{item.description}</p>
                  )}

                  {isOpen && (
                    <div className="space-y-3 rounded-xl border border-line/15 bg-surface/25 p-3">
                      <p className="leading-relaxed text-foreground">{item.description}</p>
                      {item.note && (
                        <StickyNote
                          eyebrow="Ghi chú"
                          variant="accent"
                          tilt="none"
                          showTape={false}
                          className="p-3"
                        >
                          <p className="font-hand text-xl text-accent">“{item.note}”</p>
                        </StickyNote>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span className="rounded-full border border-line/15 bg-paper px-3 py-1 shadow-sm">
                          Thời gian: {formatDate(item.date)}
                        </span>
                        <span className="rounded-full border border-line/15 bg-paper px-3 py-1 shadow-sm">
                          Địa điểm: {item.location ?? "Bí mật"}
                        </span>
                        <span className="rounded-full border border-line/15 bg-paper px-3 py-1 shadow-sm">
                          {media.length} media
                        </span>
                      </div>
                      {media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {media.slice(0, 4).map((src, idxPreview) => {
                            const remaining = media.length - 4;
                            const showOverlay = idxPreview === 3 && remaining > 0;
                            const video = isVideo(src);
                            const tiltClass = idxPreview % 2 === 0 ? "-rotate-1" : "rotate-1";
                            return (
                              <div key={src} className="relative">
                                {video ? (
                                  <div className={`rounded-2xl border border-line/15 bg-paper p-3 shadow-sm ${tiltClass}`}>
                                    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-line/10 bg-surface/25 text-xs text-muted">
                                      <div className="absolute left-3 top-3">
                                        <Sticker variant="sky">Video</Sticker>
                                      </div>
                                      <span className="font-semibold uppercase tracking-[0.2em]">
                                        Preview
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <Polaroid
                                    src={src}
                                    alt={item.title}
                                    showTape={false}
                                    className={`p-3 ${tiltClass}`}
                                    aspectClassName="aspect-video"
                                  />
                                )}
                                {showOverlay && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/70 text-sm text-paper">
                                    +{remaining} tệp nữa
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}

          {filteredTimeline.length === 0 && (
            <div className="rounded-2xl border border-line/15 bg-paper p-6 text-center text-muted shadow-paper">
              Không tìm thấy mốc phù hợp. Thử từ khóa khác hoặc đổi bộ lọc nhé.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

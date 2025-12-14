import { useCallback, useEffect, useMemo, useState } from "react";

import ourGalleryData from "../../../data/ourGallery.sample.json";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Modal } from "../../common/Modal";
import { Polaroid } from "../../common/Polaroid";
import { Sticker } from "../../common/Sticker";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";
import { isEditableTarget, isInteractiveTarget } from "../../../utils/dom";

type Album = {
  id: string;
  title: string;
  description: string;
  date: string;
  cover: string;
  photos: { id: string; url: string; caption: string; type?: "image" | "video" }[];
};

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

const formatDate = (input: string) =>
  new Intl.DateTimeFormat("vi-VN", { month: "short", year: "numeric" }).format(new Date(input));

export const OurGalleryPage = () => {
  const albums = ourGalleryData as Album[];
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3500);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [videoFilter, setVideoFilter] = useState<"any" | "video" | "no-video">("any");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const orderedPhotos = useMemo(() => {
    if (!selectedAlbum) return [];
    const indices =
      order.length === selectedAlbum.photos.length
        ? order
        : selectedAlbum.photos.map((_, idx) => idx);
    return indices.map((idx) => selectedAlbum.photos[idx]);
  }, [order, selectedAlbum]);

  useEffect(() => {
    const total = orderedPhotos.length;
    if (!selectedAlbum || !isPlaying || total === 0) return;
    const timer = window.setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % total),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [intervalMs, isPlaying, orderedPhotos, selectedAlbum]);

  const years = useMemo(() => {
    const uniq = new Set<string>();
    albums.forEach((album) => {
      const year = new Date(album.date).getFullYear().toString();
      if (!Number.isNaN(Number(year))) {
        uniq.add(year);
      }
    });
    return Array.from(uniq).sort((a, b) => Number(b) - Number(a));
  }, [albums]);

  const filteredAlbums = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return albums.filter((album) => {
      const matchesSearch =
        term.length === 0 ||
        album.title.toLowerCase().includes(term) ||
        album.description.toLowerCase().includes(term) ||
        album.photos.some((photo) => photo.caption.toLowerCase().includes(term));

      const matchesYear = yearFilter === "all" || album.date.startsWith(yearFilter);

      const hasVideo = album.photos.some((photo) => photo.type === "video" || isVideo(photo.url));
      const matchesVideo =
        videoFilter === "any" ||
        (videoFilter === "video" && hasVideo) ||
        (videoFilter === "no-video" && !hasVideo);

      return matchesSearch && matchesYear && matchesVideo;
    });
  }, [albums, searchTerm, videoFilter, yearFilter]);

  const displayedAlbums = useMemo(
    () =>
      [...filteredAlbums].sort((a, b) =>
        sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [filteredAlbums, sortOrder],
  );

  const activePhoto = orderedPhotos[currentIndex];

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setOrder(album.photos.map((_, idx) => idx));
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const shuffleOrder = () => {
    if (!selectedAlbum) return;
    const next = [...selectedAlbum.photos.keys()];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setCurrentIndex(0);
  };

  const handlePrev = useCallback(() => {
    if (orderedPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + orderedPhotos.length) % orderedPhotos.length);
    setIsPlaying(false);
  }, [orderedPhotos.length]);

  const handleNext = useCallback(() => {
    if (orderedPhotos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % orderedPhotos.length);
    setIsPlaying(false);
  }, [orderedPhotos.length]);

  useEffect(() => {
    if (!selectedAlbum) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handlePrev();
      } else if (event.key === " " || event.key === "Spacebar") {
        if (isInteractiveTarget(event.target)) return;
        event.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev, selectedAlbum]);

  const closeModal = () => {
    setSelectedAlbum(null);
    setOrder([]);
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <PageContainer title="Album chung">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Album chung"
          title="Album chung"
          subtitle="Danh sách album các chuyến đi, có view chi tiết, trình chiếu và xáo trộn."
        />

        <div className="torn-bottom rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <label className="text-xs uppercase tracking-[0.3em] text-muted">
                Tìm kiếm
              </label>
              <input
                type="search"
                placeholder="Tìm theo tên, mô tả hoặc caption..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-line/15 bg-surface/30 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Sticker variant="sky">Video</Sticker>
              {(["any", "video", "no-video"] as const).map((option) => {
                const labels: Record<typeof option, string> = {
                  any: "Tất cả",
                  video: "Có video",
                  "no-video": "Chỉ ảnh",
                };
                const active = videoFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVideoFilter(option)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-accent text-surface shadow-paper"
                        : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    {labels[option]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Sticker variant="lemon">Năm</Sticker>
            <button
              type="button"
              onClick={() => setYearFilter("all")}
              aria-pressed={yearFilter === "all"}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                yearFilter === "all"
                  ? "bg-accent text-surface shadow-paper"
                  : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {years.map((year) => {
              const active = yearFilter === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => setYearFilter(year)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-accent text-surface shadow-paper"
                      : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {year}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <Sticker variant="mint">Sắp xếp</Sticker>
              {(["desc", "asc"] as const).map((option) => {
                const labels: Record<typeof option, string> = {
                  desc: "Mới nhất",
                  asc: "Cũ nhất",
                };
                const active = sortOrder === option;
                return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortOrder(option)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-accent text-surface shadow-paper"
                      : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    {labels[option]}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 text-xs text-muted">
            Đang hiển thị {displayedAlbums.length}/{albums.length} album · nhấn ảnh bìa để mở ngay
            trình chiếu.
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {displayedAlbums.map((album) => {
            const videoCount = album.photos.filter((photo) => photo.type === "video").length;
            const total = album.photos.length;
            const info = `${album.date} · ${total} kỷ niệm${
              videoCount > 0 ? ` · ${videoCount} video` : ""
            }`;

            return (
              <Card
                key={album.id}
                title={album.title}
                description={info}
                actions={
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openAlbum(album)}>
                      Xem chi tiết
                    </Button>
                    <Button variant="ghost" onClick={() => openAlbum(album)}>
                      Trình chiếu
                    </Button>
                  </div>
                }
              >
                <Polaroid
                  src={album.cover}
                  alt={album.title}
                  meta={formatDate(album.date)}
                  caption="Mở trình chiếu"
                  tiltSeed={album.id}
                  onClick={() => openAlbum(album)}
                  showTape={false}
                  aspectClassName="aspect-video"
                  badge={
                    <div className="flex flex-col gap-2">
                      {videoCount > 0 ? (
                        <Sticker variant="sky">Video</Sticker>
                      ) : (
                        <Sticker variant="mint">Chỉ ảnh</Sticker>
                      )}
                      <Sticker variant="lemon">{total} kỷ niệm</Sticker>
                    </div>
                  }
                  footer={
                    <div className="text-sm text-muted">
                      Nhấn ảnh bìa để mở ngay trình chiếu.
                    </div>
                  }
                />
                <p className="text-sm text-muted">{album.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  {album.photos.slice(0, 5).map((photo) => (
                    <span
                      key={photo.id}
                      className="rounded-full bg-surface/30 px-3 py-1"
                    >
                      {photo.caption}
                    </span>
                  ))}
                  {album.photos.length > 5 && (
                    <span className="rounded-full bg-surface/30 px-3 py-1">
                      +{album.photos.length - 5} kỷ niệm nữa
                    </span>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Nhấn “Xem chi tiết” để mở trình chiếu, xáo trộn hoặc xem từng ảnh/video.
                </p>
              </Card>
            );
          })}
          {filteredAlbums.length === 0 && (
            <div className="col-span-full rounded-2xl border border-line/15 bg-paper p-6 text-center text-muted shadow-paper">
              Không tìm thấy album phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(selectedAlbum)}
        onClose={closeModal}
        title={selectedAlbum?.title}
        subtitle={
          selectedAlbum
            ? `${formatDate(selectedAlbum.date)} · ${selectedAlbum.photos.length} kỷ niệm${
                selectedAlbum.photos.some((photo) => isVideo(photo.url)) ? " · có video" : ""
              }`
            : undefined
        }
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={() => setIsPlaying((prev) => !prev)}>
                {isPlaying ? "Tạm dừng" : "Chạy trình chiếu"}
              </Button>
              <Button variant="secondary" onClick={shuffleOrder}>
                Xáo trộn
              </Button>
              <Button variant="ghost" onClick={handlePrev}>
                Trước
              </Button>
              <Button variant="ghost" onClick={handleNext}>
                Sau
              </Button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.2em] text-muted">
                Tốc độ trình chiếu ({(intervalMs / 1000).toFixed(1)}s)
                <input
                  type="range"
                  min={1500}
                  max={8000}
                  step={500}
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-accent"
                  aria-label="Tốc độ trình chiếu"
                />
              </label>
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Phím tắt: Space / ← / →
            </div>
          </div>
        }
      >
        {selectedAlbum && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/15 bg-surface/25 p-3 text-sm text-muted">
              {selectedAlbum.description}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-line/15 bg-surface/25">
              {activePhoto ? (
                isVideo(activePhoto.url) ? (
                  <video
                    key={activePhoto.id}
                    src={activePhoto.url}
                    controls
                    className="h-[360px] w-full object-cover"
                  />
                ) : (
                  <img
                    key={activePhoto.id}
                    src={activePhoto.url}
                    alt={activePhoto.caption}
                    className="h-[360px] w-full object-cover"
                    loading="lazy"
                  />
                )
              ) : (
                <div className="flex h-[360px] items-center justify-center text-sm text-muted">
                  Chưa chọn ảnh nào.
                </div>
              )}

              {activePhoto && (
                <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-foreground/70 px-3 py-1 text-xs text-paper">
                  <span className="rounded-full bg-paper/15 px-2 py-0.5 uppercase tracking-[0.2em]">
                    {currentIndex + 1}/{orderedPhotos.length}
                  </span>
                  <span>{activePhoto.caption}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">
                {formatDate(selectedAlbum.date)}
              </span>
              <span className="rounded-full bg-surface/30 px-3 py-1">
                {selectedAlbum.photos.length} kỷ niệm
              </span>
              <span className="rounded-full bg-surface/30 px-3 py-1">
                {selectedAlbum.photos.filter((photo) => isVideo(photo.url)).length} video
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {orderedPhotos.map((photo, idx) => {
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsPlaying(false);
                      }}
                      aria-pressed={active}
                      aria-label={`Chọn kỷ niệm ${idx + 1}: ${photo.caption}`}
                      className={`group relative overflow-hidden rounded-xl border ${
                        active ? "border-accent" : "border-line/15"
                      }`}
                    >
                      <div className="aspect-square w-full bg-surface/25">
                        {isVideo(photo.url) ? (
                          <div className="flex h-full items-center justify-center text-[11px] text-muted">
                            Video
                          </div>
                        ) : (
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <span className="absolute left-2 top-2 rounded-full bg-foreground/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-paper">
                        #{idx + 1}
                      </span>
                      <span className="line-clamp-2 block px-2 py-1 text-[11px] text-foreground">
                        {photo.caption}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

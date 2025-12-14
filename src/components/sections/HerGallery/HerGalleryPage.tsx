import { useCallback, useEffect, useMemo, useState } from "react";

import herGalleryData from "../../../data/herGallery.sample.json";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Modal } from "../../common/Modal";
import { Polaroid } from "../../common/Polaroid";
import { Sticker } from "../../common/Sticker";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { isEditableTarget } from "../../../utils/dom";

type HerPhoto = {
  id: string;
  title: string;
  tag: string;
  caption: string;
  image: string;
  date?: string;
};

const tags = [
  { id: "all", label: "Tất cả" },
  { id: "favorites", label: "Yêu thích" },
  { id: "cute", label: "Dễ thương" },
  { id: "serious", label: "Nghiêm túc" },
  { id: "outfit", label: "Trang phục" },
  { id: "selfie", label: "Selfie" },
  { id: "fun", label: "Vui nhộn" },
];

const tagLabels = Object.fromEntries(tags.map((tag) => [tag.id, tag.label])) as Record<
  string,
  string
>;

const tagStickerVariants: Record<string, Parameters<typeof Sticker>[0]["variant"]> = {
  cute: "rose",
  serious: "lavender",
  outfit: "sky",
  selfie: "mint",
  fun: "lemon",
};

const formatDate = (input?: string) =>
  input
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(input))
    : "Ngày yêu thích";

export const HerGalleryPage = () => {
  const photos = herGalleryData as HerPhoto[];
  const [activeTag, setActiveTag] = useState<string>("all");
  const [favorites, setFavorites] = useLocalStorage<string[]>("lovestory:her-favorites", []);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("lovestory:her-notes", {});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const filtered = useMemo(() => {
    if (activeTag === "all") return photos;
    if (activeTag === "favorites") {
      return photos.filter((photo) => favorites.includes(photo.id));
    }
    return photos.filter((item) => item.tag === activeTag);
  }, [activeTag, favorites, photos]);

  const selectedPhoto = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((photo) => photo.id === selectedId) ?? null;
  }, [filtered, selectedId]);

  const lightboxIndex = useMemo(() => {
    if (!selectedPhoto) return 0;
    return Math.max(0, filtered.findIndex((photo) => photo.id === selectedPhoto.id));
  }, [filtered, selectedPhoto]);
  const isFavorite = selectedPhoto ? favorites.includes(selectedPhoto.id) : false;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const saveNote = (id: string, content: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (content.trim()) {
        next[id] = content.trim();
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const goPrev = useCallback(() => {
    if (!selectedPhoto || filtered.length === 0) return;
    const nextIndex = (lightboxIndex - 1 + filtered.length) % filtered.length;
    const nextPhoto = filtered[nextIndex];
    if (!nextPhoto) return;
    setSelectedId(nextPhoto.id);
    setNoteDraft(notes[nextPhoto.id] ?? "");
  }, [filtered, lightboxIndex, notes, selectedPhoto]);

  const goNext = useCallback(() => {
    if (!selectedPhoto || filtered.length === 0) return;
    const nextIndex = (lightboxIndex + 1) % filtered.length;
    const nextPhoto = filtered[nextIndex];
    if (!nextPhoto) return;
    setSelectedId(nextPhoto.id);
    setNoteDraft(notes[nextPhoto.id] ?? "");
  }, [filtered, lightboxIndex, notes, selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, selectedPhoto]);

  const openLightbox = (id: string) => {
    const photo = filtered.find((item) => item.id === id);
    if (!photo) return;
    setSelectedId(photo.id);
    setNoteDraft(notes[photo.id] ?? "");
  };

  const openRandom = () => {
    const random = photos[Math.floor(Math.random() * photos.length)];
    setActiveTag("all");
    setSelectedId(random.id);
    setNoteDraft(notes[random.id] ?? "");
  };

  return (
    <PageContainer title="Album của em">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Album của em"
          title="Chỉ dành riêng cho em"
          subtitle="Ảnh, yêu thích, ghi chú và lightbox xem nhanh."
        />

        <Card
          title="Giới thiệu nhỏ"
          description="Ảnh chân dung, fun facts và nút random ở đây."
          actions={
            <Button variant="secondary" onClick={openRandom}>
              Ảnh bất kỳ của em
            </Button>
          }
        >
          <ul className="list-disc space-y-1 pl-4 text-muted">
            <li>Click ảnh để mở lightbox, dùng phím ←/→ để điều hướng.</li>
            <li>Đánh dấu yêu thích và lưu ghi chú vào localStorage.</li>
            <li>Filter theo tag hoặc xem danh sách yêu thích.</li>
          </ul>
        </Card>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = activeTag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setActiveTag(tag.id)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  active
                    ? "border-accent bg-accent-soft text-accent shadow-sm"
                    : "border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-line/15 bg-paper p-6 text-center text-muted shadow-paper">
            Chưa có ảnh cho bộ lọc này, thử chọn tag khác nhé.
          </div>
        ) : (
          <div className="columns-1 gap-x-6 sm:columns-2 lg:columns-3">
            {filtered.map((photo) => {
              const favorite = favorites.includes(photo.id);
              const notePreview = notes[photo.id];
              const tagLabel = tagLabels[photo.tag] ?? photo.tag;
              const tagVariant = tagStickerVariants[photo.tag] ?? "lemon";
              return (
                <Polaroid
                  key={photo.id}
                  src={photo.image}
                  alt={photo.title}
                  caption={photo.title}
                  meta={formatDate(photo.date)}
                  tiltSeed={photo.id}
                  onClick={() => openLightbox(photo.id)}
                  className="mb-6 break-inside-avoid"
                  badge={
                    <div className="flex flex-col gap-2">
                      <Sticker variant={tagVariant}>{tagLabel}</Sticker>
                      {favorite && <Sticker variant="accent">Yêu thích</Sticker>}
                    </div>
                  }
                  footer={
                    <div className="space-y-2">
                      <p className="text-sm text-muted">{photo.caption}</p>
                      {notePreview && (
                        <p className="text-xs text-accent">
                          Ghi chú: {notePreview.slice(0, 80)}
                          {notePreview.length > 80 ? "…" : ""}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(photo.id);
                          }}
                          className="rounded-xl border border-line/15 bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground shadow-sm transition hover:border-accent/40 hover:text-accent"
                        >
                          {favorite ? "Bỏ yêu thích" : "Yêu thích"}
                        </button>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selectedPhoto)}
        onClose={() => {
          setSelectedId(null);
          setNoteDraft("");
        }}
        title={selectedPhoto?.title}
        subtitle={
          selectedPhoto
            ? `${formatDate(selectedPhoto.date)} · ${
                tagLabels[selectedPhoto.tag] ?? selectedPhoto.tag
              }`
            : undefined
        }
        footer={
          selectedPhoto && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={() => toggleFavorite(selectedPhoto.id)}>
                {isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              </Button>
              <Button variant="secondary" onClick={() => saveNote(selectedPhoto.id, noteDraft)}>
                Lưu ghi chú
              </Button>
              <Button variant="ghost" onClick={goPrev}>
                Trước
              </Button>
              <Button variant="ghost" onClick={goNext}>
                Sau
              </Button>
            </div>
          )
        }
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-line/15 bg-surface/25">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="h-[420px] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-foreground/70 px-3 py-1 text-xs text-paper">
                <span className="rounded-full bg-paper/15 px-2 py-0.5 uppercase tracking-[0.2em]">
                  {lightboxIndex + 1}/{filtered.length}
                </span>
                <span>{selectedPhoto.caption}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">
                {tagLabels[selectedPhoto.tag] ?? selectedPhoto.tag}
              </span>
              <span className="rounded-full bg-surface/30 px-3 py-1">
                {formatDate(selectedPhoto.date)}
              </span>
              {isFavorite && (
                <span className="rounded-full bg-accent px-3 py-1 text-surface">
                  Yêu thích
                </span>
              )}
            </div>

            <p className="leading-relaxed text-foreground">{selectedPhoto.caption}</p>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">
                Ghi chú của anh về tấm này
              </label>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                className="min-h-[120px] w-full rounded-xl border border-line/15 bg-surface/25 p-3 text-sm text-foreground outline-none transition focus:border-accent/60"
                placeholder="Nhập ghi chú, cảm xúc, lời nhắn..."
              />
              <p className="text-xs text-muted">
                Lưu vào trình duyệt, chỉ mình anh thấy. Để trống rồi nhấn lưu nếu muốn xoá ghi chú.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

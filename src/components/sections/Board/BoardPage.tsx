import { useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Modal } from "../../common/Modal";
import { Polaroid } from "../../common/Polaroid";
import { Sticker } from "../../common/Sticker";
import { StickyNote } from "../../common/StickyNote";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";

type StickerVariant = Parameters<typeof Sticker>[0]["variant"];
type NoteVariant = Parameters<typeof StickyNote>[0]["variant"];

type BaseItem = {
  id: string;
  x: number;
  y: number;
  rotate: number;
  z: number;
};

type PhotoItem = BaseItem & {
  type: "photo";
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
  width: number;
};

type NoteItem = BaseItem & {
  type: "note";
  title?: string;
  text: string;
  variant: NoteVariant;
  width: number;
};

type StickerItem = BaseItem & {
  type: "sticker";
  text: string;
  variant: StickerVariant;
};

type BoardItem = PhotoItem | NoteItem | StickerItem;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const itemTypeLabels: Record<BoardItem["type"], string> = {
  photo: "Ảnh",
  note: "Ghi chú",
  sticker: "Sticker",
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultItems: BoardItem[] = [
  {
    id: "board-photo-1",
    type: "photo",
    src: "/main.jpg",
    alt: "Ảnh kỷ niệm của chúng ta",
    caption: "Chúng ta",
    meta: "Mãi mãi",
    x: 25,
    y: 32,
    rotate: -3,
    z: 1,
    width: 270,
  },
  {
    id: "board-photo-2",
    type: "photo",
    src: "/cuti/PXL_20240804_042658230.jpg",
    alt: "Nắng sớm",
    caption: "Nắng sớm",
    meta: "Thg 8 2024",
    x: 70,
    y: 28,
    rotate: 3,
    z: 2,
    width: 240,
  },
  {
    id: "board-photo-3",
    type: "photo",
    src: "/tet_holiday_2024/PXL_20230121_170147705.jpg",
    alt: "Tết nhà anh",
    caption: "Tết nhà anh",
    meta: "Thg 1 2023",
    x: 62,
    y: 70,
    rotate: -1,
    z: 3,
    width: 260,
  },
  {
    id: "board-note-1",
    type: "note",
    title: "Ghi chú nhỏ",
    text: "Kéo thả ảnh, note và sticker để xếp thành một trang scrapbook.\n\nBạn có thể thay nội dung sau.",
    variant: "lemon",
    x: 28,
    y: 78,
    rotate: 2,
    z: 4,
    width: 320,
  },
  {
    id: "board-sticker-1",
    type: "sticker",
    text: "LOVE",
    variant: "accent",
    x: 48,
    y: 52,
    rotate: -6,
    z: 5,
  },
  {
    id: "board-sticker-2",
    type: "sticker",
    text: "câu chuyện",
    variant: "mint",
    x: 84,
    y: 54,
    rotate: 4,
    z: 6,
  },
];

type DragState = {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

const noteVariants: { id: NoteVariant; label: string }[] = [
  { id: "lemon", label: "Vàng chanh" },
  { id: "mint", label: "Xanh mint" },
  { id: "sky", label: "Xanh trời" },
  { id: "accent", label: "Hồng" },
  { id: "paper", label: "Giấy" },
];

const stickerVariants: { id: StickerVariant; label: string }[] = [
  { id: "accent", label: "Hồng" },
  { id: "paper", label: "Giấy" },
  { id: "ink", label: "Mực" },
  { id: "lemon", label: "Vàng chanh" },
  { id: "mint", label: "Xanh mint" },
  { id: "sky", label: "Xanh trời" },
  { id: "rose", label: "Hồng rose" },
  { id: "lavender", label: "Tím lavender" },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

export const BoardPage = () => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useLocalStorage<BoardItem[]>("lovestory:board-items", defaultItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const maxZ = useMemo(() => items.reduce((max, item) => Math.max(max, item.z), 0), [items]);

  const updateItem = (id: string, patch: Partial<BoardItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? ({ ...item, ...patch } as BoardItem) : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const bringToFront = (id: string) => {
    setItems((prev) => {
      const currentMax = prev.reduce((max, item) => Math.max(max, item.z), 0);
      return prev.map((item) => (item.id === id ? { ...item, z: currentMax + 1 } : item));
    });
  };

  const handlePointerDown = (id: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const board = boardRef.current;
    if (!board) return;

    const itemRect = event.currentTarget.getBoundingClientRect();
    const centerX = itemRect.left + itemRect.width / 2;
    const centerY = itemRect.top + itemRect.height / 2;

    dragRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: event.clientX - centerX,
      offsetY: event.clientY - centerY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    setDraggingId(id);
    bringToFront(id);

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = dragRef.current;
    const board = boardRef.current;
    if (!current || !board) return;
    if (event.pointerId !== current.pointerId) return;

    const dx = Math.abs(event.clientX - current.startX);
    const dy = Math.abs(event.clientY - current.startY);
    if (!current.moved && (dx > 3 || dy > 3)) {
      current.moved = true;
    }

    const boardRect = board.getBoundingClientRect();
    if (boardRect.width <= 0 || boardRect.height <= 0) return;

    const centerX = event.clientX - current.offsetX;
    const centerY = event.clientY - current.offsetY;
    const x = ((centerX - boardRect.left) / boardRect.width) * 100;
    const y = ((centerY - boardRect.top) / boardRect.height) * 100;

    setItems((prev) =>
      prev.map((item) =>
        item.id === current.id
          ? { ...item, x: clamp(x, 0, 100), y: clamp(y, 0, 100) }
          : item,
      ),
    );
    event.preventDefault();
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = dragRef.current;
    if (!current) return;

    if (event.pointerId !== current.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    setDraggingId(null);

    const { id, moved } = current;
    dragRef.current = null;

    if (!moved) {
      setSelectedId(id);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = dragRef.current;
    if (!current) return;
    if (event.pointerId !== current.pointerId) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }

    dragRef.current = null;
    setDraggingId(null);
  };

  const addNote = () => {
    const id = createId();
    const note: NoteItem = {
      id,
      type: "note",
      title: "Ghi chú mới",
      text: "Viết gì đó dễ thương ở đây…",
      variant: "lemon",
      x: 50,
      y: 50,
      rotate: -2,
      z: maxZ + 1,
      width: 320,
    };
    setItems((prev) => [...prev, note]);
    setSelectedId(id);
  };

  const addSticker = () => {
    const id = createId();
    const sticker: StickerItem = {
      id,
      type: "sticker",
      text: "sticker mới",
      variant: "lemon",
      x: 50,
      y: 40,
      rotate: 2,
      z: maxZ + 1,
    };
    setItems((prev) => [...prev, sticker]);
    setSelectedId(id);
  };

  const resetBoard = () => {
    const ok = window.confirm("Reset sẽ đưa bảng về layout mặc định. Tiếp tục?");
    if (!ok) return;
    setItems(defaultItems);
    setSelectedId(null);
    setDraggingId(null);
    setStatus("Đã reset bảng về layout mặc định.");
  };

  const exportBoard = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lovestory-board-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    setStatus("Đã xuất layout bảng ra file JSON.");
  };

  const parseImportedItems = (raw: unknown): BoardItem[] | null => {
    const list = Array.isArray(raw)
      ? raw
      : isRecord(raw) && Array.isArray(raw.items)
        ? raw.items
        : null;
    if (!list) return null;

    const noteVariantIds = new Set(noteVariants.map((v) => v.id));
    const stickerVariantIds = new Set(stickerVariants.map((v) => v.id));

    const parsed: BoardItem[] = [];

    for (const item of list) {
      if (!isRecord(item)) return null;
      const id = item.id;
      const type = item.type;
      const x = item.x;
      const y = item.y;
      const rotate = item.rotate;
      const z = item.z;

      if (!isString(id)) return null;
      if (type !== "photo" && type !== "note" && type !== "sticker") return null;
      if (!isNumber(x) || !isNumber(y) || !isNumber(rotate) || !isNumber(z)) return null;

      const base = {
        id,
        type,
        x: clamp(x, 0, 100),
        y: clamp(y, 0, 100),
        rotate,
        z,
      } as const;

      if (type === "photo") {
        const src = item.src;
        const alt = item.alt;
        const width = item.width;
        if (!isString(src) || !isString(alt) || !isNumber(width)) return null;
        const caption = isString(item.caption) ? item.caption : undefined;
        const meta = isString(item.meta) ? item.meta : undefined;
        parsed.push({
          ...base,
          type: "photo",
          src,
          alt,
          caption,
          meta,
          width,
        });
        continue;
      }

      if (type === "note") {
        const text = item.text;
        const width = item.width;
        const variant = item.variant;
        if (!isString(text) || !isNumber(width) || !isString(variant) || !noteVariantIds.has(variant as NoteVariant)) {
          return null;
        }
        const title = isString(item.title) ? item.title : undefined;
        parsed.push({
          ...base,
          type: "note",
          title,
          text,
          variant: variant as NoteVariant,
          width,
        });
        continue;
      }

      const text = item.text;
      const variant = item.variant;
      if (!isString(text) || !isString(variant) || !stickerVariantIds.has(variant as StickerVariant)) return null;
      parsed.push({
        ...base,
        type: "sticker",
        text,
        variant: variant as StickerVariant,
      });
    }

    return parsed;
  };

  const importBoard = async (file: File) => {
    try {
      const text = await file.text();
      const parsedJson = JSON.parse(text) as unknown;
      const parsedItems = parseImportedItems(parsedJson);
      if (!parsedItems) {
        setStatus("File không đúng định dạng layout Board. Hãy kiểm tra lại JSON.");
        return;
      }

      const ok = window.confirm("Nhập layout sẽ ghi đè bảng hiện tại. Tiếp tục?");
      if (!ok) return;

      setItems(parsedItems);
      setSelectedId(null);
      setDraggingId(null);
      setStatus(`Đã nhập layout (${parsedItems.length} item).`);
    } catch (err) {
      console.error("Failed to import board", err);
      setStatus("Không đọc được file JSON. Hãy thử lại.");
    }
  };

  return (
    <PageContainer title="Bảng scrapbook">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Scrapbook"
          title="Bảng dán kỷ niệm"
          subtitle="Kéo thả để xếp layout. Thêm sticker/note nhanh và lưu tự động vào localStorage."
        />

        <Card
          title="Thao tác nhanh"
          description="Tip: chạm/click 1 item để chỉnh nội dung; kéo để di chuyển."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportBoard}>
                Xuất layout
              </Button>
              <Button variant="secondary" onClick={() => importFileRef.current?.click()}>
                Nhập layout
              </Button>
              <Button variant="secondary" onClick={addNote}>
                Thêm note
              </Button>
              <Button variant="secondary" onClick={addSticker}>
                Thêm sticker
              </Button>
              <Button variant="ghost" onClick={resetBoard}>
                Reset bảng
              </Button>
            </div>
          }
        >
          <input
            ref={importFileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void importBoard(file);
              event.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <Sticker variant="paper">Tự lưu</Sticker>
            <Sticker variant="mint">Kéo thả</Sticker>
            <Sticker variant="sky">Chất scrapbook</Sticker>
          </div>
          {status && (
            <div className="mt-3 rounded-2xl border border-line/15 bg-surface/20 px-4 py-3 text-sm text-muted shadow-sm">
              {status}
            </div>
          )}
        </Card>

        <div
          ref={boardRef}
          className="relative min-h-[640px] overflow-hidden rounded-3xl border border-line/15 bg-paper shadow-paper"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgb(226_98_121_/_0.10),transparent_35%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_22%,rgb(250_204_21_/_0.09),transparent_40%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_88%,rgb(34_197_94_/_0.07),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(35_24_20_/_0.04)_0_1px,transparent_1px_28px)]" />

          {items.map((item) => {
            const isDragging = draggingId === item.id;
            const baseStyle: CSSProperties = {
              left: `${item.x}%`,
              top: `${item.y}%`,
              zIndex: item.z,
              transform: `translate(-50%, -50%) rotate(${item.rotate}deg)`,
            };

            const wrapperClass =
              "absolute select-none touch-none cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

            if (item.type === "photo") {
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={item.caption ?? item.alt}
                  className={`${wrapperClass} ${isDragging ? "opacity-95" : ""}`}
                  style={{ ...baseStyle, width: item.width }}
                  onKeyDown={(event) => {
                    if (event.currentTarget !== event.target) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedId(item.id);
                  }}
                  onPointerDown={handlePointerDown(item.id)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                >
                  <Polaroid
                    src={item.src}
                    alt={item.alt}
                    caption={item.caption}
                    meta={item.meta}
                    showTape
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              );
            }

            if (item.type === "note") {
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={item.title ?? "Ghi chú"}
                  className={`${wrapperClass} ${isDragging ? "opacity-95" : ""}`}
                  style={{ ...baseStyle, width: item.width }}
                  onKeyDown={(event) => {
                    if (event.currentTarget !== event.target) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setSelectedId(item.id);
                  }}
                  onPointerDown={handlePointerDown(item.id)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                >
                  <StickyNote
                    title={item.title}
                    variant={item.variant}
                    tilt="none"
                    className="w-full"
                    showTape
                  >
                    <p className="whitespace-pre-line">{item.text}</p>
                  </StickyNote>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={item.text}
                className={`${wrapperClass} ${isDragging ? "opacity-95" : ""}`}
                style={baseStyle}
                onKeyDown={(event) => {
                  if (event.currentTarget !== event.target) return;
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setSelectedId(item.id);
                }}
                onPointerDown={handlePointerDown(item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                <Sticker variant={item.variant} className="px-4 py-2 text-xs">
                  {item.text}
                </Sticker>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={Boolean(selectedItem)}
        onClose={() => setSelectedId(null)}
        title={selectedItem ? `Chỉnh sửa · ${itemTypeLabels[selectedItem.type]}` : undefined}
        subtitle={selectedItem ? "Lưu tự động vào localStorage" : undefined}
        footer={
          selectedItem && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  bringToFront(selectedItem.id);
                  setSelectedId(null);
                }}
              >
                Đưa lên trên
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const nextRotate = selectedItem.rotate + 3;
                  updateItem(selectedItem.id, { rotate: nextRotate } as Partial<BoardItem>);
                }}
              >
                Xoay +3°
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const ok = window.confirm("Xoá item này?");
                  if (!ok) return;
                  removeItem(selectedItem.id);
                }}
              >
                Xoá
              </Button>
            </div>
          )
        }
      >
        {selectedItem?.type === "note" && (
          <div className="space-y-3">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Tiêu đề
              </span>
              <input
                value={selectedItem.title ?? ""}
                onChange={(event) =>
                  updateItem(selectedItem.id, { title: event.target.value } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-surface/25 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                placeholder="Ví dụ: Nhắc nhỏ"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Nội dung
              </span>
              <textarea
                value={selectedItem.text}
                onChange={(event) =>
                  updateItem(selectedItem.id, { text: event.target.value } as Partial<BoardItem>)
                }
                className="min-h-[140px] w-full rounded-xl border border-line/15 bg-surface/25 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                placeholder="Viết điều gì đó…"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Màu note
              </span>
              <select
                value={selectedItem.variant}
                onChange={(event) =>
                  updateItem(selectedItem.id, { variant: event.target.value as NoteVariant } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              >
                {noteVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {selectedItem?.type === "sticker" && (
          <div className="space-y-3">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Nội dung sticker
              </span>
              <input
                value={selectedItem.text}
                onChange={(event) =>
                  updateItem(selectedItem.id, { text: event.target.value } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-surface/25 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                placeholder="Ví dụ: LOVE"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Màu sticker
              </span>
              <select
                value={selectedItem.variant}
                onChange={(event) =>
                  updateItem(selectedItem.id, { variant: event.target.value as StickerVariant } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
              >
                {stickerVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {selectedItem?.type === "photo" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-line/15 bg-surface/25 p-3 text-sm text-muted shadow-sm">
              Tip: nội dung ảnh bạn có thể thay sau bằng cách sửa JSON/đường dẫn ảnh trong `public/`.
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Caption
              </span>
              <input
                value={selectedItem.caption ?? ""}
                onChange={(event) =>
                  updateItem(selectedItem.id, { caption: event.target.value } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-surface/25 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                placeholder="Ví dụ: Nắng sớm"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Meta
              </span>
              <input
                value={selectedItem.meta ?? ""}
                onChange={(event) =>
                  updateItem(selectedItem.id, { meta: event.target.value } as Partial<BoardItem>)
                }
                className="w-full rounded-xl border border-line/15 bg-surface/25 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                placeholder="Ví dụ: Thg 8 2024"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Độ rộng (px)
              </span>
              <input
                type="range"
                min={180}
                max={420}
                step={10}
                value={selectedItem.width}
                onChange={(event) =>
                  updateItem(selectedItem.id, { width: Number(event.target.value) } as Partial<BoardItem>)
                }
                className="h-2 w-full cursor-pointer accent-accent"
              />
              <div className="text-xs text-muted">{selectedItem.width}px</div>
            </label>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

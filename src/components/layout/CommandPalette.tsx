import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSettings } from "../../store/settingsContext";
import { isEditableTarget } from "../../utils/dom";
import { Modal } from "../common/Modal";
import { Sticker } from "../common/Sticker";

type CommandGroup = "nav" | "action";

type Command = {
  id: string;
  title: string;
  description?: string;
  group: CommandGroup;
  keywords?: string;
  shortcut?: string;
  keepOpen?: boolean;
  run: () => void | Promise<void>;
};

const getShortcutLabel = () => {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  return isMac ? "⌘K" : "Ctrl K";
};

const matchCommand = (command: Command, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    command.title,
    command.description ?? "",
    command.keywords ?? "",
    command.shortcut ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalizedQuery);
};

export const CommandPalette = () => {
  const navigate = useNavigate();
  const { theme, setTheme, musicEnabled, toggleMusic } = useSettings();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    setStatus(null);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
    setStatus(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const isK = event.key.toLowerCase() === "k";
      const isMod = event.ctrlKey || event.metaKey;
      if (isK && isMod) {
        event.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActiveIndex(0);
        setStatus(null);
        return;
      }

      if (!open && event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        openPalette();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, openPalette]);

  useEffect(() => {
    const handleOpen = () => openPalette();
    window.addEventListener("lovestory:open-command-palette", handleOpen as EventListener);
    return () =>
      window.removeEventListener("lovestory:open-command-palette", handleOpen as EventListener);
  }, [openPalette]);

  const commands = useMemo<Command[]>(() => {
    const cycleTheme = () => {
      const order = ["scrapbook", "light", "dark", "romantic"] as const;
      const currentIndex = order.indexOf(theme);
      const nextTheme = order[(currentIndex + 1) % order.length];
      setTheme(nextTheme);
    };

    const scrollToTop = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    };

    return [
      {
        id: "go-home",
        title: "Trang chủ",
        description: "Về trang chủ",
        group: "nav",
        keywords: "home",
        run: () => navigate("/"),
      },
      {
        id: "go-board",
        title: "Bảng scrapbook",
        description: "Kéo thả polaroid, note và sticker",
        group: "nav",
        keywords: "board scrapbook",
        run: () => navigate("/board"),
      },
      {
        id: "go-story",
        title: "Hành trình",
        description: "Timeline kỷ niệm",
        group: "nav",
        keywords: "timeline story",
        run: () => navigate("/our-story"),
      },
      {
        id: "go-her-gallery",
        title: "Album của em",
        description: "Ảnh + yêu thích + ghi chú",
        group: "nav",
        keywords: "gallery her",
        run: () => navigate("/her-gallery"),
      },
      {
        id: "go-our-gallery",
        title: "Album chung",
        description: "Album chuyến đi + trình chiếu",
        group: "nav",
        keywords: "gallery album slideshow",
        run: () => navigate("/our-gallery"),
      },
      {
        id: "go-map",
        title: "Bản đồ kỷ niệm",
        description: "Địa điểm đã đi cùng nhau",
        group: "nav",
        keywords: "map places",
        run: () => navigate("/memories-map"),
      },
      {
        id: "go-letters",
        title: "Thư & nhật ký",
        description: "Thư tay + quote ngẫu nhiên",
        group: "nav",
        keywords: "letters diary",
        run: () => navigate("/letters"),
      },
      {
        id: "go-games",
        title: "Trò chơi",
        description: "Memory card + Love quiz",
        group: "nav",
        keywords: "games quiz",
        run: () => navigate("/games"),
      },
      {
        id: "go-settings",
        title: "Cài đặt",
        description: "Theme, nhạc, sao lưu",
        group: "nav",
        keywords: "settings",
        run: () => navigate("/settings"),
      },
      {
        id: "action-theme",
        title: "Đổi giao diện",
        description: `Hiện tại: ${theme}`,
        group: "action",
        keywords: "theme dark light romantic scrapbook",
        shortcut: "T",
        keepOpen: true,
        run: () => cycleTheme(),
      },
      {
        id: "action-music",
        title: musicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền",
        description: "Music dock ở đáy màn hình",
        group: "action",
        keywords: "music",
        shortcut: "M",
        keepOpen: true,
        run: () => toggleMusic(),
      },
      {
        id: "action-top",
        title: "Lên đầu trang",
        description: "Cuộn lên đầu",
        group: "action",
        keywords: "top scroll",
        shortcut: "G",
        run: () => scrollToTop(),
      },
      {
        id: "action-copy-link",
        title: "Copy link trang hiện tại",
        description: "Dán link để chia sẻ",
        group: "action",
        keywords: "copy share link",
        shortcut: "C",
        keepOpen: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setStatus("Đã copy link vào clipboard.");
          } catch {
            setStatus("Không copy được link (trình duyệt chặn clipboard).");
          }
        },
      },
    ];
  }, [musicEnabled, navigate, setTheme, theme, toggleMusic]);

  const visibleCommands = useMemo(() => commands.filter((cmd) => matchCommand(cmd, query)), [commands, query]);
  const navCommands = useMemo(() => visibleCommands.filter((cmd) => cmd.group === "nav"), [visibleCommands]);
  const actionCommands = useMemo(
    () => visibleCommands.filter((cmd) => cmd.group === "action"),
    [visibleCommands],
  );

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    visibleCommands.forEach((cmd, idx) => map.set(cmd.id, idx));
    return map;
  }, [visibleCommands]);

  const activeCommand = visibleCommands[activeIndex];

  const runCommand = useCallback(
    async (command: Command) => {
      setStatus(null);
      await command.run();
      if (!command.keepOpen) {
        closePalette();
        return;
      }
      window.requestAnimationFrame(() => inputRef.current?.focus());
    },
    [closePalette],
  );

  return (
    <Modal
      open={open}
      onClose={closePalette}
      title="Tìm nhanh"
      subtitle="Gõ để lọc · ↑↓ để chọn · Enter để chạy"
      initialFocusRef={inputRef}
    >
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Từ khoá
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setStatus(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, Math.max(0, visibleCommands.length - 1)));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((prev) => Math.max(0, prev - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (activeCommand) void runCommand(activeCommand);
              } else if (event.key === "Escape") {
                event.preventDefault();
                closePalette();
              }
            }}
            className="w-full rounded-2xl border border-line/15 bg-surface/25 px-4 py-3 text-sm text-foreground outline-none focus:border-accent/60"
            placeholder="Ví dụ: board, thư, cài đặt… (Ctrl/⌘K để mở)"
            autoComplete="off"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>
            {visibleCommands.length} kết quả · phím tắt:{" "}
            <span className="rounded-md border border-line/15 bg-paper px-2 py-1 font-semibold text-foreground shadow-sm">
              {getShortcutLabel()}
            </span>
          </span>
          <span className="rounded-md bg-accent-soft px-2 py-1 font-semibold text-accent">
            / để mở nhanh
          </span>
        </div>

        {status && (
          <div className="rounded-2xl border border-line/15 bg-paper px-4 py-3 text-sm text-muted shadow-sm">
            {status}
          </div>
        )}

        {visibleCommands.length === 0 ? (
          <div className="rounded-2xl border border-line/15 bg-paper px-4 py-6 text-center text-sm text-muted shadow-sm">
            Không có kết quả nào. Thử gõ từ khoá khác nhé.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Sticker variant="mint">Điều hướng</Sticker>
              <div
                role="listbox"
                aria-label="Điều hướng"
                className="max-h-72 space-y-2 overflow-y-auto pr-1"
              >
                {navCommands.length === 0 ? (
                  <div className="rounded-2xl border border-line/15 bg-paper px-4 py-4 text-sm text-muted shadow-sm">
                    Không có trang nào khớp.
                  </div>
                ) : (
                  navCommands.map((command) => {
                    const idx = indexById.get(command.id) ?? 0;
                    const active = idx === activeIndex;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        onClick={() => void runCommand(command)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          active
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-line/15 bg-paper text-foreground hover:border-accent/40"
                        }`}
                      >
                        <div className="font-semibold">{command.title}</div>
                        {command.description && (
                          <div className="mt-1 text-xs text-muted">{command.description}</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Sticker variant="lemon">Hành động</Sticker>
              <div
                role="listbox"
                aria-label="Hành động"
                className="max-h-72 space-y-2 overflow-y-auto pr-1"
              >
                {actionCommands.length === 0 ? (
                  <div className="rounded-2xl border border-line/15 bg-paper px-4 py-4 text-sm text-muted shadow-sm">
                    Không có hành động nào khớp.
                  </div>
                ) : (
                  actionCommands.map((command) => {
                    const idx = indexById.get(command.id) ?? 0;
                    const active = idx === activeIndex;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onFocus={() => setActiveIndex(idx)}
                        onClick={() => void runCommand(command)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          active
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-line/15 bg-paper text-foreground hover:border-accent/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold">{command.title}</div>
                          {command.shortcut && (
                            <span className="rounded-md border border-line/15 bg-paper px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted shadow-sm">
                              {command.shortcut}
                            </span>
                          )}
                        </div>
                        {command.description && (
                          <div className="mt-1 text-xs text-muted">{command.description}</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

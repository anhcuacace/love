import { useEffect, useMemo, useRef, useState } from "react";

import tracksData from "../../data/tracks.sample.json";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Button } from "../common/Button";
import { Sticker } from "../common/Sticker";
import { useSettings } from "../../store/settingsContext";

type Track = {
  id: string;
  title: string;
  artist?: string;
  src: string;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const MusicDock = () => {
  const { musicEnabled, toggleMusic } = useSettings();
  const tracks = tracksData as Track[];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayOnLoadRef = useRef(false);

  const [collapsed, setCollapsed] = useLocalStorage<boolean>("lovestory:music-collapsed", false);
  const [volume, setVolume] = useLocalStorage<number>("lovestory:music-volume", 0.65);
  const [activeTrackId, setActiveTrackId] = useLocalStorage<string>(
    "lovestory:music-track",
    tracks[0]?.id ?? "",
  );
  const [shuffle, setShuffle] = useLocalStorage<boolean>("lovestory:music-shuffle", false);
  const [loop, setLoop] = useLocalStorage<boolean>("lovestory:music-loop", false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const progress = useMemo(() => {
    if (!Number.isFinite(duration) || duration <= 0) return 0;
    const ratio = currentTime / duration;
    return Math.min(100, Math.max(0, ratio * 100));
  }, [currentTime, duration]);

  const activeTrack = useMemo(() => {
    if (tracks.length === 0) return null;
    const found = tracks.find((track) => track.id === activeTrackId);
    return found ?? tracks[0] ?? null;
  }, [activeTrackId, tracks]);

  const activeIndex = useMemo(() => {
    if (!activeTrack) return -1;
    return tracks.findIndex((track) => track.id === activeTrack.id);
  }, [activeTrack, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    try {
      await audio.play();
    } catch (err) {
      console.error("Failed to play audio", err);
      setIsPlaying(false);
      setError("Không phát được nhạc. Hãy kiểm tra file trong `public/music/` và đường dẫn `src`.");
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  };

  const togglePlay = () => {
    if (!activeTrack) return;
    if (isPlaying) {
      pause();
    } else {
      void play();
    }
  };

  const selectTrack = (id: string, options?: { autoplay?: boolean }) => {
    autoplayOnLoadRef.current = Boolean(options?.autoplay);
    setError(null);
    setDuration(0);
    setCurrentTime(0);
    setActiveTrackId(id);
  };

  const nextTrack = (options?: { autoplay?: boolean }) => {
    if (tracks.length === 0) return;
    const autoplay = options?.autoplay ?? isPlaying;
    if (shuffle) {
      const candidates = tracks.filter((track) => track.id !== activeTrack?.id);
      const pickFrom = candidates.length > 0 ? candidates : tracks;
      const random = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      if (random) selectTrack(random.id, { autoplay });
      return;
    }

    const next = tracks[(activeIndex + 1) % tracks.length];
    if (next) selectTrack(next.id, { autoplay });
  };

  const prevTrack = (options?: { autoplay?: boolean }) => {
    if (tracks.length === 0) return;
    const autoplay = options?.autoplay ?? isPlaying;
    const prev = tracks[(activeIndex - 1 + tracks.length) % tracks.length];
    if (prev) selectTrack(prev.id, { autoplay });
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (next) setShowPlaylist(false);
      return next;
    });
  };

  if (!musicEnabled) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
      <div className="mx-auto max-w-6xl">
        <div
          className={`torn-bottom rounded-2xl border border-line/15 bg-paper/90 shadow-paper backdrop-blur-sm ${
            collapsed ? "p-3" : "p-4"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Sticker variant="mint">Nhạc nền</Sticker>
              <div className="space-y-1">
                <p className="font-semibold leading-tight text-foreground">
                  {activeTrack?.title ?? "Chưa có playlist"}
                </p>
                {!collapsed && (
                  <p className="text-xs text-muted">
                    {activeTrack?.artist ??
                      "Thêm file mp3 vào `public/music/` rồi sửa `src/data/tracks.sample.json`."}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <Button
                variant="secondary"
                className="px-3 py-2 text-xs"
                onClick={() => prevTrack()}
                disabled={tracks.length <= 1}
              >
                Trước
              </Button>
              <Button
                variant="primary"
                className="px-4 py-2 text-xs"
                onClick={togglePlay}
                disabled={!activeTrack}
              >
                {isPlaying ? "Tạm dừng" : "Phát"}
              </Button>
              <Button
                variant="secondary"
                className="px-3 py-2 text-xs"
                onClick={() => nextTrack()}
                disabled={tracks.length <= 1}
              >
                Sau
              </Button>

              {!collapsed && (
                <>
                  <button
                    type="button"
                    onClick={() => setShuffle((prev) => !prev)}
                    aria-pressed={shuffle}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      shuffle
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line/15 bg-paper text-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    Xáo trộn
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoop((prev) => !prev)}
                    aria-pressed={loop}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      loop
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line/15 bg-paper text-muted hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    Lặp
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPlaylist((prev) => !prev)}
                    aria-expanded={showPlaylist}
                    className="rounded-xl border border-line/15 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-sm transition hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    disabled={tracks.length <= 1}
                  >
                    Danh sách
                  </button>
                </>
              )}

              <Button variant="ghost" className="px-3 py-2 text-xs" onClick={toggleMusic}>
                Tắt
              </Button>

              <button
                type="button"
                onClick={toggleCollapsed}
                aria-pressed={collapsed}
                className="rounded-xl border border-line/15 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-sm transition hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {collapsed ? "Mở" : "Thu gọn"}
              </button>
            </div>
          </div>

          {collapsed && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line/10">
              <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
          )}

          {!collapsed && (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.25}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setCurrentTime(next);
                    const audio = audioRef.current;
                    if (audio) audio.currentTime = next;
                  }}
                  className="h-2 w-full cursor-pointer accent-accent"
                  aria-label="Tiến độ bài hát"
                  disabled={!activeTrack || duration <= 0}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:w-64">
                <Sticker variant="lemon">Âm lượng</Sticker>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-accent"
                  aria-label="Âm lượng"
                />
              </div>
            </div>
          )}

          {!collapsed && showPlaylist && tracks.length > 1 && (
            <div className="mt-3 rounded-2xl border border-line/15 bg-surface/25 p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                  Playlist
                </p>
                <button
                  type="button"
                  onClick={() => setShowPlaylist(false)}
                  className="rounded-xl border border-line/15 bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted shadow-sm transition hover:border-accent/40 hover:text-foreground"
                >
                  Đóng
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {tracks.map((track) => {
                  const active = track.id === activeTrack?.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => selectTrack(track.id, { autoplay: isPlaying })}
                      className={`rounded-2xl border p-3 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                        active
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line/15 bg-paper text-foreground hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold leading-tight">{track.title}</p>
                          <p className="text-xs text-muted">{track.artist ?? "—"}</p>
                        </div>
                        {active && (
                          <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-surface shadow-paper">
                            Đang phát
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">
                Tip: thêm bài trong `src/data/tracks.sample.json` và đặt file ở `public/music/`.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-xl border border-rose-200/70 bg-rose-200/40 px-3 py-2 text-sm text-rose-950">
              {error}
            </div>
          )}
        </div>
      </div>

      <audio
        key={activeTrack?.id}
        ref={audioRef}
        src={activeTrack?.src}
        preload="metadata"
        loop={loop}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => {
          setError(null);
          setDuration(0);
          setCurrentTime(0);
        }}
        onCanPlay={() => {
          if (!autoplayOnLoadRef.current) return;
          autoplayOnLoadRef.current = false;
          void play();
        }}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => {
          if (loop) return;
          nextTrack({ autoplay: true });
        }}
        onError={() => {
          setIsPlaying(false);
          setError("Không tải được file nhạc. Kiểm tra đường dẫn `src` và file trong `public/music/`.");
        }}
      />
    </div>
  );
};

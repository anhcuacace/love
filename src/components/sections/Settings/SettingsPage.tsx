import { useMemo, useRef, useState } from "react";

import { useSettings, type Language, type Theme } from "../../../store/settingsContext";
import { getAnniversaryStats, parseISODate } from "../../../utils/anniversary";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";

const themes: { id: Theme; label: string; description: string }[] = [
  { id: "scrapbook", label: "Scrapbook", description: "Polaroid + giấy note" },
  { id: "light", label: "Sáng", description: "Sáng sủa, nhẹ nhàng" },
  { id: "dark", label: "Tối", description: "Tối giản, nổi bật nội dung" },
  { id: "romantic", label: "Lãng mạn", description: "Hồng tím mộng mơ" },
];

const languages: { id: Language; label: string }[] = [
  { id: "vi", label: "Tiếng Việt" },
  { id: "en", label: "Tiếng Anh" },
];

export const SettingsPage = () => {
  const { theme, setTheme, language, setLanguage, musicEnabled, toggleMusic, startDate, setStartDate } =
    useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const anniversary = useMemo(() => {
    const parsed = parseISODate(startDate);
    if (!parsed) return null;
    return getAnniversaryStats(parsed);
  }, [startDate]);

  const anniversaryFormat = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  const downloadBackup = () => {
    const prefix = "lovestory:";
    const data: Record<string, unknown> = {};
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const raw = window.localStorage.getItem(key);
      if (raw == null) continue;
      try {
        data[key] = JSON.parse(raw) as unknown;
      } catch {
        data[key] = raw;
      }
    }

    const payload = {
      version: 1,
      createdAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lovestory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    setBackupStatus("Đã tải file sao lưu.");
  };

  const restoreBackup = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { data?: Record<string, unknown> };
      const data = parsed.data;
      if (!data || typeof data !== "object") {
        setBackupStatus("File không đúng định dạng. Cần có field `data`.");
        return;
      }

      const ok = window.confirm("Khôi phục sẽ ghi đè dữ liệu hiện tại và tải lại trang. Tiếp tục?");
      if (!ok) return;

      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith("lovestory:")) return;
        window.localStorage.setItem(key, JSON.stringify(value));
      });

      window.location.reload();
    } catch (err) {
      console.error("Failed to restore backup", err);
      setBackupStatus("Không đọc được file sao lưu. Hãy thử lại.");
    }
  };

  const resetLocalData = () => {
    const ok = window.confirm("Xoá toàn bộ dữ liệu local (theme, nhạc, yêu thích, ghi chú, kỷ lục). Tiếp tục?");
    if (!ok) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("lovestory:")) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <PageContainer title="Cài đặt">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Cài đặt"
          title="Tuỳ chỉnh trải nghiệm"
          subtitle="Giao diện, ngôn ngữ và nhạc nền sẽ lưu vào localStorage."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card title="Giao diện" description="Chọn vibe cho toàn bộ website">
            <div className="space-y-3">
              {themes.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-line/15 bg-surface/30 px-3 py-2 shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    value={item.id}
                    checked={theme === item.id}
                    onChange={() => setTheme(item.id)}
                    className="accent-accent"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card title="Ngôn ngữ" description="Đổi ngôn ngữ hiển thị">
            <div className="space-y-3">
              {languages.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-line/15 bg-surface/30 px-3 py-2 shadow-sm"
                >
                  <span className="font-semibold">{item.label}</span>
                  <input
                    type="radio"
                    name="language"
                    value={item.id}
                    checked={language === item.id}
                    onChange={() => setLanguage(item.id)}
                    className="accent-accent"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card title="Nhạc" description="Bật nhạc nền lãng mạn">
            <div className="flex items-center justify-between rounded-xl border border-line/15 bg-surface/30 px-3 py-2 shadow-sm">
              <div>
                <p className="font-semibold">Nhạc nền</p>
                <p className="text-sm text-muted">Player nằm ở đáy màn hình, có play/pause và volume.</p>
              </div>
              <button
                type="button"
                onClick={toggleMusic}
                role="switch"
                aria-checked={musicEnabled}
                aria-label="Bật/tắt nhạc nền"
                className={`flex h-8 w-16 items-center rounded-full border border-line/15 bg-paper px-1 shadow-sm transition ${
                  musicEnabled ? "bg-accent/20" : "bg-surface/40"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-full bg-paper shadow transition ${
                    musicEnabled ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Thêm file nhạc vào `public/music/` rồi sửa `src/data/tracks.sample.json`.
            </p>
          </Card>

          <Card title="Kỷ niệm" description="Đặt ngày bắt đầu để đếm ngày bên nhau">
            <div className="space-y-3">
              <label className="flex flex-col gap-2 rounded-xl border border-line/15 bg-surface/30 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Ngày bắt đầu
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-line/15 bg-paper px-3 py-2 text-sm text-foreground outline-none focus:border-accent/60"
                />
              </label>

              {anniversary ? (
                <div className="rounded-xl border border-line/15 bg-paper p-3 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    Đã bên nhau {anniversary.daysTogether} ngày
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Kỷ niệm tiếp theo: {anniversaryFormat.format(anniversary.nextAnniversary)} · còn{" "}
                    {anniversary.daysUntilNext} ngày
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Nhập ngày theo định dạng YYYY-MM-DD để hiển thị bộ đếm.
                </p>
              )}
            </div>
          </Card>

          <Card title="Sao lưu" description="Backup/restore dữ liệu localStorage">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={downloadBackup}>
                  Tải file sao lưu
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Khôi phục
                </Button>
                <Button variant="ghost" onClick={resetLocalData}>
                  Xoá dữ liệu local
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void restoreBackup(file);
                  event.target.value = "";
                }}
              />

              {backupStatus && <p className="text-sm text-muted">{backupStatus}</p>}
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Gợi ý: sao lưu trước khi đổi máy/trình duyệt.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

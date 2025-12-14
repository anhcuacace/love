import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useSettings } from "../../../store/settingsContext";
import { getAnniversaryStats, parseISODate } from "../../../utils/anniversary";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { SectionTitle } from "../../common/SectionTitle";
import { StickyNote } from "../../common/StickyNote";
import { PageContainer } from "../../layout/PageContainer";
import { HomeHero } from "./HomeHero";

const highlights = [
  {
    id: "board",
    title: "Bảng scrapbook",
    description: "Kéo thả polaroid, note và sticker để xếp layout.",
    to: "/board",
  },
  {
    id: "story",
    title: "Hành trình",
    description: "Các mốc kỷ niệm, lọc theo loại và xem chi tiết.",
    to: "/our-story",
  },
  {
    id: "her-gallery",
    title: "Album của em",
    description: "Album riêng của em, có lightbox và yêu thích.",
    to: "/her-gallery",
  },
  {
    id: "map",
    title: "Bản đồ kỷ niệm",
    description: "Bản đồ những nơi đã đến cùng nhau, marker + popup.",
    to: "/memories-map",
  },
  {
    id: "letters",
    title: "Thư & nhật ký",
    description: "Thư tay, lọc theo tâm trạng và hiệu ứng gõ chữ.",
    to: "/letters",
  },
];

export const HomePage = () => {
  const { startDate } = useSettings();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("lovestory:intro-shown") !== "1";
  });

  useEffect(() => {
    if (!showIntro) return;
    window.sessionStorage.setItem("lovestory:intro-shown", "1");
    const timer = window.setTimeout(() => setShowIntro(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

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

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-surface text-foreground"
            aria-live="polite"
          >
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="fixed right-4 top-4 rounded-xl border border-line/15 bg-paper/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground shadow-paper backdrop-blur-sm transition hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Bỏ qua
            </button>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-line/15 bg-paper px-6 py-4 text-center shadow-paper"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Đang mở album kỷ niệm…</p>
              <p className="mt-2 text-lg font-semibold">Một chút đợi chờ cho điều ngọt ngào.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageContainer title="Trang chủ">
        <div className="space-y-12">
          <HomeHero />

          <StickyNote
            eyebrow="Kỷ niệm"
            title={
              anniversary ? `Đã bên nhau ${anniversary.daysTogether} ngày` : "Bộ đếm kỷ niệm"
            }
            variant="mint"
            tilt="left"
            className="max-w-3xl bg-emerald-100/80"
          >
            {anniversary ? (
              <div className="space-y-2">
                <p className="text-lg opacity-80">
                  Kỷ niệm tiếp theo: {anniversaryFormat.format(anniversary.nextAnniversary)} · còn{" "}
                  {anniversary.daysUntilNext} ngày.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" to="/our-story">
                    Xem hành trình
                  </Button>
                  <Button variant="secondary" to="/settings">
                    Chỉnh ngày bắt đầu
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg opacity-80">
                  Mở Cài đặt để chọn ngày bắt đầu, trang chủ sẽ tự đếm ngày bên nhau.
                </p>
                <Button variant="secondary" to="/settings">
                  Mở Cài đặt
                </Button>
              </div>
            )}
          </StickyNote>

          <section className="space-y-6">
            <SectionTitle
              eyebrow="Xem nhanh"
              title="Khám phá nhanh"
              subtitle="Đi thẳng tới những khu vực chính, tất cả đều còn nhiều điều để kể."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {highlights.map((item) => (
                <Card
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  actions={
                    <Button variant="secondary" to={item.to}>
                      Mở
                    </Button>
                  }
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {/* TODO: hook data preview (ảnh, stats) cho từng khu vực */}
                    Sẽ hiển thị preview nội dung khi có dữ liệu thật.
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <StickyNote
            eyebrow="Ghi chú"
            title="Ý tưởng tiếp theo"
            variant="lemon"
            tilt="right"
            className="max-w-3xl bg-amber-100/80"
          >
            <p className="text-lg opacity-80">
              Sau khi hoàn thiện các module, Trang chủ sẽ có intro video ngắn, nút play nhạc nhanh và
              nút random quote dành riêng cho em.
            </p>
          </StickyNote>
        </div>
      </PageContainer>
    </>
  );
};

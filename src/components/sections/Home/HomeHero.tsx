import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../common/Button";
import { Polaroid } from "../../common/Polaroid";
import { Sticker } from "../../common/Sticker";
import { StickyNote } from "../../common/StickyNote";

const rotatingWords = ["khoảnh khắc", "giấc mơ", "dòng thư", "hành trình", "bài hát"];

const moodChips = [
  { id: "timeline", label: "hành trình" },
  { id: "gallery", label: "album" },
  { id: "letters", label: "thư" },
  { id: "map", label: "bản đồ" },
  { id: "games", label: "trò chơi" },
];

export const HomeHero = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const currentWord = useMemo(() => rotatingWords[wordIndex], [wordIndex]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line/15 bg-paper p-8 shadow-paper md:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgb(244_114_182_/_0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_12%,rgb(34_197_94_/_0.10),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_90%,rgb(59_130_246_/_0.10),transparent_40%)]" />

      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Sticker variant="lemon" className="px-4 py-2 text-xs">
            Ghi chú yêu thương · dành riêng cho em
          </Sticker>
          <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
            Một góc nhỏ để lưu giữ tất cả những{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="font-hand text-accent"
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
            <br />
            mà chúng ta đã cùng nhau tạo nên.
          </h1>
          <p className="text-lg text-muted md:max-w-xl">
            Website kỷ niệm tình yêu, nơi có dòng thời gian, album, thư tay, bản đồ kỷ niệm và những trò chơi bé xinh.
            Mọi thứ ở đây đều dành riêng cho em.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => navigate("/our-story")}>Hành trình của chúng ta</Button>
            <Button variant="secondary" onClick={() => navigate("/her-gallery")}>
              Chỉ riêng em
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {moodChips.map((chip, index) => {
              const variants: Parameters<typeof Sticker>[0]["variant"][] = [
                "mint",
                "sky",
                "lemon",
                "accent",
              ];
              const variant = variants[index % variants.length] ?? "accent";
              return (
                <motion.div key={chip.id} whileHover={{ scale: 1.03 }}>
                  <Sticker variant={variant}>{chip.label}</Sticker>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative mx-auto h-[420px] max-w-md">
            <div className="absolute left-0 top-10 w-56">
              <Polaroid
                src="/cuti/PXL_20240804_042658230.jpg"
                alt="Nắng sớm trên phố"
                caption="Nắng sớm"
                meta="Thg 8 2024"
                tiltSeed="hero-1"
                showTape
              />
            </div>
            <div className="absolute right-0 top-0 w-60">
              <Polaroid
                src="/tet_holiday_2024/PXL_20230121_170147705.jpg"
                alt="Tết nhà anh"
                caption="Tết nhà anh"
                meta="Thg 1 2023"
                tiltSeed="hero-2"
                showTape
              />
            </div>
            <div className="absolute bottom-0 left-16 w-64">
              <Polaroid
                src="/main.jpg"
                alt="Ảnh kỷ niệm của chúng ta"
                caption="Chúng ta"
                meta="Mãi mãi"
                tiltSeed="hero-3"
                showTape
              />
            </div>
          </div>

          <StickyNote
            eyebrow="TODO"
            title="Video mở đầu"
            variant="lemon"
            tilt="left"
            className="pointer-events-none absolute -left-10 bottom-6 hidden max-w-xs rotate-[-5deg] bg-amber-100/80 md:block"
          >
            Intro clip sẽ được thêm ở bước tiếp theo.
          </StickyNote>
        </motion.div>
      </div>
    </section>
  );
};

import { useEffect, useMemo, useState } from "react";

import lettersData from "../../../data/letters.sample.json";
import quotesData from "../../../data/quotes.sample.json";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Modal } from "../../common/Modal";
import { Sticker } from "../../common/Sticker";
import { StickyNote } from "../../common/StickyNote";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";

type Letter = {
  id: string;
  title: string;
  date: string;
  mood: string;
  content: string;
};

type Quote = {
  id: string;
  text: string;
};

const formatDate = (input: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(input));

export const LettersPage = () => {
  const letters = lettersData as Letter[];
  const quotes = quotesData as Quote[];

  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typedContent, setTypedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const moods = useMemo(() => {
    const set = new Set<string>();
    letters.forEach((letter) => set.add(letter.mood));
    return Array.from(set);
  }, [letters]);

  const stats = useMemo(() => {
    const totalWords = letters.reduce(
      (sum, letter) => sum + letter.content.split(/\s+/).length,
      0,
    );
    const sorted = [...letters].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return {
      total: letters.length,
      moods: moods.length,
      latest: sorted[0] ? formatDate(sorted[0].date) : "Đang cập nhật",
      words: totalWords,
    };
  }, [letters, moods.length]);

  const filteredLetters = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return letters
      .filter(
        (letter) => moodFilter === "all" || letter.mood.toLowerCase() === moodFilter,
      )
      .filter((letter) => {
        if (!term) return true;
        return (
          letter.title.toLowerCase().includes(term) ||
          letter.content.toLowerCase().includes(term) ||
          letter.mood.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [letters, moodFilter, searchTerm]);

  const selectedLetter = useMemo(
    () => letters.find((item) => item.id === selectedId) ?? null,
    [letters, selectedId],
  );

  useEffect(() => {
    if (!selectedLetter) return;

    const text = selectedLetter.content;
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setTypedContent(text.slice(0, index));
      if (index >= text.length) {
        setIsTyping(false);
        window.clearInterval(timer);
      }
    }, 12);

    return () => window.clearInterval(timer);
  }, [selectedLetter]);

  const handleRandomQuote = () => {
    if (quotes.length <= 1) return;
    let next = Math.floor(Math.random() * quotes.length);
    if (next === quoteIndex) {
      next = (quoteIndex + 1) % quotes.length;
    }
    setQuoteIndex(next);
  };

  const handleOpenLetter = (id: string) => {
    setSelectedId(id);
    setTypedContent("");
    setIsTyping(true);
  };

  const handleRandomLetter = () => {
    if (letters.length === 0) return;
    const random = letters[Math.floor(Math.random() * letters.length)];
    handleOpenLetter(random.id);
  };

  const handleCloseLetter = () => {
    setSelectedId(null);
    setTypedContent("");
    setIsTyping(false);
  };

  return (
    <PageContainer title="Thư">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Thư"
          title="Thư & nhật ký"
          subtitle="Lọc theo tâm trạng, tìm kiếm, mở thư với hiệu ứng gõ chữ và quote ngẫu nhiên dành cho em."
        />

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Tổng thư</p>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted">Số thư đã lưu lại</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Tâm trạng</p>
            <p className="text-2xl font-semibold text-foreground">{stats.moods}</p>
            <p className="text-xs text-muted">Số tâm trạng khác nhau</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Mới nhất</p>
            <p className="text-sm text-foreground">{stats.latest}</p>
            <p className="text-xs text-muted">Ngày thư gần nhất</p>
          </div>
          <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-paper">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Số từ</p>
            <p className="text-2xl font-semibold text-foreground">{stats.words}</p>
            <p className="text-xs text-muted">Tổng số từ đã viết</p>
          </div>
        </div>

        <div className="torn-bottom rounded-2xl border border-line/15 bg-paper p-4 shadow-paper md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <Sticker variant="lemon">Bộ lọc</Sticker>
              <p className="text-sm text-muted">
                {filteredLetters.length}/{letters.length} thư · lọc theo tâm trạng hoặc gõ từ khóa.
              </p>
            </div>
            <div className="flex flex-1 items-center gap-3">
              <label className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Tìm kiếm
              </label>
              <input
                type="search"
                placeholder="Tiêu đề, nội dung, tâm trạng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-line/15 bg-surface/30 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMoodFilter("all")}
              aria-pressed={moodFilter === "all"}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                moodFilter === "all"
                  ? "bg-accent text-surface shadow-paper"
                  : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            {moods.map((mood) => {
              const active = moodFilter === mood.toLowerCase();
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setMoodFilter(mood.toLowerCase())}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    active
                      ? "bg-accent text-surface shadow-paper"
                      : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            {filteredLetters.map((letter) => (
              <Card
                key={letter.id}
                title={letter.title}
                description={`${formatDate(letter.date)} · tâm trạng: ${letter.mood}`}
                actions={
                  <Button variant="secondary" onClick={() => handleOpenLetter(letter.id)}>
                    Đọc thư
                  </Button>
                }
              >
                <p className="line-clamp-3 text-foreground">{letter.content}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Nhấn “Đọc thư” để mở hiệu ứng gõ chữ và xem toàn bộ nội dung.
                </p>
              </Card>
            ))}
            {filteredLetters.length === 0 && (
              <div className="rounded-2xl border border-line/15 bg-paper p-6 text-center text-muted shadow-paper">
                Không có thư nào khớp bộ lọc hiện tại.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card
              title="Thư nổi bật"
              description="Chọn thư bất kỳ để đọc nhanh."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={handleRandomLetter}>
                    Thư ngẫu nhiên
                  </Button>
                  {filteredLetters[0] && (
                    <Button variant="ghost" onClick={() => handleOpenLetter(filteredLetters[0].id)}>
                      Mới nhất
                    </Button>
                  )}
                </div>
              }
            >
              {selectedLetter ? (
                <div className="space-y-2 rounded-xl border border-line/15 bg-surface/25 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-accent">
                      {selectedLetter.mood}
                    </span>
                    <span className="rounded-full bg-paper px-3 py-1 shadow-sm">
                      {formatDate(selectedLetter.date)}
                    </span>
                  </div>
                  <p className="line-clamp-4 text-foreground">{selectedLetter.content}</p>
                  <p className="text-xs text-muted">
                    Mở modal để đọc toàn bộ và xem hiệu ứng gõ chữ.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Chưa chọn thư nào. Chọn một thư bên trái hoặc nhấn “Thư ngẫu nhiên”.
                </p>
              )}
            </Card>

            <Card
              title="Ghi chú yêu thương"
              description="Một câu ngẫu nhiên dành cho em"
              actions={
                <Button variant="secondary" onClick={handleRandomQuote}>
                  Đổi câu
                </Button>
              }
            >
              <StickyNote
                variant="lemon"
                tilt="right"
                showTape={false}
                className="bg-amber-100/80"
              >
                <p className="font-hand text-2xl leading-snug">
                  “{quotes[quoteIndex]?.text}”
                </p>
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                  Mỗi lần nhấn sẽ đổi sang câu khác, giữ làm ghi chú bên cạnh thư.
                </p>
              </StickyNote>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(selectedLetter)}
        onClose={handleCloseLetter}
        title={selectedLetter?.title}
        subtitle={
          selectedLetter
            ? `${formatDate(selectedLetter.date)} · tâm trạng: ${selectedLetter.mood}`
            : undefined
        }
        footer={
          <Button variant="secondary" onClick={handleCloseLetter}>
            Đóng
          </Button>
        }
      >
        {selectedLetter && (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              Hiệu ứng gõ chữ · {isTyping ? "Đang gõ..." : "Đã hoàn tất"}
            </div>
            <div className="rounded-2xl border border-line/15 bg-surface/25 p-4 shadow-sm">
              <p className="font-hand text-xl leading-relaxed whitespace-pre-wrap text-foreground">
                {typedContent}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

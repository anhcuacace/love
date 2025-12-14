import { useCallback, useEffect, useMemo, useState } from "react";

import quizData from "../../../data/quiz.sample.json";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";
import { Modal } from "../../common/Modal";
import { SectionTitle } from "../../common/SectionTitle";
import { PageContainer } from "../../layout/PageContainer";

type Difficulty = "chill" | "normal" | "hard";

type MemoryCard = {
  id: string;
  pairId: string;
  icon: string;
  label: string;
};

type Score = { moves: number; seconds: number };

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  note?: string;
};

type QuizBest = { score: number; total: number; at: string };

const basePairs: Omit<MemoryCard, "id" | "pairId">[] = [
  { icon: "🌸", label: "Hoa anh đào" },
  { icon: "🎧", label: "Nghe nhạc" },
  { icon: "🍰", label: "Bánh ngọt" },
  { icon: "📸", label: "Chụp hình" },
  { icon: "☕️", label: "Cafe" },
  { icon: "🌙", label: "Đêm muộn" },
  { icon: "🚂", label: "Tàu điện" },
  { icon: "🎈", label: "Sinh nhật" },
  { icon: "🏖️", label: "Biển xanh" },
  { icon: "📚", label: "Đọc sách" },
  { icon: "🎬", label: "Xem phim" },
  { icon: "🌿", label: "Đi dạo" },
];

const difficultyPairs: Record<Difficulty, number> = {
  chill: 6,
  normal: 8,
  hard: 10,
};

const buildShuffledDeck = (pairCount: number) => {
  const selectedPairs = basePairs.slice(0, pairCount);
  const cards: MemoryCard[] = selectedPairs.flatMap((item, index) => {
    const pairId = `${item.label}-${index}`;
    return [
      { id: `${pairId}-a`, pairId, icon: item.icon, label: item.label },
      { id: `${pairId}-b`, pairId, icon: item.icon, label: item.label },
    ];
  });

  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

export const GamesPage = () => {
  const quizQuestions = quizData as QuizQuestion[];
  const [difficulty, setDifficulty] = useState<Difficulty>("chill");
  const [deck, setDeck] = useState<MemoryCard[]>(() =>
    buildShuffledDeck(difficultyPairs.chill),
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [bestScores, setBestScores] = useLocalStorage<Record<Difficulty, Score | undefined>>(
    "lovestory:memory-best",
    { chill: undefined, normal: undefined, hard: undefined },
  );
  const [quizBest, setQuizBest] = useLocalStorage<QuizBest | null>("lovestory:quiz-best", null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const pairCount = difficultyPairs[difficulty];
  const isComplete = matchedPairs.length === pairCount;

  const resetGame = useCallback((nextDifficulty: Difficulty) => {
    setDifficulty(nextDifficulty);
    setDeck(buildShuffledDeck(difficultyPairs[nextDifficulty]));
    setFlipped([]);
    setMatchedPairs([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setLocked(false);
  }, []);

  useEffect(() => {
    if (!started || isComplete) return;
    const timer = window.setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isComplete, started]);

  useEffect(() => {
    if (!started || !isComplete) return;
    setBestScores((prev) => {
      const current = prev[difficulty];
      const better =
        !current ||
        moves < current.moves ||
        (moves === current.moves && seconds < current.seconds);
      if (!better) return prev;
      return { ...prev, [difficulty]: { moves, seconds } };
    });
  }, [difficulty, isComplete, moves, seconds, setBestScores, started]);

  const handleFlip = (cardId: string) => {
    if (locked) return;
    const card = deck.find((item) => item.id === cardId);
    if (!card) return;

    const alreadyMatched = matchedPairs.includes(card.pairId);
    const alreadyFlipped = flipped.includes(cardId);
    if (alreadyMatched || alreadyFlipped) return;

    const nextFlipped = [...flipped, cardId].slice(-2);
    setFlipped(nextFlipped);

    if (!started) setStarted(true);

    if (nextFlipped.length === 2) {
      setLocked(true);
      setMoves((prev) => prev + 1);

      const [first, second] = nextFlipped.map((id) => deck.find((item) => item.id === id));
      if (first && second && first.pairId === second.pairId) {
        setMatchedPairs((prev) => (prev.includes(first.pairId) ? prev : [...prev, first.pairId]));
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 450);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  const gridClass = useMemo(() => {
    if (deck.length >= 18) return "grid-cols-4 sm:grid-cols-5";
    if (deck.length >= 14) return "grid-cols-4 sm:grid-cols-4";
    return "grid-cols-3 sm:grid-cols-4";
  }, [deck.length]);

  const quizTotal = quizQuestions.length;
  const currentQuiz = quizQuestions[quizIndex] ?? null;
  const quizSelected = currentQuiz ? quizAnswers[currentQuiz.id] : undefined;

  const quizScore = useMemo(
    () =>
      quizQuestions.reduce(
        (sum, question) => sum + (quizAnswers[question.id] === question.answerIndex ? 1 : 0),
        0,
      ),
    [quizAnswers, quizQuestions],
  );

  const quizAllAnswered = useMemo(
    () => quizQuestions.length > 0 && quizQuestions.every((q) => q.id in quizAnswers),
    [quizAnswers, quizQuestions],
  );

  const startQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizFinished(false);
    setQuizOpen(true);
  };

  const finishQuiz = () => {
    if (quizQuestions.length === 0) return;
    const score = quizQuestions.reduce(
      (sum, question) => sum + (quizAnswers[question.id] === question.answerIndex ? 1 : 0),
      0,
    );
    setQuizFinished(true);
    setQuizBest((prev) => {
      if (!prev) return { score, total: quizQuestions.length, at: new Date().toISOString() };
      const prevRatio = prev.total > 0 ? prev.score / prev.total : 0;
      const nextRatio = quizQuestions.length > 0 ? score / quizQuestions.length : 0;
      const better = nextRatio > prevRatio || (nextRatio === prevRatio && score > prev.score);
      return better ? { score, total: quizQuestions.length, at: new Date().toISOString() } : prev;
    });
  };

  return (
    <PageContainer title="Trò chơi">
      <div className="space-y-8">
        <SectionTitle
          eyebrow="Trò chơi"
          title="Chơi cùng kỷ niệm"
          subtitle="Memory Card đã chơi được: lật cặp biểu tượng kỷ niệm, đếm bước và lưu kỷ lục."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card
            title="Memory Card"
            description={`Tìm ${pairCount} cặp biểu tượng, ${matchedPairs.length}/${pairCount} đã ghép đúng.`}
            actions={
              <div className="flex flex-wrap gap-2">
                {(["chill", "normal", "hard"] as const).map((level) => {
                  const active = difficulty === level;
                  const labels: Record<Difficulty, string> = {
                    chill: "Dễ",
                    normal: "Thử thách",
                    hard: "Khó",
                  };
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => resetGame(level)}
                      aria-pressed={active}
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        active
                          ? "bg-accent text-surface shadow-paper"
                          : "border border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                      }`}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
                <Button variant="secondary" onClick={() => resetGame(difficulty)}>
                  Chơi lại
                </Button>
              </div>
            }
          >
            <div className={`grid gap-3 ${gridClass}`}>
              {deck.map((card) => {
                const revealed =
                  flipped.includes(card.id) || matchedPairs.includes(card.pairId);
                const matched = matchedPairs.includes(card.pairId);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleFlip(card.id)}
                    disabled={matched}
                    className={`relative flex aspect-square items-center justify-center rounded-xl border text-2xl transition duration-200 ${
                      revealed
                        ? matched
                          ? "border-emerald-300/70 bg-emerald-200/70 text-emerald-950 shadow-paper"
                          : "border-accent/50 bg-accent-soft text-accent shadow-paper"
                        : "border-line/15 bg-paper text-muted shadow-sm hover:border-accent/40 hover:text-foreground"
                    }`}
                  >
                    <span className="pointer-events-none select-none">{revealed ? card.icon : "?"}</span>
                    {matched && (
                      <span className="absolute inset-x-0 bottom-2 text-[11px] uppercase tracking-[0.2em] text-emerald-900/80">
                        Ghép xong
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="Thống kê" description="Theo dõi tiến độ">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Bước lật</p>
                  <p className="text-2xl font-semibold text-foreground">{moves}</p>
                </div>
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Thời gian</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {seconds}s
                  </p>
                </div>
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Ghép đúng</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {matchedPairs.length}/{pairCount}
                  </p>
                </div>
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Kỷ lục</p>
                  <p className="text-sm text-foreground">
                    {bestScores[difficulty]
                      ? `${bestScores[difficulty]?.moves} bước · ${bestScores[difficulty]?.seconds}s`
                      : "Chưa có"}
                  </p>
                </div>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted">
                Lật lần đầu sẽ bắt đầu đếm thời gian. Hoàn thành để lưu kỷ lục theo độ khó.
              </div>
              {isComplete && (
                <div className="rounded-xl border border-emerald-300/60 bg-emerald-200/70 px-3 py-2 text-sm text-emerald-950 shadow-sm">
                  Đã hoàn thành! Nhấn “Chơi lại” để thử độ khó khác.
                </div>
              )}
            </Card>

            <Card
              title="Love Quiz"
              description="Quiz nhanh để lưu kỷ niệm (bạn bổ sung câu hỏi sau)."
              actions={
                <Button variant="secondary" onClick={startQuiz} disabled={quizTotal === 0}>
                  Bắt đầu quiz
                </Button>
              }
            >
              <div className="grid gap-3 text-sm">
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Số câu hỏi</p>
                  <p className="text-2xl font-semibold text-foreground">{quizTotal}</p>
                </div>
                <div className="rounded-xl border border-line/15 bg-surface/25 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Kỷ lục</p>
                  <p className="text-sm text-foreground">
                    {quizBest ? `${quizBest.score}/${quizBest.total}` : "Chưa có"}
                  </p>
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Sửa nội dung trong `src/data/quiz.sample.json`.
              </p>
            </Card>

            <Card
              title="Các game khác (WIP)"
              description="Danh sách sẽ mở modal/route riêng khi hoàn thiện."
            >
              <ul className="space-y-2 text-sm text-muted">
                <li>• Quiz “Em hiểu cô ấy đến đâu?” với điểm số và giải thích vui.</li>
                <li>• Photo Puzzle ghép ảnh chung, chọn kích thước lưới.</li>
                <li>• Mini challenges: kéo thả sticker, tạo postcard nhanh.</li>
              </ul>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Giữ nguyên tinh thần, sẽ cập nhật dần trong repo này.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        title={quizFinished ? "Kết quả Love Quiz" : "Love Quiz"}
        subtitle={
          quizFinished
            ? `Điểm: ${quizScore}/${quizTotal}`
            : quizTotal > 0
              ? `Câu ${quizIndex + 1}/${quizTotal}`
              : "Chưa có câu hỏi"
        }
        footer={
          quizFinished ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={startQuiz} disabled={quizTotal === 0}>
                Chơi lại
              </Button>
              <Button variant="ghost" onClick={() => setQuizOpen(false)}>
                Đóng
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setQuizIndex((prev) => Math.max(0, prev - 1))}
                disabled={quizIndex === 0}
              >
                Trước
              </Button>
              <Button
                variant="ghost"
                onClick={() => setQuizIndex((prev) => Math.min(quizTotal - 1, prev + 1))}
                disabled={quizTotal === 0 || quizIndex >= quizTotal - 1}
              >
                Sau
              </Button>
              <Button variant="primary" onClick={finishQuiz} disabled={!quizAllAnswered}>
                Hoàn thành
              </Button>
            </div>
          )
        }
      >
        {quizTotal === 0 ? (
          <div className="rounded-2xl border border-line/15 bg-paper p-4 text-sm text-muted shadow-sm">
            Chưa có câu hỏi. Hãy bổ sung trong `src/data/quiz.sample.json`.
          </div>
        ) : quizFinished ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/15 bg-surface/25 p-4 text-sm text-foreground shadow-sm">
              <p className="text-lg font-semibold">Điểm của anh: {quizScore}/{quizTotal}</p>
              <p className="mt-1 text-sm text-muted">
                {quizScore === quizTotal
                  ? "Perfect! Anh hiểu em quá rồi."
                  : "Còn vài câu chưa chuẩn, nhưng yêu thì vẫn chuẩn nhất."}
              </p>
            </div>

            <div className="space-y-3">
              {quizQuestions.map((question, index) => {
                const picked = quizAnswers[question.id];
                const correct = picked === question.answerIndex;
                return (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-line/15 bg-paper p-4 shadow-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      Câu {index + 1}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{question.question}</p>
                    <p className="mt-2 text-sm text-muted">
                      Đáp án của anh:{" "}
                      <span className={correct ? "text-emerald-700" : "text-rose-700"}>
                        {typeof picked === "number" ? question.options[picked] : "Chưa chọn"}
                      </span>
                    </p>
                    {!correct && (
                      <p className="mt-1 text-sm text-muted">
                        Đáp án đúng:{" "}
                        <span className="font-semibold text-foreground">
                          {question.options[question.answerIndex]}
                        </span>
                      </p>
                    )}
                    {question.note && (
                      <p className="mt-2 text-sm text-muted">{question.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : currentQuiz ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line/15 bg-paper p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Câu hỏi</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{currentQuiz.question}</p>
            </div>

            <div className="space-y-2">
              {currentQuiz.options.map((option, idx) => {
                const active = quizSelected === idx;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setQuizAnswers((prev) => ({ ...prev, [currentQuiz.id]: idx }))
                    }
                    aria-pressed={active}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                      active
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line/15 bg-paper text-foreground hover:border-accent/40"
                    }`}
                  >
                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 text-[11px] uppercase tracking-[0.2em] text-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-line/15 bg-surface/25 p-3 text-sm text-muted shadow-sm">
              Mẹo: trả lời hết rồi nhấn “Hoàn thành” để xem kết quả.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line/15 bg-paper p-4 text-sm text-muted shadow-sm">
            Không tìm thấy câu hỏi.
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

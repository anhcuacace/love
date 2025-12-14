const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const diffDays = (from: Date, to: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return Math.round((end - start) / msPerDay);
};

export const parseISODate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export type AnniversaryStats = {
  startDate: Date;
  daysTogether: number;
  yearsTogether: number;
  nextAnniversary: Date;
  daysUntilNext: number;
};

export const getAnniversaryStats = (startDate: Date, now = new Date()): AnniversaryStats => {
  const today = startOfDay(now);
  const start = startOfDay(startDate);

  const rawDaysTogether = diffDays(start, today);
  const daysTogether = Math.max(0, rawDaysTogether) + 1;

  const month = start.getMonth();
  const day = start.getDate();
  const thisYearAnniversary = new Date(today.getFullYear(), month, day);
  const nextAnniversary =
    thisYearAnniversary.getTime() < today.getTime()
      ? new Date(today.getFullYear() + 1, month, day)
      : thisYearAnniversary;

  const daysUntilNext = Math.max(0, diffDays(today, nextAnniversary));

  const yearsTogether =
    today.getFullYear() -
    start.getFullYear() -
    (thisYearAnniversary.getTime() <= today.getTime() ? 0 : 1);

  return {
    startDate: start,
    daysTogether,
    yearsTogether: Math.max(0, yearsTogether),
    nextAnniversary,
    daysUntilNext,
  };
};

const MONTH_ABBREVIATIONS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"] as const;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RELATIVE_DAYS_LIMIT = 6;

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Whole calendar days between two local dates (DST-safe, ignores the time of day). */
function calendarDaysBetween(earlier: Date, later: Date): number {
  const start = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const end = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  return Math.round((end - start) / MS_PER_DAY);
}

/** Polish, human-friendly workout date: "Dziś, 18:30", "Wczoraj, 18:30", "3 dni temu", "6 wrz, 18:30". */
export function formatWorkoutDateLabel(date: Date, now: Date): string {
  const daysAgo = Math.max(0, calendarDaysBetween(date, now));
  if (daysAgo === 0) return `Dziś, ${formatTime(date)}`;
  if (daysAgo === 1) return `Wczoraj, ${formatTime(date)}`;
  if (daysAgo <= RELATIVE_DAYS_LIMIT) return `${daysAgo} dni temu`;

  const dayAndMonth = `${date.getDate()} ${MONTH_ABBREVIATIONS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear()
    ? `${dayAndMonth}, ${formatTime(date)}`
    : `${dayAndMonth} ${date.getFullYear()}`;
}

export function formatDurationMinutes(durationSeconds: number): number {
  return Math.max(1, Math.round(durationSeconds / 60));
}

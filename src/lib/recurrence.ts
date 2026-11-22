export type Recurrence = "none" | "weekly" | "monthly";

export type RecurringFields = {
  date?: string;
  time?: string;
  recurrence?: Recurrence;
  /** 0 = Sunday … 6 = Saturday */
  weekday?: number;
  /** 1–4 for first–fourth, -1 for last (monthly only) */
  weekOfMonth?: number;
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEK_OF_MONTH: [number, string][] = [
  [1, "first"],
  [2, "second"],
  [3, "third"],
  [4, "fourth"],
  [-1, "last"],
];

export function isRecurring(item: RecurringFields) {
  return (
    (item.recurrence === "weekly" || item.recurrence === "monthly") &&
    typeof item.weekday === "number"
  );
}

export function describeRecurrence(item: RecurringFields): string {
  if (!isRecurring(item)) return "";
  const day = WEEKDAYS[item.weekday!];
  if (item.recurrence === "weekly") return `Every ${day}`;
  const nth = WEEK_OF_MONTH.find(([n]) => n === item.weekOfMonth)?.[1] ?? "first";
  return `Every ${nth} ${day} of the month`;
}

/** The nth (or last) given weekday of a month, at local midnight. */
function nthWeekday(year: number, month: number, weekday: number, nth: number) {
  if (nth === -1) {
    const last = new Date(year, month + 1, 0);
    last.setDate(last.getDate() - ((last.getDay() - weekday + 7) % 7));
    return last;
  }
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const date = new Date(year, month, 1 + offset + (nth - 1) * 7);
  return date.getMonth() === month ? date : null;
}

/** Next occurrence on or after `from` (and not before the optional start date). */
export function nextOccurrence(
  item: RecurringFields,
  from: Date = new Date(),
): Date | null {
  if (!isRecurring(item)) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let floor = today;
  if (item.date) {
    const start = new Date(`${item.date}T00:00:00`);
    if (!Number.isNaN(start.getTime()) && start > floor) floor = start;
  }
  const weekday = item.weekday!;
  if (item.recurrence === "weekly") {
    const next = new Date(floor);
    next.setDate(next.getDate() + ((weekday - next.getDay() + 7) % 7));
    return next;
  }
  for (let i = 0; i < 14; i++) {
    const candidate = nthWeekday(
      floor.getFullYear(),
      floor.getMonth() + i,
      weekday,
      item.weekOfMonth ?? 1,
    );
    if (candidate && candidate >= floor) return candidate;
  }
  return null;
}

export function formatDay(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(time?: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const d = new Date(2000, 0, 1, h, m || 0);
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

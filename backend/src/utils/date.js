import { z } from "zod";

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Sana YYYY-MM-DD formatida bo'lishi kerak")
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

export function startOfUtcDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfUtcDay(date) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Berilgan sana joylashgan haftaning boshi (dushanba) va oxiri (yakshanba)
export function startOfWeek(date) {
  const d = startOfUtcDay(date);
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return endOfUtcDay(end);
}

export function startOfMonth(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export function endOfMonth(date) {
  const d = new Date(date);
  return endOfUtcDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

export function startOfYear(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

export function endOfYear(date) {
  const d = new Date(date);
  return endOfUtcDay(new Date(Date.UTC(d.getUTCFullYear(), 11, 31)));
}

export function periodRange(period, reference = new Date()) {
  switch (period) {
    case "week":
      return { from: startOfWeek(reference), to: endOfWeek(reference) };
    case "year":
      return { from: startOfYear(reference), to: endOfYear(reference) };
    case "month":
    default:
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
  }
}

export function toDateOnlyString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

import { z } from "zod";
import { env } from "../config/env.js";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

// Sana-faqat (DATE) qiymatlar butun loyihada UTC yarim tunidagi Date sifatida
// saqlanadi: "2026-09-16" -> 2026-09-16T00:00:00.000Z.
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Sana YYYY-MM-DD formatida bo'lishi kerak")
  .transform((value, ctx) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    // JS "2026-02-31" kabi mavjud bo'lmagan sanani jimgina keyingi oyga
    // o'tkazib yuboradi (3-mart) — shuning uchun qaytadan solishtiramiz.
    if (Number.isNaN(date.getTime()) || toDateOnlyString(date) !== value) {
      ctx.addIssue({ code: "custom", message: "Bunday sana mavjud emas" });
      return z.NEVER;
    }
    const year = date.getUTCFullYear();
    if (year < MIN_YEAR || year > MAX_YEAR) {
      ctx.addIssue({ code: "custom", message: `Sana ${MIN_YEAR}–${MAX_YEAR} yillar oralig'ida bo'lishi kerak` });
      return z.NEVER;
    }
    return date;
  });

const calendarFormatters = new Map();

function calendarDateString(timeZone, instant) {
  let formatter = calendarFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    calendarFormatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(instant).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Ilova vaqt mintaqasidagi (APP_TIMEZONE, default Asia/Tashkent) joriy
// kalendar kuni — UTC yarim tunidagi Date sifatida. Server UTC'da ishlasa ham
// Toshkentda soat 00:00–05:00 oralig'ida "bugun" kechagi kun bo'lib qolmaydi.
export function todayInAppTz(instant = new Date()) {
  return new Date(`${calendarDateString(env.appTimezone, instant)}T00:00:00.000Z`);
}

export function addUtcDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

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

export function periodRange(period, reference = todayInAppTz()) {
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

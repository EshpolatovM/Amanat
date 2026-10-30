import { test } from "node:test";
import assert from "node:assert/strict";

// utils/date.js muhit sozlamalarini (config/env.js) import qiladi — testlar
// .env faylisiz ham ishlashi uchun majburiy qiymatlarni oldindan beramiz.
process.env.DATABASE_URL ??= "postgresql://test@localhost:5432/test";
process.env.JWT_ACCESS_SECRET ??= "test-access";
process.env.JWT_REFRESH_SECRET ??= "test-refresh";
process.env.APP_TIMEZONE = "Asia/Tashkent";

const { dateStringSchema, todayInAppTz, periodRange, toDateOnlyString } = await import("../src/utils/date.js");
const { amountSchema } = await import("../src/utils/money.js");
const { normalizePhone } = await import("../src/utils/phone.js");

test("dateStringSchema haqiqiy sanani qabul qiladi", () => {
  assert.equal(toDateOnlyString(dateStringSchema.parse("2026-02-28")), "2026-02-28");
  assert.equal(toDateOnlyString(dateStringSchema.parse("2028-02-29")), "2028-02-29");
});

test("dateStringSchema mavjud bo'lmagan sanani keyingi oyga o'tkazmaydi", () => {
  assert.equal(dateStringSchema.safeParse("2026-02-31").success, false);
  assert.equal(dateStringSchema.safeParse("2026-02-29").success, false);
  assert.equal(dateStringSchema.safeParse("2026-13-01").success, false);
});

test("dateStringSchema format va yil oralig'ini tekshiradi", () => {
  assert.equal(dateStringSchema.safeParse("16.09.2026").success, false);
  assert.equal(dateStringSchema.safeParse("1999-12-31").success, false);
  assert.equal(dateStringSchema.safeParse("2101-01-01").success, false);
});

test("amountSchema summani BigInt'ga aylantiradi", () => {
  assert.equal(amountSchema.parse("500000"), 500000n);
  assert.equal(amountSchema.parse(10000), 10000n);
  assert.equal(amountSchema.parse(" 007 "), 7n);
});

test("amountSchema noto'g'ri summalarni rad etadi", () => {
  for (const value of ["0", "-5", "10.5", "1e6", "", "abc", 0, -1, 1.5, "1000000000001", "9".repeat(30)]) {
    assert.equal(amountSchema.safeParse(value).success, false, `qabul qilinmasligi kerak: ${value}`);
  }
  assert.equal(amountSchema.parse("1000000000000"), 1_000_000_000_000n);
});

test("normalizePhone O'zbekiston raqamlarini bitta ko'rinishga keltiradi", () => {
  assert.equal(normalizePhone("901234567"), "+998901234567");
  assert.equal(normalizePhone("8901234567"), "+998901234567");
  assert.equal(normalizePhone("+998 (90) 123-45-67"), "+998901234567");
  assert.equal(normalizePhone("998901234567"), "+998901234567");
});

test("todayInAppTz Toshkent kalendar kunini qaytaradi (UTC+5)", () => {
  // 30-sentabr 20:30 UTC = Toshkentda 1-oktabr 01:30
  assert.equal(toDateOnlyString(todayInAppTz(new Date("2026-09-30T20:30:00Z"))), "2026-10-01");
  assert.equal(toDateOnlyString(todayInAppTz(new Date("2026-09-30T18:59:00Z"))), "2026-09-30");
});

test("periodRange hafta dushanbadan boshlanadi", () => {
  const sunday = new Date("2026-09-27T00:00:00Z");
  const { from, to } = periodRange("week", sunday);
  assert.equal(toDateOnlyString(from), "2026-09-21");
  assert.equal(toDateOnlyString(to), "2026-09-27");
});

test("periodRange oy va yil chegaralari", () => {
  const ref = new Date("2026-02-14T00:00:00Z");
  assert.equal(toDateOnlyString(periodRange("month", ref).to), "2026-02-28");
  assert.equal(toDateOnlyString(periodRange("year", ref).from), "2026-01-01");
  assert.equal(toDateOnlyString(periodRange("year", ref).to), "2026-12-31");
});

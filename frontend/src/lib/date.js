const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

const UZ_MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

const pad = (value) => String(value).padStart(2, '0')

// Backend sanalarni UTC yarim tuni sifatida qaytaradi ("2026-09-16T00:00:00.000Z"),
// forma esa "2026-09-16" beradi — ikkalasida ham kalendar kunini UTC getter'lar
// bilan o'qiymiz, aks holda manfiy UTC mintaqalarida bir kun oldingi sana chiqardi.
function toUtcDate(value) {
  if (value instanceof Date) return value
  const text = String(value)
  return new Date(text.length === 10 ? `${text}T00:00:00.000Z` : text)
}

export function toIsoDate(value) {
  return toUtcDate(value).toISOString().slice(0, 10)
}

// Foydalanuvchi qurilmasidagi BUGUNGI kun (YYYY-MM-DD). `toISOString()` UTC
// kunini beradi — Toshkentda soat 00:00–05:00 oralig'ida kechagi sana chiqardi.
export function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// "Sentabr 2026"
export function formatMonthLabel(value) {
  const date = toUtcDate(value)
  return `${UZ_MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

// "16-sentabr" (joriy yil bo'lmasa — "16-sentabr, 2025")
export function formatDayLabel(value, { withYear } = {}) {
  const date = toUtcDate(value)
  const label = `${date.getUTCDate()}-${UZ_MONTHS[date.getUTCMonth()].toLowerCase()}`
  const showYear = withYear ?? date.getUTCFullYear() !== new Date().getFullYear()
  return showYear ? `${label}, ${date.getUTCFullYear()}` : label
}

// "16 Sen" — diagramma o'qlari kabi tor joylar uchun
export function formatShortDay(value) {
  const date = toUtcDate(value)
  return `${date.getUTCDate()} ${UZ_MONTHS_SHORT[date.getUTCMonth()]}`
}

export function formatShortMonth(monthIndex) {
  return UZ_MONTHS_SHORT[monthIndex]
}

// "2026-09" — oylar bo'yicha guruhlash kaliti
export function monthKey(value) {
  return toIsoDate(value).slice(0, 7)
}

function addDaysIso(iso, days) {
  const date = toUtcDate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toIsoDate(date)
}

// Davr boshini (hafta — dushanba, oy — 1-kun, yil — 1-yanvar) qaytaradi.
export function periodStartIso(period, anchorIso) {
  const date = toUtcDate(anchorIso)
  if (period === 'week') {
    const weekday = date.getUTCDay()
    return addDaysIso(anchorIso, weekday === 0 ? -6 : 1 - weekday)
  }
  if (period === 'year') return `${date.getUTCFullYear()}-01-01`
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-01`
}

// Statistikada oldingi/keyingi davrga o'tish uchun: `delta` = -1 / +1.
export function shiftPeriodStartIso(period, startIso, delta) {
  if (period === 'week') return addDaysIso(startIso, 7 * delta)
  const date = toUtcDate(startIso)
  if (period === 'year') return `${date.getUTCFullYear() + delta}-01-01`
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1))
  return toIsoDate(shifted)
}

// "Sentabr 2026" / "2026-yil" / "21–27-sentabr"
export function formatPeriodLabel(period, fromValue, toValue) {
  const from = toUtcDate(fromValue)
  if (period === 'year') return `${from.getUTCFullYear()}-yil`
  if (period === 'month') return formatMonthLabel(from)

  const to = toUtcDate(toValue)
  const sameMonth = from.getUTCMonth() === to.getUTCMonth()
  const fromLabel = sameMonth ? String(from.getUTCDate()) : formatDayLabel(from, { withYear: false })
  return `${fromLabel} – ${formatDayLabel(to, { withYear: false })}`
}

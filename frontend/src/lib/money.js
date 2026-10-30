// Pul summalari backend'dan doim raqamli STRING sifatida keladi (BigInt -> string
// serializatsiya). Number()ga aylantirmaymiz — katta summalarda aniqlik yo'qolishi
// mumkin, shuning uchun minglik ajratish ham string ustida, regex bilan qilinadi.
//
// Ajratuvchi — bo'linmas bo'sh joy (U+00A0): "1 500 000 so'm" qator oxirida
// raqam o'rtasidan bo'linib ketmasligi uchun.
const NBSP = ' '

export function groupDigits(digits) {
  return String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export function formatMoney(amount, { suffix = "so'm" } = {}) {
  const value = amount === null || amount === undefined || amount === '' ? '0' : String(amount)
  const isNegative = value.startsWith('-')
  const digits = isNegative ? value.slice(1) : value
  const grouped = groupDigits(digits)

  return `${isNegative ? '-' : ''}${grouped}${suffix ? `${NBSP}${suffix}` : ''}`
}

// Diagramma ustunlari kabi tor joylarda to'liq "150 000 so'm" sig'may qolishi
// mumkin — shu yerlarda ixcham "150 ming" / "1,5 mln" formati ishlatiladi.
export function formatMoneyCompact(amount, { suffix = "so'm" } = {}) {
  const value = Number(amount ?? 0)
  if (!Number.isFinite(value)) return `0${suffix ? `${NBSP}${suffix}` : ''}`

  const abs = Math.abs(value)
  const withSuffix = (text) => (suffix ? `${text}${NBSP}${suffix}` : text)
  const trim = (num) => (Number.isInteger(num) ? String(num) : num.toFixed(1).replace('.', ','))

  if (abs >= 1_000_000_000) return withSuffix(`${trim(Math.round(value / 100_000_000) / 10)}${NBSP}mlrd`)
  if (abs >= 1_000_000) return withSuffix(`${trim(Math.round(value / 100_000) / 10)}${NBSP}mln`)
  if (abs >= 1_000) return withSuffix(`${trim(Math.round(value / 100) / 10)}${NBSP}ming`)
  return withSuffix(String(value))
}

// Summa kiritish maydoni uchun: faqat raqamlar, boshidagi nollarsiz,
// 13 xonagacha (backend chegarasi — 1 trillion so'm).
export function sanitizeMoneyInput(raw) {
  return String(raw ?? '')
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, 13)
}

// Ulushni foizda: BigInt-string'lar bilan xavfsiz (0 ga bo'lishdan himoyalangan)
export function sharePercent(part, total) {
  const whole = Number(total)
  if (!whole) return 0
  return Math.round((Number(part) / whole) * 100)
}

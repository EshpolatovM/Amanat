// Pul summalari backend'dan doim raqamli STRING sifatida keladi (BigInt -> string
// serializatsiya). Number()ga aylantirmaymiz — katta summalarda aniqlik yo'qolishi
// mumkin, shuning uchun minglik ajratish ham string ustida, regex bilan qilinadi.
export function formatMoney(amount, { suffix = "so'm" } = {}) {
  if (amount === null || amount === undefined) {
    return `0 ${suffix}`
  }

  const value = String(amount)
  const isNegative = value.startsWith('-')
  const digits = isNegative ? value.slice(1) : value
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return `${isNegative ? '-' : ''}${grouped} ${suffix}`
}

// Diagramma ustunlari kabi tor joylarda to'liq "150 000 so'm" sig'may qolishi
// mumkin — shu yerlarda ixcham "150K so'm" formati ishlatiladi.
export function formatMoneyCompact(amount, { suffix = "so'm" } = {}) {
  const value = Number(amount ?? 0)
  if (!Number.isFinite(value)) return `0 ${suffix}`

  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const millions = value / 1_000_000
    return `${abs % 1_000_000 === 0 ? millions : millions.toFixed(1)}M ${suffix}`
  }
  if (abs >= 1_000) {
    const thousands = value / 1_000
    return `${abs % 1_000 === 0 ? thousands : thousands.toFixed(1)}K ${suffix}`
  }
  return `${value} ${suffix}`
}

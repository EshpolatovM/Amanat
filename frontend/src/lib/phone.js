// "+998901234567" -> "+998 90 123 45 67" (o'qish oson bo'lishi uchun).
// Boshqa ko'rinishdagi qiymatlar o'zgarishsiz qaytariladi.
export function formatPhone(phone) {
  const match = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(String(phone ?? ''))
  if (!match) return phone ?? ''
  return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`
}

// Bola Kirish ID'si: "123456789" -> "123 456 789"
export function formatLoginId(loginId) {
  return String(loginId ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

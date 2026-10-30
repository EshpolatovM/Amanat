// Barcha kiritish maydonlari uchun umumiy ko'rinish: katta (h-14), qalin border,
// fokusda forest halqa; xatoda alert rangi. amanat-design-system.md §1, §6.
export function inputClassName({ error, className = '' } = {}) {
  return [
    'h-14 w-full rounded-2xl border-2 px-4 text-lg text-ink outline-none transition-colors placeholder:text-ink-soft/70',
    error
      ? 'border-alert bg-alert-soft focus:border-alert-dark focus:ring-4 focus:ring-alert/15'
      : 'border-line bg-card focus:border-forest focus:ring-4 focus:ring-forest/15',
    className,
  ].join(' ')
}

// Input'ni xato/izoh matni bilan bog'lash (aria-describedby) — FieldShell bilan bir xil id'lar.
export function describedBy(id, { hint, error }) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

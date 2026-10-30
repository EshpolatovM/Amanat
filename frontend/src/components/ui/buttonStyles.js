// amanat-design-system.md §3 — jismoniy (tactile) tugma: pastki soya-border,
// hover'da 1px pastga tushadi, bosilganda ichiga kiradi. Faqat rang o'zgaradi.
const TACTILE_BASE = 'border-b-2 shadow-md'
const TACTILE_INTERACTIVE = 'hover:translate-y-px hover:border-b active:translate-y-0.5 active:border-b-0 active:shadow-none'

export const BUTTON_VARIANTS = {
  primary: { base: `${TACTILE_BASE} border-forest-dark bg-forest text-white`, interactive: TACTILE_INTERACTIVE },
  // Oq matn bronze'da 3.1:1 (WCAG AA'dan past) — shuning uchun bronze-dark fon
  bronze: { base: `${TACTILE_BASE} border-bronze-ink bg-bronze-dark text-white`, interactive: TACTILE_INTERACTIVE },
  danger: { base: `${TACTILE_BASE} border-alert-dark bg-alert text-white`, interactive: TACTILE_INTERACTIVE },
  secondary: { base: 'border-2 border-line bg-card text-ink', interactive: 'hover:bg-paper active:translate-y-px' },
  dangerOutline: {
    base: 'border-2 border-alert/40 bg-card text-alert',
    interactive: 'hover:border-alert hover:bg-alert-soft active:translate-y-px',
  },
  ghost: { base: 'text-forest', interactive: 'hover:bg-forest-soft active:translate-y-px' },
}

export const BUTTON_SIZES = {
  lg: 'h-14 rounded-2xl px-6 text-lg',
  md: 'h-12 rounded-2xl px-5 text-base',
  sm: 'h-11 rounded-xl px-3 text-sm',
}

// Havolani (<Link>) tugma ko'rinishida chiqarish uchun
export function buttonClassName({ variant = 'primary', size = 'lg', fullWidth = false, className = '' } = {}) {
  const style = BUTTON_VARIANTS[variant]
  return [
    'inline-flex shrink-0 items-center justify-center gap-2 font-bold transition-all duration-100 ease-in-out select-none',
    style.base,
    style.interactive,
    BUTTON_SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')
}

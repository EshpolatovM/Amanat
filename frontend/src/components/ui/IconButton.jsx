const TONES = {
  neutral: 'text-ink-soft hover:bg-paper hover:text-ink',
  danger: 'text-ink-soft hover:bg-alert-soft hover:text-alert',
}

// Ikonka tugmalari uchun kamida 44×44px bosish maydoni (keksalar va
// telefonda barmoq bilan bosish uchun — 20px'lik ikonka o'zi yetarli emas).
export default function IconButton({ label, icon: Icon, tone = 'neutral', className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-50 ${TONES[tone]} ${className}`}
      {...props}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}

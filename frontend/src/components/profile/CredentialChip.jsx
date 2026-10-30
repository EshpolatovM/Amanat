import { Copy } from 'lucide-react'
import { toast } from '../../store/toastStore'

// ID/parol kabi raqam-matnlar uchun: monospace, keng harf oralig'i — aniq
// o'qilishi va boshqa matndan ko'zga tashlanib turishi uchun.
const TONE_CLASSES = {
  neutral: 'border-line bg-paper text-ink',
  forest: 'border-forest bg-card text-forest-dark',
  bronze: 'border-bronze bg-card text-bronze-ink',
}

async function copyToClipboard(value, label) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} nusxalandi`)
  } catch {
    toast.error("Nusxalab bo'lmadi — qo'lda yozib oling")
  }
}

// `display` — ko'rsatish uchun formatlangan qiymat (masalan "123 456 789"),
// nusxalashda esa asl `value` olinadi.
export default function CredentialChip({ label, value, display, tone = 'neutral', copyable = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 ${TONE_CLASSES[tone]}`}>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink-soft">{label}</p>
        <p className="mt-0.5 font-mono text-xl font-bold tracking-widest break-all">{display ?? value}</p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={() => copyToClipboard(value, label)}
          aria-label={`${label}ni nusxalash`}
          title="Nusxalash"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-line bg-card text-ink-soft transition-colors hover:bg-paper hover:text-ink"
        >
          <Copy className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

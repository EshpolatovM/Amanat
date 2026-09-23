// ID/parol kabi raqam-matnlar uchun: monospace, keng harf oralig'i — aniq
// o'qilishi va boshqa matndan ko'zga tashlanib turishi uchun.
const TONE_CLASSES = {
  neutral: 'border-line bg-paper text-ink',
  forest: 'border-forest bg-card text-forest-dark',
  bronze: 'border-bronze bg-card text-bronze-dark',
}

export default function CredentialChip({ label, value, tone = 'neutral' }) {
  return (
    <div className={`rounded-xl border-2 px-4 py-3 ${TONE_CLASSES[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tracking-widest">{value}</p>
    </div>
  )
}

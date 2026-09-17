// ID/parol kabi raqam-matnlar uchun: monospace, keng harf oralig'i — aniq
// o'qilishi va boshqa matndan ko'zga tashlanib turishi uchun.
const TONE_CLASSES = {
  slate: 'border-slate-300 bg-slate-50 text-slate-900',
  green: 'border-green-500 bg-white text-green-800',
  blue: 'border-blue-400 bg-white text-blue-700',
}

export default function CredentialChip({ label, value, tone = 'slate' }) {
  return (
    <div className={`rounded-xl border-2 px-4 py-3 ${TONE_CLASSES[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tracking-widest">{value}</p>
    </div>
  )
}

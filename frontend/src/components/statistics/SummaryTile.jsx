import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

// `type` berilsa (masalan "Eng katta xarajat" kartasi uchun), karta o'sha
// xarajat turining status rangiga (forest/bronze/alert) o'tadi — ilovadagi
// boshqa status-kartalar bilan bir xil naqsh. Berilmasa (Bugun/Bu hafta/Bu oy
// kabi umumiy jamlar — bitta turga tegishli emas), neytral rangda qoladi.
// `compact` — telefonda bir qatorda (nom ↔ qiymat), kattaroq ekranda ustun ko'rinishida.
export default function SummaryTile({ label, value, sub, type, loading = false, compact = false }) {
  const style = type ? EXPENSE_TYPE_STYLES[type] : null
  const box = style ? `${style.border} ${style.bg}` : 'border-line bg-card'
  const layout = compact ? 'flex items-center justify-between gap-3 px-4 py-3 sm:block sm:p-4' : 'p-4'

  return (
    <div className={`min-w-0 rounded-2xl border-2 ${box} ${layout}`}>
      <p className={`text-sm font-bold ${style ? style.text : 'text-ink-soft'}`}>{label}</p>
      <p className={`text-xl font-bold text-ink sm:text-2xl ${compact ? 'sm:mt-1' : 'mt-1'}`}>{loading ? '—' : value}</p>
      {sub && <p className="mt-1 truncate text-sm font-semibold text-ink-soft">{sub}</p>}
    </div>
  )
}

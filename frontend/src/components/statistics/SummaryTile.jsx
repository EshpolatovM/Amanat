import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

// `type` berilsa (masalan "Eng katta xarajat" kartasi uchun), karta o'sha
// xarajat turining status rangiga (forest/bronze/alert) o'tadi — ilovadagi
// boshqa status-kartalar bilan bir xil naqsh. Berilmasa (Bugun/Bu hafta/Bu oy
// kabi umumiy jamlar — bitta turga tegishli emas), neytral rangda qoladi.
export default function SummaryTile({ label, value, sub, type }) {
  const style = type ? EXPENSE_TYPE_STYLES[type] : null

  return (
    <div
      className={
        style
          ? `rounded-2xl border-2 ${style.border} ${style.bg} p-4`
          : 'rounded-2xl border-2 border-line bg-card p-4'
      }
    >
      <p className={`text-sm font-bold ${style ? style.text : 'text-ink-soft'}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-1 text-sm font-semibold text-ink-soft">{sub}</p>}
    </div>
  )
}

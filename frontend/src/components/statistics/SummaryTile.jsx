import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

// `type` berilsa (masalan "Eng katta xarajat" kartasi uchun), karta o'sha
// xarajat turining status rangiga (yashil/sariq/qizil) o'tadi — ilovadagi
// boshqa status-kartalar bilan bir xil naqsh. Berilmasa (Bugun/Bu hafta/Bu oy
// kabi umumiy jamlar — bitta turga tegishli emas), neytral kulrang qoladi.
export default function SummaryTile({ label, value, sub, type }) {
  const style = type ? EXPENSE_TYPE_STYLES[type] : null

  return (
    <div
      className={
        style
          ? `rounded-2xl border-2 ${style.border} ${style.bg} p-4`
          : 'rounded-2xl border-2 border-slate-300 bg-white p-4'
      }
    >
      <p className={`text-sm font-bold ${style ? style.text : 'text-slate-700'}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-sm font-semibold text-slate-700">{sub}</p>}
    </div>
  )
}

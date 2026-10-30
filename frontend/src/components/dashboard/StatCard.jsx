import { formatMoney } from '../../lib/money'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

// amanat-design-system.md §4 — holat kartasi (qalin rangli border + och fon).
// Telefonda bir qatorda (nom ↔ summa), kattaroq ekranda ustun ko'rinishida.
export default function StatCard({ type, amount }) {
  const style = EXPENSE_TYPE_STYLES[type]

  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl border-2 ${style.border} ${style.bg} px-4 py-3 sm:flex-col sm:items-start sm:justify-start sm:p-4 xl:flex-row xl:items-center xl:justify-between`}>
      <p className={`text-base font-bold ${style.text}`}>{style.label}</p>
      <p className="text-xl font-bold text-ink sm:text-2xl">{formatMoney(amount)}</p>
    </div>
  )
}

import { formatMoney } from '../../lib/money'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

export default function StatCard({ type, amount, variant = 'parent' }) {
  const style = EXPENSE_TYPE_STYLES[type]
  const isChild = variant === 'child'

  return (
    <div
      className={
        isChild
          ? `rounded-[1.75rem] border-4 ${style.border} ${style.bg} p-4`
          : `rounded-2xl border-2 ${style.border} ${style.bg} p-4`
      }
    >
      <p className={`text-base font-bold ${style.text}`}>{style.label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{formatMoney(amount)}</p>
    </div>
  )
}

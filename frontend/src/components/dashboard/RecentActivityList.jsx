import { formatMoney } from '../../lib/money'
import { formatDayLabel } from '../../lib/date'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

// So'nggi yozuvlar — nima uchun (maqsad/sabab), qachon, qancha. Avtomatik
// qo'shilganlari alohida belgilanadi. amanat-design-system.md §4 (ledger istisnosi).
export default function RecentActivityList({ items, childNameById, showChildName = false, emptyState, size = 'md' }) {
  if (!items?.length) return emptyState ?? null
  const large = size === 'lg'

  return (
    <ul className="flex flex-col divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
      {items.map((item) => {
        const style = EXPENSE_TYPE_STYLES[item.type]
        const childName = showChildName ? childNameById?.[item.childId] : null
        const meta = [formatDayLabel(item.date), childName, item.source === 'auto' ? 'avtomatik' : null]
          .filter(Boolean)
          .join(' · ')

        return (
          <li key={`${item.type}-${item.id}`} className={`border-l-4 ${style.border} bg-paper px-4 py-3`}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`min-w-0 truncate font-bold ${style.text} ${large ? 'text-lg' : 'text-base'}`}>{item.label}</span>
              <span className={`shrink-0 font-bold text-ink ${large ? 'text-xl' : 'text-lg'}`}>{formatMoney(item.amount)}</span>
            </div>
            <p className="truncate text-sm font-semibold text-ink-soft">
              {meta}
              {item.comment ? ` · ${item.comment}` : ''}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

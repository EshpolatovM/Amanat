import { formatMoney } from '../../lib/money'
import { formatDayLabel } from '../../lib/date'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

export default function RecentActivityList({ items, childNameById, showChildName = false }) {
  if (!items?.length) {
    return <p className="text-base font-semibold text-ink-soft">Bu oy hali xarajat kiritilmagan.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border-2 border-line">
      {items.map((item) => {
        const style = EXPENSE_TYPE_STYLES[item.type]
        const childName = showChildName ? childNameById?.[item.childId] : null

        return (
          <div
            key={item.id}
            className={`flex items-center justify-between border-l-4 ${style.border} bg-paper px-4 py-3`}
          >
            <div>
              <p className={`text-base font-bold ${style.text}`}>
                {style.label}
                {childName ? ` — ${childName}` : ''}
              </p>
              <p className="text-sm font-semibold text-ink-soft">{formatDayLabel(item.date)}</p>
            </div>
            <p className="text-lg font-bold text-ink">{formatMoney(item.amount)}</p>
          </div>
        )
      })}
    </div>
  )
}

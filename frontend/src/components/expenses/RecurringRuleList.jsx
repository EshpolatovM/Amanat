import { ChevronRight } from 'lucide-react'
import { formatMoney } from '../../lib/money'
import { todayIso } from '../../lib/date'
import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'
import { describeSchedule, ruleStatus } from './recurringSchedule'

const STATUS_BADGE = {
  active: 'border-forest/30 bg-forest-soft text-forest',
  paused: 'border-line bg-card text-ink-soft',
  ended: 'border-line bg-card text-ink-soft',
}

export default function RecurringRuleList({ query, onSelect, emptyAction, readOnlyEmptyMessage }) {
  if (query.isPending) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />

  const rules = query.data ?? []
  if (rules.length === 0) {
    return (
      <EmptyState action={emptyAction}>
        {readOnlyEmptyMessage ??
          "Avtomatik xarajat qoidasi yo'q. Masalan \"dushanbadan jumagacha har kuni 10 000 so'm\" deb bir marta sozlasangiz, tizim o'zi hisoblab boradi."}
      </EmptyState>
    )
  }

  const today = todayIso()
  // Faol qoidalar tepada, to'xtatilgan/tugaganlari pastda
  const sorted = [...rules].sort((a, b) => Number(ruleStatus(a, today).key !== 'active') - Number(ruleStatus(b, today).key !== 'active'))

  return (
    <ul className="flex flex-col divide-y-2 divide-line overflow-hidden rounded-2xl border-2 border-line">
      {sorted.map((rule) => {
        // Maqsadga bog'langan qoida "Maqsadli xarajat" (forest), maqsadsizi
        // klassik "Kundalik xarajat" (bronze) sifatida ko'rsatiladi.
        const style = rule.goal ? EXPENSE_TYPE_STYLES.planned : EXPENSE_TYPE_STYLES.recurring
        const status = ruleStatus(rule, today)
        const content = (
          <>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className={`truncate text-base font-bold ${style.text}`}>
                  {rule.goal ? rule.goal.name : 'Kundalik xarajat'}
                </span>
                <span className="shrink-0 text-lg font-bold text-ink">{formatMoney(rule.amount)}</span>
              </div>
              <p className="text-sm font-semibold text-ink-soft">{describeSchedule(rule)}</p>
              <span
                className={`mt-1.5 inline-block rounded-lg border-2 px-2 py-0.5 text-xs font-bold ${STATUS_BADGE[status.key]}`}
              >
                {status.label}
              </span>
            </div>
            {onSelect && <ChevronRight className="h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />}
          </>
        )

        return (
          <li key={rule.id} className={`border-l-4 ${style.border} ${status.key === 'active' ? 'bg-paper' : 'bg-card'}`}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(rule)}
                className="flex w-full items-center gap-2 py-3 pl-4 pr-3 text-left transition-colors hover:bg-card"
              >
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-2 py-3 pl-4 pr-3">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

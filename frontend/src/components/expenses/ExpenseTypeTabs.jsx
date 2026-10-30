import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

const TYPES = ['planned', 'recurring', 'unplanned']

export default function ExpenseTypeTabs({ value, onChange, label = 'Xarajat turi' }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      {TYPES.map((type) => {
        const style = EXPENSE_TYPE_STYLES[type]
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={active}
            className={
              active
                ? `flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 ${style.border} ${style.bg} px-2 py-2 text-sm font-bold ${style.text} transition-colors`
                : 'flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-line bg-card px-2 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-paper'
            }
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
            {style.shortLabel}
          </button>
        )
      })}
    </div>
  )
}

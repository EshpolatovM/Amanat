import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

const TYPES = ['planned', 'recurring', 'unplanned']

export default function ExpenseTypeTabs({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {TYPES.map((type) => {
        const style = EXPENSE_TYPE_STYLES[type]
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={
              active
                ? `flex-1 rounded-2xl border-2 ${style.border} ${style.bg} px-3 py-3 text-sm font-bold ${style.text}`
                : 'flex-1 rounded-2xl border-2 border-slate-300 px-3 py-3 text-sm font-bold text-slate-700'
            }
          >
            {style.label}
          </button>
        )
      })}
    </div>
  )
}

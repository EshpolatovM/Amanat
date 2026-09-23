import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { fetchChildren } from '../../api/children'
import { fetchPlannedExpenses, plannedExpensesKeys } from '../../api/plannedExpenses'
import { fetchRecurringRules, recurringRulesKeys } from '../../api/recurringRules'
import { fetchUnplannedExpenses, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import ExpenseTypeTabs from '../../components/expenses/ExpenseTypeTabs'
import PlannedExpenseForm from '../../components/expenses/PlannedExpenseForm'
import RecurringRuleForm from '../../components/expenses/RecurringRuleForm'
import UnplannedExpenseForm from '../../components/expenses/UnplannedExpenseForm'
import PlannedExpenseList from '../../components/expenses/PlannedExpenseList'
import RecurringRuleList from '../../components/expenses/RecurringRuleList'
import UnplannedExpenseList from '../../components/expenses/UnplannedExpenseList'
import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'

const FORM_BY_TYPE = { planned: PlannedExpenseForm, recurring: RecurringRuleForm, unplanned: UnplannedExpenseForm }

const COLUMNS = [
  { type: 'planned', List: PlannedExpenseList },
  { type: 'recurring', List: RecurringRuleList },
  { type: 'unplanned', List: UnplannedExpenseList },
]

export default function Expenses() {
  const [childId, setChildId] = useState(null)
  // Mobil/planshetda (<lg) faqat bitta turni ko'rsatish uchun tab holati.
  // Desktopda (lg+) uchala ustun bir vaqtda ko'rinadi, bu holat e'tiborga olinmaydi.
  const [viewType, setViewType] = useState('planned')
  const [addType, setAddType] = useState('planned')
  const [isAdding, setIsAdding] = useState(false)

  const { data: children } = useQuery({ queryKey: ['children'], queryFn: fetchChildren })
  const effectiveChildId = childId ?? children?.[0]?.id ?? null

  const { data: plannedExpenses } = useQuery({
    queryKey: plannedExpensesKeys.list(effectiveChildId),
    queryFn: () => fetchPlannedExpenses(effectiveChildId),
    enabled: !!effectiveChildId,
  })
  const { data: recurringRules } = useQuery({
    queryKey: recurringRulesKeys.list(effectiveChildId),
    queryFn: () => fetchRecurringRules(effectiveChildId),
    enabled: !!effectiveChildId,
  })
  const { data: unplannedExpenses } = useQuery({
    queryKey: unplannedExpensesKeys.list(effectiveChildId),
    queryFn: () => fetchUnplannedExpenses(effectiveChildId),
    enabled: !!effectiveChildId,
  })

  const itemsByType = { planned: plannedExpenses, recurring: recurringRules, unplanned: unplannedExpenses }

  if (children && children.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-serif font-semibold text-ink">Xarajatlar</h1>
        <p className="mt-3 text-base font-semibold text-ink-soft">
          Hali farzand profili qo'shilmagan.{' '}
          <Link to="/profile" className="text-forest underline transition-colors hover:text-forest">
            Profilga o'tib qo'shing
          </Link>
          .
        </p>
      </div>
    )
  }

  const AddForm = FORM_BY_TYPE[addType]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-semibold text-ink">Xarajatlar</h1>
        <button
          type="button"
          onClick={() => setIsAdding((prev) => !prev)}
          className="
            flex h-12 items-center gap-2 rounded-2xl border-b-2 border-forest-dark bg-forest px-4
            text-base font-bold text-white shadow-lg transition-all duration-100 ease-in-out
            hover:translate-y-px hover:border-b-px
            active:translate-y-0.5 active:border-b-0 active:shadow-none
          "
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          {isAdding ? 'Yopish' : "Qo'shish"}
        </button>
      </div>

      {children?.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setChildId(child.id)}
              className={
                effectiveChildId === child.id
                  ? 'rounded-full bg-forest px-4 py-2 text-base font-bold text-white transition-colors hover:bg-forest-dark'
                  : 'rounded-full border-2 border-line px-4 py-2 text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
              }
            >
              {child.firstName}
            </button>
          ))}
        </div>
      )}

      {isAdding && effectiveChildId && (
        <div className="rounded-2xl border-2 border-line bg-paper p-4">
          <ExpenseTypeTabs value={addType} onChange={setAddType} />
          <div className="mt-4">
            <AddForm childId={effectiveChildId} onSuccess={() => setIsAdding(false)} />
          </div>
        </div>
      )}

      {/* Mobil/planshet (<lg): faqat tanlangan tur, tab orqali almashtiriladi */}
      <div className="flex flex-col gap-4 lg:hidden">
        <ExpenseTypeTabs value={viewType} onChange={setViewType} />
        {COLUMNS.filter((column) => column.type === viewType).map(({ type, List }) => (
          <List key={type} items={itemsByType[type]} childId={effectiveChildId} />
        ))}
      </div>

      {/* Desktop (lg+): uchala tur bir vaqtning o'zida, vertikal tartibda */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        {COLUMNS.map(({ type, List }) => {
          const style = EXPENSE_TYPE_STYLES[type]
          return (
            <div key={type} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${style.dot}`} />
                <h2 className={`text-lg font-bold ${style.text}`}>{style.label}</h2>
              </div>
              <List items={itemsByType[type]} childId={effectiveChildId} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

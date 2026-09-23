import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { fetchPlannedExpenses, plannedExpensesKeys } from '../../api/plannedExpenses'
import { fetchRecurringRules, recurringRulesKeys } from '../../api/recurringRules'
import { fetchUnplannedExpenses, unplannedExpensesKeys } from '../../api/unplannedExpenses'
import ExpenseTypeTabs from '../../components/expenses/ExpenseTypeTabs'
import PlannedExpenseList from '../../components/expenses/PlannedExpenseList'
import RecurringRuleList from '../../components/expenses/RecurringRuleList'
import UnplannedExpenseList from '../../components/expenses/UnplannedExpenseList'
import { EXPENSE_TYPE_STYLES } from '../../components/dashboard/expenseTypeStyles'

const COLUMNS = [
  { type: 'planned', List: PlannedExpenseList },
  { type: 'recurring', List: RecurringRuleList },
  { type: 'unplanned', List: UnplannedExpenseList },
]

export default function ChildExpenses() {
  const childId = useAuthStore((state) => state.user?.id)
  // Mobil/planshetda (<lg) faqat bitta turni ko'rsatish uchun tab holati.
  // Desktopda (lg+) uchala turi bir vaqtda ko'rinadi, bu holat e'tiborga olinmaydi.
  const [viewType, setViewType] = useState('planned')

  const { data: plannedExpenses } = useQuery({
    queryKey: plannedExpensesKeys.list(childId),
    queryFn: () => fetchPlannedExpenses(childId),
    enabled: !!childId,
  })
  const { data: recurringRules } = useQuery({
    queryKey: recurringRulesKeys.list(childId),
    queryFn: () => fetchRecurringRules(childId),
    enabled: !!childId,
  })
  const { data: unplannedExpenses } = useQuery({
    queryKey: unplannedExpensesKeys.list(childId),
    queryFn: () => fetchUnplannedExpenses(childId),
    enabled: !!childId,
  })

  const itemsByType = { planned: plannedExpenses, recurring: recurringRules, unplanned: unplannedExpenses }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-serif font-semibold text-ink">Xarajatlarim</h1>

      {/* Mobil/planshet (<lg): faqat tanlangan tur, tab orqali almashtiriladi */}
      <div className="flex flex-col gap-4 lg:hidden">
        <ExpenseTypeTabs value={viewType} onChange={setViewType} />
        {COLUMNS.filter((column) => column.type === viewType).map(({ type, List }) => (
          <List key={type} items={itemsByType[type]} childId={childId} readOnly />
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
              <List items={itemsByType[type]} childId={childId} readOnly />
            </div>
          )
        })}
      </div>
    </div>
  )
}

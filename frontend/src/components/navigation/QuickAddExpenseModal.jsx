import { useState } from 'react'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchChildren } from '../../api/children'
import ExpenseTypeTabs from '../expenses/ExpenseTypeTabs'
import PlannedExpenseForm from '../expenses/PlannedExpenseForm'
import RecurringRuleForm from '../expenses/RecurringRuleForm'
import UnplannedExpenseForm from '../expenses/UnplannedExpenseForm'

export default function QuickAddExpenseModal({ open, onClose }) {
  const { data: children } = useQuery({ queryKey: ['children'], queryFn: fetchChildren, enabled: open })
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [type, setType] = useState('planned')
  const childId = selectedChildId ?? children?.[0]?.id ?? null

  if (!open) return null

  const hasChildren = (children?.length ?? 0) > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-2 border-b-0 border-slate-300 bg-white p-6 sm:rounded-3xl sm:border-b-2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Xarajat qo'shish</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 text-slate-700 transition-all duration-100 active:translate-y-0.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!hasChildren ? (
          <p className="py-8 text-center text-base font-semibold text-slate-700">
            Avval Profil bo'limidan bola profili qo'shing.
          </p>
        ) : (
          <div className="flex flex-col gap-4 pt-4">
            {children.length > 1 && (
              <label className="flex flex-col gap-1.5">
                <span className="text-base font-semibold text-slate-900">Bola</span>
                <select
                  value={childId ?? ''}
                  onChange={(event) => setSelectedChildId(event.target.value)}
                  className="h-14 rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none focus:border-green-600"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <ExpenseTypeTabs value={type} onChange={setType} />

            {type === 'planned' && <PlannedExpenseForm childId={childId} onSuccess={onClose} />}
            {type === 'recurring' && <RecurringRuleForm childId={childId} onSuccess={onClose} />}
            {type === 'unplanned' && <UnplannedExpenseForm childId={childId} onSuccess={onClose} />}
          </div>
        )}
      </div>
    </div>
  )
}

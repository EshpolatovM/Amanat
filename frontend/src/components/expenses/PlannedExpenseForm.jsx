import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGoals, createGoal, goalsKeys } from '../../api/goals'
import { createPlannedExpense, plannedExpensesKeys } from '../../api/plannedExpenses'
import { dashboardKeys } from '../../api/dashboard'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../forms/TextField'

const NEW_GOAL = '__new__'

const schema = z
  .object({
    goalId: z.string().min(1, "Maqsad tanlanishi shart"),
    newGoalName: z.string().trim().optional(),
    amount: z.coerce.number().int().positive("Summa 0 dan katta bo'lishi kerak"),
    date: z.string().min(1, 'Sana kiritilishi shart'),
    comment: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.goalId !== NEW_GOAL || (data.newGoalName?.length ?? 0) > 0, {
    message: 'Yangi maqsad nomini kiriting',
    path: ['newGoalName'],
  })

const todayIso = () => new Date().toISOString().slice(0, 10)

export default function PlannedExpenseForm({ childId, onSuccess }) {
  const queryClient = useQueryClient()
  const { data: goals } = useQuery({
    queryKey: goalsKeys.list(childId),
    queryFn: () => fetchGoals(childId),
    enabled: !!childId,
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { goalId: '', newGoalName: '', amount: '', date: todayIso(), comment: '' },
  })

  const selectedGoalId = watch('goalId')

  const mutation = useMutation({
    mutationFn: async (values) => {
      let goalId = values.goalId
      if (goalId === NEW_GOAL) {
        const goal = await createGoal(childId, values.newGoalName.trim())
        goalId = goal.id
      }
      return createPlannedExpense(childId, {
        goalId,
        amount: values.amount,
        date: values.date,
        comment: values.comment || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: plannedExpensesKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(undefined) })
      reset({ goalId: '', newGoalName: '', amount: '', date: todayIso(), comment: '' })
      onSuccess?.()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-ink">Maqsad</span>
        <select
          {...register('goalId')}
          className="h-14 rounded-2xl border-2 border-line bg-card px-4 text-lg text-ink outline-none focus:border-forest"
        >
          <option value="">Tanlang...</option>
          {goals?.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
          <option value={NEW_GOAL}>+ Yangi maqsad</option>
        </select>
        {errors.goalId && <span className="text-base font-semibold text-alert">{errors.goalId.message}</span>}
      </label>

      {selectedGoalId === NEW_GOAL && (
        <TextField
          label="Yangi maqsad nomi"
          placeholder="Masalan: Kurs puli"
          error={errors.newGoalName?.message}
          {...register('newGoalName')}
        />
      )}

      <TextField label="Summa (so'm)" type="number" min="1" error={errors.amount?.message} {...register('amount')} />
      <TextField label="Sana" type="date" error={errors.date?.message} {...register('date')} />
      <TextField label="Izoh (ixtiyoriy)" error={errors.comment?.message} {...register('comment')} />

      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          h-14 rounded-2xl border-b-2 border-forest-dark bg-forest text-lg font-bold text-white
          shadow-lg transition-all duration-100 ease-in-out
          hover:translate-y-px hover:border-b-px
          active:translate-y-0.5 active:border-b-0 active:shadow-none
          disabled:opacity-70
        "
      >
        {isSubmitting ? 'Saqlanmoqda...' : "Xarajatni qo'shish"}
      </button>
    </form>
  )
}

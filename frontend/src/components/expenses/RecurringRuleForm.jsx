import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGoals, createGoal, goalsKeys } from '../../api/goals'
import { createRecurringRule, recurringRulesKeys } from '../../api/recurringRules'
import { dashboardKeys } from '../../api/dashboard'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../forms/TextField'

// Backend `daysOfWeek` qiymatlari JS `Date#getUTCDay()` konventsiyasiga mos: 0=Yak..6=Shan.
const DAYS = [
  { value: 1, label: 'Dush' },
  { value: 2, label: 'Sesh' },
  { value: 3, label: 'Chor' },
  { value: 4, label: 'Pay' },
  { value: 5, label: 'Juma' },
  { value: 6, label: 'Shan' },
  { value: 0, label: 'Yak' },
]

const NEW_GOAL = '__new__'

const schema = z
  .object({
    goalId: z.string().optional(),
    newGoalName: z.string().trim().optional(),
    amount: z.coerce.number().int().positive("Summa 0 dan katta bo'lishi kerak"),
    frequency: z.enum(['weekly', 'monthly']),
    dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
    startDate: z.string().min(1, 'Boshlanish sanasi kiritilishi shart'),
    endDate: z.string().optional(),
    comment: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.goalId !== NEW_GOAL || (data.newGoalName?.length ?? 0) > 0, {
    message: 'Yangi maqsad nomini kiriting',
    path: ['newGoalName'],
  })
  .refine((data) => data.frequency !== 'monthly' || !!data.dayOfMonth, {
    message: 'Oyning kuni tanlanishi kerak',
    path: ['dayOfMonth'],
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas",
    path: ['endDate'],
  })

const todayIso = () => new Date().toISOString().slice(0, 10)
const DEFAULT_DAYS = [1, 2, 3, 4, 5]

export default function RecurringRuleForm({ childId, onSuccess }) {
  const queryClient = useQueryClient()
  const [days, setDays] = useState(DEFAULT_DAYS)
  const [daysError, setDaysError] = useState(null)

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
    defaultValues: {
      goalId: '',
      newGoalName: '',
      amount: '',
      frequency: 'weekly',
      dayOfMonth: '',
      startDate: todayIso(),
      endDate: '',
      comment: '',
    },
  })

  const selectedGoalId = watch('goalId')
  const frequency = watch('frequency')

  const mutation = useMutation({
    mutationFn: async (values) => {
      let goalId = values.goalId
      if (goalId === NEW_GOAL) {
        const goal = await createGoal(childId, values.newGoalName.trim())
        goalId = goal.id
      }
      return createRecurringRule(childId, {
        goalId: goalId || undefined,
        amount: values.amount,
        frequency: values.frequency,
        daysOfWeek: values.frequency === 'weekly' ? days : undefined,
        dayOfMonth: values.frequency === 'monthly' ? values.dayOfMonth : undefined,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        comment: values.comment || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: recurringRulesKeys.list(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(childId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.detail(undefined) })
      reset({
        goalId: '',
        newGoalName: '',
        amount: '',
        frequency: 'weekly',
        dayOfMonth: '',
        startDate: todayIso(),
        endDate: '',
        comment: '',
      })
      setDays(DEFAULT_DAYS)
      onSuccess?.()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  function toggleDay(value) {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()))
  }

  function onSubmit(values) {
    if (values.frequency === 'weekly' && days.length === 0) {
      setDaysError('Kamida bitta kun tanlang')
      return
    }
    setDaysError(null)
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-slate-900">Maqsad (ixtiyoriy)</span>
        <select
          {...register('goalId')}
          className="h-14 rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-900 outline-none focus:border-green-600"
        >
          <option value="">— Kundalik xarajat (maqsadsiz) —</option>
          {goals?.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
          <option value={NEW_GOAL}>+ Yangi maqsad</option>
        </select>
        <span className="text-sm font-semibold text-slate-700">
          Maqsad tanlansa (masalan "Kurs puli"), summa avtomatik shu maqsadga qo'shiladi.
        </span>
      </label>

      {selectedGoalId === NEW_GOAL && (
        <TextField
          label="Yangi maqsad nomi"
          placeholder="Masalan: Kurs puli"
          error={errors.newGoalName?.message}
          {...register('newGoalName')}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-base font-semibold text-slate-900">Takrorlanish</span>
        <div className="flex gap-2">
          <label
            className={
              frequency === 'weekly'
                ? 'flex-1 cursor-pointer rounded-2xl border-2 border-yellow-500 bg-yellow-50 px-3 py-3 text-center text-sm font-bold text-yellow-700'
                : 'flex-1 cursor-pointer rounded-2xl border-2 border-slate-300 px-3 py-3 text-center text-sm font-bold text-slate-700'
            }
          >
            <input type="radio" value="weekly" {...register('frequency')} className="sr-only" />
            Har hafta
          </label>
          <label
            className={
              frequency === 'monthly'
                ? 'flex-1 cursor-pointer rounded-2xl border-2 border-yellow-500 bg-yellow-50 px-3 py-3 text-center text-sm font-bold text-yellow-700'
                : 'flex-1 cursor-pointer rounded-2xl border-2 border-slate-300 px-3 py-3 text-center text-sm font-bold text-slate-700'
            }
          >
            <input type="radio" value="monthly" {...register('frequency')} className="sr-only" />
            Har oy
          </label>
        </div>
      </div>

      {frequency === 'weekly' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-base font-semibold text-slate-900">Kunlar</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = days.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={
                    active
                      ? 'h-12 w-14 rounded-xl border-2 border-yellow-500 bg-yellow-50 text-sm font-bold text-yellow-700'
                      : 'h-12 w-14 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-700'
                  }
                >
                  {day.label}
                </button>
              )
            })}
          </div>
          {daysError && <span className="text-base font-semibold text-red-600">{daysError}</span>}
        </div>
      )}

      {frequency === 'monthly' && (
        <TextField
          label="Oyning nechanchi kuni"
          type="number"
          min="1"
          max="31"
          placeholder="Masalan: 5"
          error={errors.dayOfMonth?.message}
          {...register('dayOfMonth')}
        />
      )}

      <TextField label="Summa (so'm)" type="number" min="1" error={errors.amount?.message} {...register('amount')} />
      <TextField label="Boshlanish sanasi" type="date" error={errors.startDate?.message} {...register('startDate')} />
      <TextField label="Tugash sanasi (ixtiyoriy)" type="date" error={errors.endDate?.message} {...register('endDate')} />
      <TextField label="Izoh (ixtiyoriy)" error={errors.comment?.message} {...register('comment')} />

      {errors.root?.message && <p className="text-base font-semibold text-red-600">{errors.root.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          h-14 rounded-2xl border-b-4 border-yellow-700 bg-yellow-500 text-lg font-bold text-white
          shadow-lg transition-all duration-100 ease-in-out
          hover:translate-y-0.5 hover:border-b-[3px]
          active:translate-y-1 active:border-b-0 active:shadow-none
          disabled:opacity-70
        "
      >
        {isSubmitting ? 'Saqlanmoqda...' : 'Qoidani saqlash'}
      </button>
    </form>
  )
}

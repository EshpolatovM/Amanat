import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGoals, goalsKeys, resolveGoalId } from '../../api/goals'
import { createPlannedExpense, updatePlannedExpense } from '../../api/plannedExpenses'
import { extractErrorMessage } from '../../lib/apiClient'
import { invalidateChildData } from '../../lib/invalidate'
import { todayIso, toIsoDate } from '../../lib/date'
import { commentSchema, dateSchema, moneySchema } from '../../lib/validation'
import { toast } from '../../store/toastStore'
import TextField from '../forms/TextField'
import MoneyField from '../forms/MoneyField'
import Button from '../ui/Button'
import GoalFields, { NEW_GOAL } from './GoalFields'

const schema = z
  .object({
    goalId: z.string().min(1, 'Maqsadni tanlang'),
    newGoalName: z.string().trim().max(60, 'Maqsad nomi 60 belgidan oshmasligi kerak').optional(),
    amount: moneySchema,
    date: dateSchema(),
    comment: commentSchema.optional(),
  })
  .refine((data) => data.goalId !== NEW_GOAL || (data.newGoalName?.length ?? 0) > 0, {
    message: 'Yangi maqsad nomini kiriting',
    path: ['newGoalName'],
  })

function defaultValues(expense) {
  return {
    goalId: expense?.goalId ?? '',
    newGoalName: '',
    amount: expense?.amount ?? '',
    date: expense ? toIsoDate(expense.date) : todayIso(),
    comment: expense?.comment ?? '',
  }
}

// `expense` berilsa — tahrirlash rejimi (PATCH), aks holda yangi yozuv.
export default function PlannedExpenseForm({ childId, expense, onSuccess }) {
  const isEdit = Boolean(expense)
  const queryClient = useQueryClient()
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: goalsKeys.list(childId),
    queryFn: () => fetchGoals(childId),
    enabled: !!childId,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaultValues(expense) })

  const selectedGoalId = useWatch({ control, name: 'goalId' })

  // Bolada hali maqsad yo'q bo'lsa — darhol "yangi maqsad" nomini so'raymiz.
  useEffect(() => {
    if (!isEdit && goals && goals.length === 0 && getValues('goalId') === '') {
      setValue('goalId', NEW_GOAL)
    }
  }, [goals, isEdit, getValues, setValue])

  const mutation = useMutation({
    mutationFn: async (values) => {
      const goalId =
        values.goalId === NEW_GOAL ? await resolveGoalId(childId, goals, values.newGoalName) : values.goalId
      const payload = {
        goalId,
        amount: values.amount,
        date: values.date,
        comment: values.comment || (isEdit ? null : undefined),
      }
      return isEdit ? updatePlannedExpense(expense.id, payload) : createPlannedExpense(childId, payload)
    },
    onSuccess: () => {
      invalidateChildData(queryClient, childId)
      toast.success(isEdit ? 'Xarajat yangilandi' : "Xarajat qo'shildi")
      if (!isEdit) reset(defaultValues())
      onSuccess?.()
    },
    onError: (error) => {
      // Maqsad yaratilib, xarajat saqlanmay qolgan bo'lishi mumkin — ro'yxatni yangilaymiz.
      queryClient.invalidateQueries({ queryKey: goalsKeys.list(childId) })
      setError('root', { message: extractErrorMessage(error) })
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <GoalFields
        goals={goals}
        isLoading={goalsLoading}
        register={register}
        errors={errors}
        selectedGoalId={selectedGoalId}
      />

      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <MoneyField label="Summa" placeholder="Masalan: 500 000" error={fieldState.error?.message} {...field} />
        )}
      />
      <TextField label="Sana" type="date" error={errors.date?.message} {...register('date')} />
      <TextField
        label="Izoh (ixtiyoriy)"
        placeholder="Masalan: sentabr oyi uchun"
        maxLength={500}
        error={errors.comment?.message}
        {...register('comment')}
      />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={mutation.isPending} fullWidth>
        {isEdit ? "O'zgarishlarni saqlash" : "Xarajatni qo'shish"}
      </Button>
    </form>
  )
}

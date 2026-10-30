import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import { fetchGoals, goalsKeys, resolveGoalId } from '../../api/goals'
import { createRecurringRule, updateRecurringRule } from '../../api/recurringRules'
import { extractErrorMessage } from '../../lib/apiClient'
import { invalidateChildData } from '../../lib/invalidate'
import { formatDayLabel, todayIso, toIsoDate } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import { commentSchema, dateSchema, moneySchema } from '../../lib/validation'
import { toast } from '../../store/toastStore'
import TextField from '../forms/TextField'
import SelectField from '../forms/SelectField'
import MoneyField from '../forms/MoneyField'
import Button from '../ui/Button'
import GoalFields, { NEW_GOAL } from './GoalFields'

// Backend `daysOfWeek` qiymatlari JS `Date#getUTCDay()` konventsiyasiga mos: 0=Yak..6=Shan.
const WEEK_DAYS = [
  { value: 1, label: 'Dush', full: 'Dushanba' },
  { value: 2, label: 'Sesh', full: 'Seshanba' },
  { value: 3, label: 'Chor', full: 'Chorshanba' },
  { value: 4, label: 'Pay', full: 'Payshanba' },
  { value: 5, label: 'Juma', full: 'Juma' },
  { value: 6, label: 'Shan', full: 'Shanba' },
  { value: 0, label: 'Yak', full: 'Yakshanba' },
]

const DEFAULT_DAYS = [1, 2, 3, 4, 5]
const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1)

const schema = z
  .object({
    goalId: z.string(),
    newGoalName: z.string().trim().max(60, 'Maqsad nomi 60 belgidan oshmasligi kerak').optional(),
    amount: moneySchema,
    frequency: z.enum(['weekly', 'monthly']),
    daysOfWeek: z.array(z.number()),
    dayOfMonth: z.string(),
    startDate: dateSchema('Boshlanish sanasi kiritilishi shart'),
    endDate: z.string(),
    comment: commentSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.goalId === NEW_GOAL && !data.newGoalName) {
      ctx.addIssue({ code: 'custom', path: ['newGoalName'], message: 'Yangi maqsad nomini kiriting' })
    }
    if (data.frequency === 'weekly' && data.daysOfWeek.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['daysOfWeek'], message: 'Kamida bitta kunni tanlang' })
    }
    if (data.frequency === 'monthly' && !data.dayOfMonth) {
      ctx.addIssue({ code: 'custom', path: ['dayOfMonth'], message: 'Oyning qaysi kuni ekanini tanlang' })
    }
    if (data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: "Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas",
      })
    }
  })

function defaultValues(rule) {
  return {
    goalId: rule?.goalId ?? '',
    newGoalName: '',
    amount: rule?.amount ?? '',
    frequency: rule?.frequency ?? 'weekly',
    daysOfWeek: rule?.frequency === 'weekly' ? rule.daysOfWeek : DEFAULT_DAYS,
    dayOfMonth: rule?.dayOfMonth ? String(rule.dayOfMonth) : '',
    startDate: rule ? toIsoDate(rule.startDate) : todayIso(),
    endDate: rule?.endDate ? toIsoDate(rule.endDate) : '',
    comment: rule?.comment ?? '',
  }
}

function FrequencyOption({ value, label, active, register }) {
  return (
    <label
      className={`flex min-h-12 flex-1 items-center justify-center rounded-2xl border-2 px-3 py-2 text-center text-base font-bold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-forest/30 ${
        active ? 'border-bronze bg-bronze-soft text-bronze-ink' : 'border-line bg-card text-ink-soft hover:bg-paper'
      }`}
    >
      <input type="radio" value={value} {...register('frequency')} className="sr-only" />
      {label}
    </label>
  )
}

// `rule` berilsa — tahrirlash rejimi. O'zgarishlar faqat kelajakdagi
// yozuvlarga ta'sir qiladi (backend `generatedUntil` kursori).
export default function RecurringRuleForm({ childId, rule, onSuccess }) {
  const isEdit = Boolean(rule)
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
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaultValues(rule) })

  const [selectedGoalId, frequency, days, amount, startDate, endDate] = useWatch({
    control,
    name: ['goalId', 'frequency', 'daysOfWeek', 'amount', 'startDate', 'endDate'],
  })

  const mutation = useMutation({
    mutationFn: async (values) => {
      let goalId = values.goalId
      if (goalId === NEW_GOAL) {
        goalId = await resolveGoalId(childId, goals, values.newGoalName)
      }
      const payload = {
        goalId: goalId || (isEdit ? null : undefined),
        amount: values.amount,
        frequency: values.frequency,
        daysOfWeek: values.frequency === 'weekly' ? values.daysOfWeek : undefined,
        dayOfMonth: values.frequency === 'monthly' ? Number(values.dayOfMonth) : undefined,
        startDate: values.startDate,
        endDate: values.endDate || (isEdit ? null : undefined),
        comment: values.comment || (isEdit ? null : undefined),
      }
      return isEdit ? updateRecurringRule(rule.id, payload) : createRecurringRule(childId, payload)
    },
    onSuccess: () => {
      invalidateChildData(queryClient, childId)
      toast.success(isEdit ? 'Qoida yangilandi' : 'Qoida saqlandi — xarajatlar endi avtomatik qo\'shiladi')
      if (!isEdit) reset(defaultValues())
      onSuccess?.()
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: goalsKeys.list(childId) })
      setError('root', { message: extractErrorMessage(error) })
    },
  })

  function toggleDay(value) {
    const next = days.includes(value) ? days.filter((day) => day !== value) : [...days, value].sort((a, b) => a - b)
    setValue('daysOfWeek', next, { shouldValidate: Boolean(errors.daysOfWeek) })
  }

  const weeklyTotal =
    frequency === 'weekly' && amount && days.length > 0 ? (BigInt(amount) * BigInt(days.length)).toString() : null
  const today = todayIso()
  const startsInPast = !isEdit && startDate && startDate < today
  // Tahrirlashda sana oralig'i o'zgarishining oqibatlari (backend shunday ishlaydi):
  const startMovedEarlier = isEdit && startDate && startDate < toIsoDate(rule.startDate)
  const endsInPast = isEdit && endDate && endDate < today

  let startHint
  if (startsInPast) {
    startHint = `O'tgan kun tanlandi — ${formatDayLabel(startDate)}dan bugungacha bo'lgan xarajatlar ham darhol qo'shiladi.`
  } else if (startMovedEarlier) {
    startHint = "Sana ertaroqqa surildi — qo'shilgan davr uchun xarajatlar ham yoziladi."
  }

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      {isEdit && (
        <p className="flex gap-2 rounded-2xl border-2 border-line bg-paper p-3 text-sm font-semibold text-ink-soft">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          O'zgarishlar faqat bundan keyingi yozuvlarga ta'sir qiladi — avval qo'shilgan xarajatlar o'zgarmaydi.
        </p>
      )}

      <GoalFields
        goals={goals}
        isLoading={goalsLoading}
        register={register}
        errors={errors}
        selectedGoalId={selectedGoalId}
        optional
        hint={'Maqsad tanlansa (masalan "Kurs puli"), summa shu maqsadga qo\'shiladi.'}
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-base font-semibold text-ink">Qanchalik tez-tez</legend>
        <div className="flex gap-2">
          <FrequencyOption value="weekly" label="Har hafta" active={frequency === 'weekly'} register={register} />
          <FrequencyOption value="monthly" label="Har oy" active={frequency === 'monthly'} register={register} />
        </div>
      </fieldset>

      {frequency === 'weekly' && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-base font-semibold text-ink">Qaysi kunlari</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_DAYS.map((day) => {
              const active = days.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  aria-pressed={active}
                  aria-label={day.full}
                  className={
                    active
                      ? 'h-12 rounded-xl border-2 border-bronze bg-bronze-soft text-sm font-bold text-bronze-ink transition-colors'
                      : 'h-12 rounded-xl border-2 border-line bg-card text-sm font-bold text-ink-soft transition-colors hover:bg-paper'
                  }
                >
                  {day.label}
                </button>
              )
            })}
          </div>
          {errors.daysOfWeek && <p className="text-base font-semibold text-alert">{errors.daysOfWeek.message}</p>}
        </fieldset>
      )}

      {frequency === 'monthly' && (
        <SelectField
          label="Oyning qaysi kuni"
          hint="29–31 tanlansa, qisqa oylarda oyning oxirgi kunida qo'shiladi."
          error={errors.dayOfMonth?.message}
          {...register('dayOfMonth')}
        >
          <option value="">Kunni tanlang…</option>
          {MONTH_DAYS.map((day) => (
            <option key={day} value={day}>
              Har oyning {day}-sanasi
            </option>
          ))}
        </SelectField>
      )}

      <Controller
        name="amount"
        control={control}
        render={({ field, fieldState }) => (
          <MoneyField
            label={frequency === 'monthly' ? 'Har oy beriladigan summa' : 'Har safar beriladigan summa'}
            placeholder="Masalan: 10 000"
            hint={weeklyTotal ? `Haftasiga jami: ${formatMoney(weeklyTotal)} (${days.length} kun)` : undefined}
            error={fieldState.error?.message}
            {...field}
          />
        )}
      />

      <TextField
        label="Boshlanish sanasi"
        type="date"
        hint={startHint}
        error={errors.startDate?.message}
        {...register('startDate')}
      />
      <TextField
        label="Tugash sanasi (ixtiyoriy)"
        type="date"
        hint={
          endsInPast
            ? "O'tgan sana tanlandi — shu kundan keyin avtomatik qo'shilgan yozuvlar o'chiriladi."
            : "Bo'sh qoldirilsa, qoida siz to'xtatguningizcha ishlaydi."
        }
        error={errors.endDate?.message}
        {...register('endDate')}
      />
      <TextField
        label="Izoh (ixtiyoriy)"
        placeholder="Masalan: maktabdagi tushlik uchun"
        maxLength={500}
        error={errors.comment?.message}
        {...register('comment')}
      />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" variant="bronze" loading={mutation.isPending} fullWidth>
        {isEdit ? "O'zgarishlarni saqlash" : 'Qoidani saqlash'}
      </Button>
    </form>
  )
}

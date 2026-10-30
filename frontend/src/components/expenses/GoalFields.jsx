import SelectField from '../forms/SelectField'
import TextField from '../forms/TextField'

export const NEW_GOAL = '__new__'

// Maqsad tanlash + "+ Yangi maqsad" tanlanganda nom kiritish maydoni.
export default function GoalFields({ goals, isLoading, register, errors, selectedGoalId, optional = false, hint }) {
  return (
    <>
      <SelectField
        label={optional ? 'Maqsad (ixtiyoriy)' : 'Maqsad'}
        hint={hint}
        error={errors.goalId?.message}
        {...register('goalId')}
      >
        <option value="">
          {optional ? '— Kundalik xarajat (maqsadsiz) —' : isLoading ? 'Yuklanmoqda…' : 'Maqsadni tanlang…'}
        </option>
        {goals?.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.name}
          </option>
        ))}
        <option value={NEW_GOAL}>+ Yangi maqsad qo'shish</option>
      </SelectField>

      {selectedGoalId === NEW_GOAL && (
        <TextField
          label="Yangi maqsad nomi"
          placeholder="Masalan: Kurs puli"
          maxLength={60}
          error={errors.newGoalName?.message}
          {...register('newGoalName')}
        />
      )}
    </>
  )
}

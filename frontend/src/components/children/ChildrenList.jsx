import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchChildren, regenerateChildPassword, updateChild } from '../../api/children'
import { extractErrorMessage } from '../../lib/apiClient'
import Avatar from '../profile/Avatar'
import CredentialChip from '../profile/CredentialChip'
import TextField from '../forms/TextField'

const editChildSchema = z.object({
  firstName: z.string().trim().min(1, 'Ism kiritilishi shart'),
  lastName: z.string().trim().min(1, 'Familiya kiritilishi shart'),
  age: z.coerce.number().int().min(1, "Yosh noto'g'ri").max(25, "Yosh noto'g'ri"),
})

function EditChildForm({ child, onDone }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(editChildSchema),
    defaultValues: { firstName: child.firstName, lastName: child.lastName, age: child.age },
  })

  const mutation = useMutation({
    mutationFn: (values) => updateChild(child.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] })
      onDone()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-3 flex flex-col gap-3" noValidate>
      <TextField label="Ism" error={errors.firstName?.message} {...register('firstName')} />
      <TextField label="Familiya" error={errors.lastName?.message} {...register('lastName')} />
      <TextField label="Yosh" type="number" error={errors.age?.message} {...register('age')} />

      {errors.root?.message && <p className="text-base font-semibold text-alert">{errors.root.message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            h-12 flex-1 rounded-2xl border-b-2 border-forest-dark bg-forest text-base font-bold text-white
            shadow-lg transition-all duration-100 ease-in-out
            hover:translate-y-px hover:border-b-px
            active:translate-y-0.5 active:border-b-0 active:shadow-none
            disabled:opacity-70
          "
        >
          {isSubmitting ? 'Kuting...' : 'Saqlash'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-12 flex-1 rounded-2xl border-2 border-line text-base font-bold text-ink-soft transition-colors hover:bg-paper"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  )
}

function ResetPasswordControl({ childId }) {
  const [newPassword, setNewPassword] = useState(null)
  const [error, setError] = useState(null)

  const mutation = useMutation({
    mutationFn: () => regenerateChildPassword(childId),
    onSuccess: (password) => {
      setError(null)
      setNewPassword(password)
    },
    onError: (mutationError) => setError(extractErrorMessage(mutationError)),
  })

  if (newPassword) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <CredentialChip label="Yangi parol" value={newPassword} tone="forest" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-alert">Saqlab qo'ying — u qayta ko'rsatilmaydi.</p>
          <button
            type="button"
            onClick={() => setNewPassword(null)}
            className="shrink-0 text-sm font-bold text-forest underline transition-colors hover:text-forest"
          >
            Yopish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="text-sm font-bold text-forest underline transition-colors hover:text-forest disabled:opacity-70"
      >
        {mutation.isPending ? 'Yaratilmoqda...' : 'Parolni yangilash'}
      </button>
      {error && <p className="mt-1 text-sm font-semibold text-alert">{error}</p>}
    </div>
  )
}

function ChildCard({ child }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="rounded-2xl border-2 border-line bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            firstName={child.firstName}
            lastName={child.lastName}
            className="border-2 border-bronze bg-bronze-soft text-bronze-dark"
          />
          <div>
            <p className="text-lg font-bold text-ink">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-sm font-semibold text-ink-soft">{child.age} yosh</p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 text-sm font-bold text-forest underline transition-colors hover:text-forest"
          >
            Tahrirlash
          </button>
        )}
      </div>

      {isEditing && <EditChildForm child={child} onDone={() => setIsEditing(false)} />}

      <div className="mt-3">
        <CredentialChip label="Kirish ID" value={child.phone} />
      </div>

      <ResetPasswordControl childId={child.id} />
    </div>
  )
}

export default function ChildrenList() {
  const { data: children, isLoading } = useQuery({ queryKey: ['children'], queryFn: fetchChildren })

  if (isLoading) {
    return <p className="text-base font-semibold text-ink-soft">Yuklanmoqda...</p>
  }

  if (!children?.length) {
    return <p className="text-base font-semibold text-ink-soft">Hali bola profili qo'shilmagan.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {children.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  )
}

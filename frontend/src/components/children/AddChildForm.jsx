import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createChildWithGeneratedCredentials } from '../../api/children'
import { extractErrorMessage } from '../../lib/apiClient'
import TextField from '../forms/TextField'
import CredentialChip from '../profile/CredentialChip'

const addChildSchema = z.object({
  firstName: z.string().trim().min(1, 'Ism kiritilishi shart'),
  lastName: z.string().trim().min(1, 'Familiya kiritilishi shart'),
  age: z.coerce.number().int().min(1, "Yosh noto'g'ri").max(25, "Yosh noto'g'ri"),
})

export default function AddChildForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(addChildSchema) })

  const createMutation = useMutation({
    mutationFn: createChildWithGeneratedCredentials,
    onSuccess: ({ credentials }) => {
      setCreatedCredentials(credentials)
      queryClient.invalidateQueries({ queryKey: ['children'] })
      reset()
      setIsOpen(false)
    },
    onError: (error) => {
      setError('root', { message: extractErrorMessage(error) })
    },
  })

  async function onSubmit(values) {
    createMutation.mutate(values)
  }

  return (
    <div className="flex flex-col gap-4">
      {createdCredentials && (
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-4">
          <p className="text-lg font-bold text-slate-900">Bola profili yaratildi</p>
          <div className="mt-3 flex flex-col gap-2">
            <CredentialChip label="Kirish ID" value={createdCredentials.loginId} tone="green" />
            <CredentialChip label="Parol" value={createdCredentials.password} tone="green" />
          </div>
          <p className="mt-3 text-sm font-semibold text-red-600">
            Parolni saqlab qo'ying — u qayta ko'rsatilmaydi.
          </p>
          <button
            type="button"
            onClick={() => setCreatedCredentials(null)}
            className="mt-3 text-base font-semibold text-green-600"
          >
            Yopish
          </button>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            h-14 rounded-2xl border-b-4 border-green-800 bg-green-600 text-base font-bold text-white
            shadow-lg transition-all duration-100 ease-in-out
            hover:translate-y-0.5 hover:border-b-[3px]
            active:translate-y-1 active:border-b-0 active:shadow-none
          "
        >
          + Bola qo'shish
        </button>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <TextField label="Ism" error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Familiya" error={errors.lastName?.message} {...register('lastName')} />
          <TextField label="Yosh" type="number" error={errors.age?.message} {...register('age')} />

          {errors.root?.message && <p className="text-base font-semibold text-red-600">{errors.root.message}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                h-14 flex-1 rounded-2xl border-b-4 border-green-800 bg-green-600 text-base font-bold text-white
                shadow-lg transition-all duration-100 ease-in-out
                hover:translate-y-0.5 hover:border-b-[3px]
                active:translate-y-1 active:border-b-0 active:shadow-none
                disabled:opacity-70
              "
            >
              {isSubmitting ? 'Kuting...' : 'ID va parol yaratish'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-14 flex-1 rounded-2xl border-2 border-slate-300 text-base font-bold text-slate-700"
            >
              Bekor qilish
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

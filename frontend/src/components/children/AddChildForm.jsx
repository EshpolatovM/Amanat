import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { childrenKeys, createChildWithGeneratedCredentials } from '../../api/children'
import { extractErrorMessage } from '../../lib/apiClient'
import { ageSchema, nameSchema } from '../../lib/validation'
import TextField from '../forms/TextField'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import CredentialsNotice from './CredentialsNotice'

const addChildSchema = z.object({
  firstName: nameSchema('Ism'),
  lastName: nameSchema('Familiya'),
  age: ageSchema,
})

export default function AddChildForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [created, setCreated] = useState(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(addChildSchema) })

  const createMutation = useMutation({
    mutationFn: createChildWithGeneratedCredentials,
    onSuccess: ({ child, credentials }) => {
      setCreated({ childName: child.firstName, ...credentials })
      queryClient.invalidateQueries({ queryKey: childrenKeys.list })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      reset()
      setIsOpen(false)
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <div className="flex flex-col gap-4">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} fullWidth>
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          Farzand qo'shish
        </Button>
      )}

      {isOpen && (
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-paper p-4"
          noValidate
        >
          <p className="text-base font-semibold text-ink-soft">
            Farzandingiz uchun kirish ID va parol avtomatik yaratiladi — u o'z xarajatlarini faqat ko'ra oladi.
          </p>
          <TextField label="Ism" autoComplete="off" maxLength={50} error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Familiya" autoComplete="off" maxLength={50} error={errors.lastName?.message} {...register('lastName')} />
          <TextField
            label="Yoshi"
            type="number"
            inputMode="numeric"
            min="1"
            max="25"
            error={errors.age?.message}
            {...register('age')}
          />

          {errors.root?.message && (
            <p role="alert" className="text-base font-semibold text-alert">
              {errors.root.message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" loading={createMutation.isPending} className="sm:flex-1">
              ID va parol yaratish
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
              className="sm:flex-1"
            >
              Bekor qilish
            </Button>
          </div>
        </form>
      )}

      <Modal open={Boolean(created)} onClose={() => setCreated(null)} title="Farzand profili yaratildi">
        {created && (
          <div className="flex flex-col gap-4">
            <p className="text-base font-semibold text-ink-soft">
              {created.childName} Amanat'ga «Bola» bo'limidan shu ma'lumotlar bilan kiradi:
            </p>
            <CredentialsNotice childName={created.childName} loginId={created.loginId} password={created.password} />
            <Button onClick={() => setCreated(null)}>Saqlab oldim</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

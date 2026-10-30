import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import { childrenKeys, deleteChild, fetchChildren, regenerateChildPassword, updateChild } from '../../api/children'
import { extractErrorMessage } from '../../lib/apiClient'
import { formatLoginId } from '../../lib/phone'
import { ageSchema, nameSchema } from '../../lib/validation'
import { toast } from '../../store/toastStore'
import Avatar from '../profile/Avatar'
import CredentialChip from '../profile/CredentialChip'
import TextField from '../forms/TextField'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'
import CredentialsNotice from './CredentialsNotice'

const editChildSchema = z.object({
  firstName: nameSchema('Ism'),
  lastName: nameSchema('Familiya'),
  age: ageSchema,
})

function EditChildForm({ child, onDone }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(editChildSchema),
    defaultValues: { firstName: child.firstName, lastName: child.lastName, age: child.age },
  })

  const mutation = useMutation({
    mutationFn: (values) => updateChild(child.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childrenKeys.list })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success("Ma'lumotlar saqlandi")
      onDone()
    },
    onError: (error) => setError('root', { message: extractErrorMessage(error) }),
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4" noValidate>
      <TextField label="Ism" maxLength={50} error={errors.firstName?.message} {...register('firstName')} />
      <TextField label="Familiya" maxLength={50} error={errors.lastName?.message} {...register('lastName')} />
      <TextField label="Yoshi" type="number" inputMode="numeric" min="1" max="25" error={errors.age?.message} {...register('age')} />

      {errors.root?.message && (
        <p role="alert" className="text-base font-semibold text-alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={mutation.isPending} fullWidth>
        Saqlash
      </Button>
    </form>
  )
}

function DeleteChildDialog({ child, onClose }) {
  const queryClient = useQueryClient()
  const [acknowledged, setAcknowledged] = useState(false)

  const mutation = useMutation({
    mutationFn: () => deleteChild(child.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: childrenKeys.list })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      toast.success(`${child.firstName} profili o'chirildi`)
      onClose()
    },
  })

  return (
    <Modal open onClose={mutation.isPending ? () => {} : onClose} title="Farzand profilini o'chirish">
      <div className="flex flex-col gap-5">
        <p className="text-base font-semibold text-ink-soft">
          <strong className="text-ink">
            {child.firstName} {child.lastName}
          </strong>{' '}
          profili va unga tegishli <strong className="text-alert">barcha xarajatlar, avtomatik qoidalar va maqsadlar</strong>{' '}
          butunlay o'chiriladi. Farzandingiz ham tizimga kira olmaydi. Bu amalni ortga qaytarib bo'lmaydi.
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-line p-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-alert"
          />
          <span className="text-base font-semibold text-ink">Tushundim, barcha ma'lumotlar o'chadi</span>
        </label>

        {mutation.isError && (
          <p role="alert" className="rounded-2xl border-2 border-alert bg-alert-soft p-3 text-base font-semibold text-alert">
            {extractErrorMessage(mutation.error)}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button variant="danger" size="md" disabled={!acknowledged} loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Profilni o'chirish
          </Button>
          <Button variant="secondary" size="md" onClick={onClose} disabled={mutation.isPending}>
            Bekor qilish
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ChildCard({ child }) {
  const [dialog, setDialog] = useState(null) // edit | password | delete
  const [newPassword, setNewPassword] = useState(null)

  const passwordMutation = useMutation({
    mutationFn: () => regenerateChildPassword(child.id),
    onSuccess: (password) => {
      setDialog(null)
      setNewPassword(password)
    },
  })

  return (
    <li className="flex flex-col gap-4 rounded-2xl border-2 border-line bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar firstName={child.firstName} lastName={child.lastName} className="border-2 border-bronze bg-bronze-soft text-bronze-ink" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-ink">
            {child.firstName} {child.lastName}
          </p>
          <p className="text-base font-semibold text-ink-soft">{child.age} yosh</p>
        </div>
      </div>

      <CredentialChip label="Kirish ID" value={child.phone} display={formatLoginId(child.phone)} copyable />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="secondary" size="sm" onClick={() => setDialog('edit')}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Tahrirlash
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setDialog('password')}>
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Yangi parol
        </Button>
        <Button variant="dangerOutline" size="sm" onClick={() => setDialog('delete')}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          O'chirish
        </Button>
      </div>

      <Modal open={dialog === 'edit'} onClose={() => setDialog(null)} title="Farzand ma'lumotlari">
        <EditChildForm child={child} onDone={() => setDialog(null)} />
      </Modal>

      <ConfirmDialog
        open={dialog === 'password'}
        title="Yangi parol yaratilsinmi?"
        confirmLabel="Ha, yangi parol"
        tone="primary"
        loading={passwordMutation.isPending}
        error={passwordMutation.isError ? extractErrorMessage(passwordMutation.error) : null}
        onConfirm={() => passwordMutation.mutate()}
        onClose={() => {
          passwordMutation.reset()
          setDialog(null)
        }}
      >
        {child.firstName}ning eski paroli ishlamay qoladi va u barcha qurilmalardan chiqib ketadi. Yangi parolni
        unga berishingiz kerak bo'ladi.
      </ConfirmDialog>

      {dialog === 'delete' && <DeleteChildDialog child={child} onClose={() => setDialog(null)} />}

      <Modal open={Boolean(newPassword)} onClose={() => setNewPassword(null)} title="Yangi parol tayyor">
        {newPassword && (
          <div className="flex flex-col gap-4">
            <CredentialsNotice childName={child.firstName} loginId={child.phone} password={newPassword} />
            <Button onClick={() => setNewPassword(null)}>Saqlab oldim</Button>
          </div>
        )}
      </Modal>
    </li>
  )
}

export default function ChildrenList() {
  const query = useQuery({ queryKey: childrenKeys.list, queryFn: fetchChildren })

  if (query.isPending) return <LoadingState />
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  if (!query.data.length) {
    return <EmptyState>Hali farzand profili yo'q. Quyidagi tugma orqali qo'shing.</EmptyState>
  }

  return (
    <ul className="flex flex-col gap-4">
      {query.data.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </ul>
  )
}

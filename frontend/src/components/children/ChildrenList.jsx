import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchChildren, regenerateChildPassword } from '../../api/children'
import { extractErrorMessage } from '../../lib/apiClient'
import Avatar from '../profile/Avatar'
import CredentialChip from '../profile/CredentialChip'

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
        <CredentialChip label="Yangi parol" value={newPassword} tone="green" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-red-600">Saqlab qo'ying — u qayta ko'rsatilmaydi.</p>
          <button
            type="button"
            onClick={() => setNewPassword(null)}
            className="shrink-0 text-sm font-bold text-green-600"
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
        className="text-sm font-bold text-green-600 underline disabled:opacity-70"
      >
        {mutation.isPending ? 'Yaratilmoqda...' : 'Parolni yangilash'}
      </button>
      {error && <p className="mt-1 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  )
}

export default function ChildrenList() {
  const { data: children, isLoading } = useQuery({ queryKey: ['children'], queryFn: fetchChildren })

  if (isLoading) {
    return <p className="text-base font-semibold text-slate-700">Yuklanmoqda...</p>
  }

  if (!children?.length) {
    return <p className="text-base font-semibold text-slate-700">Hali bola profili qo'shilmagan.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {children.map((child) => (
        <div key={child.id} className="rounded-2xl border-2 border-slate-300 bg-white p-4">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={child.firstName}
              lastName={child.lastName}
              className="border-2 border-blue-400 bg-blue-50 text-blue-700"
            />
            <div>
              <p className="text-lg font-bold text-slate-900">
                {child.firstName} {child.lastName}
              </p>
              <p className="text-sm font-semibold text-slate-700">{child.age} yosh</p>
            </div>
          </div>

          <div className="mt-3">
            <CredentialChip label="Kirish ID" value={child.phone} />
          </div>

          <ResetPasswordControl childId={child.id} />
        </div>
      ))}
    </div>
  )
}

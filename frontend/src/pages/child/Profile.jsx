import { useAuthStore } from '../../store/authStore'
import { formatLoginId } from '../../lib/phone'
import LogoutButton from '../../components/auth/LogoutButton'
import Avatar from '../../components/profile/Avatar'
import CredentialChip from '../../components/profile/CredentialChip'
import PageHeader from '../../components/ui/PageHeader'

export default function ChildProfile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Men" />

      {user && (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border-4 border-bronze bg-bronze-soft p-6">
          <div className="flex items-center gap-4">
            <Avatar firstName={user.firstName} lastName={user.lastName} className="border-2 border-bronze bg-card text-bronze-ink" />
            <div className="min-w-0">
              <p className="truncate text-2xl font-bold text-ink">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-lg font-semibold text-ink-soft">{user.age} yosh</p>
            </div>
          </div>
          <CredentialChip label="Kirish ID" value={user.phone} display={formatLoginId(user.phone)} tone="bronze" />
          <p className="text-base font-semibold text-ink-soft">
            Parolingni unutsang, ota-onangdan yangi parol so'ra — ular Profil bo'limidan yangilab beradi.
          </p>
        </div>
      )}

      <LogoutButton />
    </div>
  )
}

import { useAuthStore } from '../../store/authStore'
import LogoutButton from '../../components/auth/LogoutButton'
import Avatar from '../../components/profile/Avatar'
import CredentialChip from '../../components/profile/CredentialChip'

export default function ChildProfile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-serif font-semibold text-ink">Men</h1>

      {user ? (
        <div className="rounded-[1.75rem] border-4 border-bronze bg-bronze-soft p-6">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              className="border-2 border-bronze bg-card text-bronze-dark"
            />
            <div>
              <p className="text-2xl font-bold text-ink">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-base font-semibold text-ink-soft">{user.age} yosh</p>
            </div>
          </div>
          <div className="mt-4">
            <CredentialChip label="Kirish ID" value={user.phone} tone="bronze" />
          </div>
        </div>
      ) : (
        <p className="text-base font-semibold text-ink-soft">Profil ma'lumotlari yuklanmoqda...</p>
      )}

      <LogoutButton />
    </div>
  )
}

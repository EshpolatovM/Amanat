import { useAuthStore } from '../../store/authStore'
import LogoutButton from '../../components/auth/LogoutButton'
import Avatar from '../../components/profile/Avatar'
import CredentialChip from '../../components/profile/CredentialChip'

export default function ChildProfile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-slate-900">Men</h1>

      {user ? (
        <div className="rounded-[1.75rem] border-4 border-blue-400 bg-blue-50 p-6">
          <div className="flex items-center gap-4">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              className="border-2 border-blue-400 bg-white text-blue-700"
            />
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-base font-semibold text-slate-700">{user.age} yosh</p>
            </div>
          </div>
          <div className="mt-4">
            <CredentialChip label="Kirish ID" value={user.phone} tone="blue" />
          </div>
        </div>
      ) : (
        <p className="text-base font-semibold text-slate-700">Profil ma'lumotlari yuklanmoqda...</p>
      )}

      <LogoutButton />
    </div>
  )
}

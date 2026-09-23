import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import LogoutButton from '../../components/auth/LogoutButton'
import ChangePasswordForm from '../../components/auth/ChangePasswordForm'
import ChildrenList from '../../components/children/ChildrenList'
import AddChildForm from '../../components/children/AddChildForm'
import Avatar from '../../components/profile/Avatar'
import CredentialChip from '../../components/profile/CredentialChip'
import EditProfileForm from '../../components/profile/EditProfileForm'

export default function Profile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-ink">Profil</h1>

        {user ? (
          <div className="mt-4 rounded-3xl border-2 border-line bg-card p-6">
            <div className="flex items-center gap-4">
              <Avatar firstName={user.firstName} lastName={user.lastName} className="bg-forest text-white" />
              <div>
                <p className="text-2xl font-bold text-ink">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-base font-semibold text-ink-soft">Ota-ona akkaunti</p>
              </div>
            </div>
            <div className="mt-4">
              <CredentialChip label="Telefon raqami" value={user.phone} />
            </div>
            <EditProfileForm />
          </div>
        ) : (
          <p className="mt-2 text-base font-semibold text-ink-soft">Profil ma'lumotlari yuklanmoqda...</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-serif font-semibold text-ink">Parol</h2>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-semibold text-ink">Bolalar</h2>
        <div className="mt-3">
          <ChildrenList />
        </div>
        <div className="mt-4">
          <AddChildForm />
        </div>
      </div>

      <Link
        to="/help"
        className="flex items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 py-4 text-base font-bold text-ink-soft hover:bg-paper lg:hidden"
      >
        <HelpCircle className="h-6 w-6" strokeWidth={2} />
        Yordam
      </Link>

      <LogoutButton />
    </div>
  )
}

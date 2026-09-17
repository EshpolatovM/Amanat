import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import LogoutButton from '../../components/auth/LogoutButton'
import ChangePasswordForm from '../../components/auth/ChangePasswordForm'
import ChildrenList from '../../components/children/ChildrenList'
import AddChildForm from '../../components/children/AddChildForm'
import Avatar from '../../components/profile/Avatar'
import CredentialChip from '../../components/profile/CredentialChip'

export default function Profile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profil</h1>

        {user ? (
          <div className="mt-4 rounded-3xl border-2 border-slate-300 bg-white p-6">
            <div className="flex items-center gap-4">
              <Avatar firstName={user.firstName} lastName={user.lastName} className="bg-green-600 text-white" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-base font-semibold text-slate-700">Ota-ona akkaunti</p>
              </div>
            </div>
            <div className="mt-4">
              <CredentialChip label="Telefon raqami" value={user.phone} />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-base font-semibold text-slate-700">Profil ma'lumotlari yuklanmoqda...</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Parol</h2>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">Bolalar</h2>
        <div className="mt-3">
          <ChildrenList />
        </div>
        <div className="mt-4">
          <AddChildForm />
        </div>
      </div>

      <Link
        to="/help"
        className="flex items-center gap-3 rounded-2xl border-2 border-slate-300 bg-white px-4 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 lg:hidden"
      >
        <HelpCircle className="h-6 w-6" strokeWidth={2} />
        Yordam
      </Link>

      <LogoutButton />
    </div>
  )
}

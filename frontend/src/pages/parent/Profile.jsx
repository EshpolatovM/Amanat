import { Link } from 'react-router-dom'
import { ChevronRight, HelpCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { formatPhone } from '../../lib/phone'
import LogoutButton from '../../components/auth/LogoutButton'
import ChangePasswordForm from '../../components/auth/ChangePasswordForm'
import ChildrenList from '../../components/children/ChildrenList'
import AddChildForm from '../../components/children/AddChildForm'
import Avatar from '../../components/profile/Avatar'
import EditProfileForm from '../../components/profile/EditProfileForm'
import PageHeader from '../../components/ui/PageHeader'

function Section({ id, title, description, children }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <div>
        <h2 id={id} className="font-serif text-xl font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-base font-semibold text-ink-soft">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default function Profile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Profil" />

      {user && (
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-line bg-card p-5">
          <div className="flex items-center gap-4">
            <Avatar firstName={user.firstName} lastName={user.lastName} className="bg-forest text-white" />
            <div className="min-w-0">
              <p className="text-xl font-bold break-words text-ink sm:text-2xl">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-base font-semibold text-ink-soft">Ota-ona · {formatPhone(user.phone)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <EditProfileForm />
            <ChangePasswordForm />
          </div>
        </div>
      )}

      <Section
        id="children-title"
        title="Farzandlar"
        description="Har bir farzand o'z kirish ID va paroli bilan faqat o'ziga tegishli xarajatlarni ko'radi."
      >
        <ChildrenList />
        <AddChildForm />
      </Section>

      <Link
        to="/help"
        className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 text-base font-bold text-ink hover:bg-paper lg:hidden"
      >
        <HelpCircle className="h-6 w-6 text-forest" aria-hidden="true" />
        <span className="flex-1">Yordam — Amanat qanday ishlaydi</span>
        <ChevronRight className="h-5 w-5 text-ink-soft" aria-hidden="true" />
      </Link>

      <LogoutButton />
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { fetchDashboard, dashboardKeys } from '../../api/dashboard'
import { formatMonthLabel } from '../../lib/date'
import { useAuthStore } from '../../store/authStore'
import GrandTotalCard from '../../components/dashboard/GrandTotalCard'
import RecentActivityList from '../../components/dashboard/RecentActivityList'
import CategoryBreakdown from '../../components/dashboard/CategoryBreakdown'
import PageHeader from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

// Bola uchun soddalashtirilgan ko'rinish: bitta asosiy raqam, pul nimalarga
// ketgani va so'nggi yozuvlar — kattaroq shrift, kam element (CLAUDE.md §7).
export default function ChildDashboard() {
  const user = useAuthStore((state) => state.user)
  const query = useQuery({
    queryKey: dashboardKeys.detail(undefined),
    queryFn: () => fetchDashboard(undefined),
  })
  const data = query.data

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title={user ? `Salom, ${user.firstName}!` : 'Salom!'}
        subtitle={data ? formatMonthLabel(data.period.from) : undefined}
      />

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <GrandTotalCard variant="child" amount={data.totals.grandTotal} label="Bu oy sen uchun sarflangan" />

          <section className="flex flex-col gap-4" aria-labelledby="child-where-title">
            <h2 id="child-where-title" className="font-serif text-2xl font-semibold text-ink">
              Nimalarga ketdi
            </h2>
            <CategoryBreakdown
              size="lg"
              categories={data.byCategory}
              total={data.totals.grandTotal}
              emptyState={<EmptyState>Bu oy hali hech narsa yozilmagan.</EmptyState>}
            />
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="child-recent-title">
            <h2 id="child-recent-title" className="font-serif text-2xl font-semibold text-ink">
              So'nggi yozuvlar
            </h2>
            <RecentActivityList
              size="lg"
              items={data.recent}
              emptyState={<EmptyState>Hozircha yozuv yo'q.</EmptyState>}
            />
          </section>
        </>
      )}
    </div>
  )
}

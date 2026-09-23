import { useQuery } from '@tanstack/react-query'
import { fetchDashboard, dashboardKeys } from '../../api/dashboard'
import GrandTotalCard from '../../components/dashboard/GrandTotalCard'
import StatCard from '../../components/dashboard/StatCard'
import RecentActivityList from '../../components/dashboard/RecentActivityList'
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart'

export default function ChildDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: dashboardKeys.detail(undefined),
    queryFn: () => fetchDashboard(undefined),
  })

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-3xl font-serif font-semibold text-ink">Bosh sahifa</h1>
        <p className="mt-3 text-base font-semibold text-ink-soft">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-serif font-semibold text-ink">Bosh sahifa</h1>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <GrandTotalCard amount={data.totals.grandTotal} periodFrom={data.period.from} variant="child" />

          <CategoryBreakdownChart totals={data.totals} />

          <div>
            <h2 className="mb-3 text-xl font-serif font-semibold text-ink">So'nggi harakatlar</h2>
            <RecentActivityList items={data.recent} showChildName={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:flex-col">
          <StatCard type="planned" amount={data.totals.plannedTotal} variant="child" />
          <StatCard type="recurring" amount={data.totals.recurringTotal} variant="child" />
          <StatCard type="unplanned" amount={data.totals.unplannedTotal} variant="child" />
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchChildren } from '../../api/children'
import { fetchDashboard, dashboardKeys } from '../../api/dashboard'
import GrandTotalCard from '../../components/dashboard/GrandTotalCard'
import StatCard from '../../components/dashboard/StatCard'
import ChildPicker from '../../components/dashboard/ChildPicker'
import ByChildBreakdown from '../../components/dashboard/ByChildBreakdown'
import RecentActivityList from '../../components/dashboard/RecentActivityList'
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart'

export default function Dashboard() {
  const [selectedChildId, setSelectedChildId] = useState(null)

  const { data: children } = useQuery({ queryKey: ['children'], queryFn: fetchChildren })
  const { data, isLoading } = useQuery({
    queryKey: dashboardKeys.detail(selectedChildId),
    queryFn: () => fetchDashboard(selectedChildId),
  })

  const childNameById = useMemo(() => {
    const map = {}
    for (const child of children ?? []) {
      map[child.id] = `${child.firstName} ${child.lastName}`
    }
    return map
  }, [children])

  if (children && children.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bosh sahifa</h1>
        <p className="mt-3 text-base font-semibold text-slate-700">
          Hali farzand profili qo'shilmagan.{' '}
          <Link to="/profile" className="text-green-600">
            Profilga o'tib qo'shing
          </Link>
          .
        </p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bosh sahifa</h1>
        <p className="mt-3 text-base font-semibold text-slate-700">Yuklanmoqda...</p>
      </div>
    )
  }

  const showPicker = (children?.length ?? 0) > 1

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-slate-900">Bosh sahifa</h1>

      {showPicker && <ChildPicker childOptions={children} value={selectedChildId} onChange={setSelectedChildId} />}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <GrandTotalCard amount={data.totals.grandTotal} periodFrom={data.period.from} />

          <CategoryBreakdownChart totals={data.totals} />

          {showPicker && selectedChildId === null && <ByChildBreakdown byChild={data.byChild} />}

          <div>
            <h2 className="mb-3 text-xl font-bold text-slate-900">So'nggi harakatlar</h2>
            <RecentActivityList
              items={data.recent}
              childNameById={childNameById}
              showChildName={showPicker && selectedChildId === null}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:flex-col">
          <StatCard type="planned" amount={data.totals.plannedTotal} />
          <StatCard type="recurring" amount={data.totals.recurringTotal} />
          <StatCard type="unplanned" amount={data.totals.unplannedTotal} />
        </div>
      </div>
    </div>
  )
}

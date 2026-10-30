import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { childrenKeys, fetchChildren } from '../../api/children'
import { fetchDashboard, dashboardKeys } from '../../api/dashboard'
import { formatMonthLabel } from '../../lib/date'
import GrandTotalCard from '../../components/dashboard/GrandTotalCard'
import StatCard from '../../components/dashboard/StatCard'
import ChildPicker from '../../components/dashboard/ChildPicker'
import ByChildBreakdown from '../../components/dashboard/ByChildBreakdown'
import RecentActivityList from '../../components/dashboard/RecentActivityList'
import CategoryBreakdown from '../../components/dashboard/CategoryBreakdown'
import QuickAddExpenseModal from '../../components/navigation/QuickAddExpenseModal'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { buttonClassName } from '../../components/ui/buttonStyles'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

function Section({ id, title, action, children }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="font-serif text-xl font-semibold text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [isAddOpen, setAddOpen] = useState(false)

  const childrenQuery = useQuery({ queryKey: childrenKeys.list, queryFn: fetchChildren })
  const children = childrenQuery.data ?? []
  // Tanlangan farzand o'chirilgan bo'lsa — "Barchasi"ga qaytamiz
  const childId = children.some((child) => child.id === selectedChildId) ? selectedChildId : null

  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.detail(childId),
    queryFn: () => fetchDashboard(childId),
    enabled: children.length > 0,
  })

  const childNameById = useMemo(() => {
    const map = {}
    for (const child of childrenQuery.data ?? []) map[child.id] = child.firstName
    return map
  }, [childrenQuery.data])

  if (childrenQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Bosh sahifa" />
        <LoadingState />
      </div>
    )
  }

  if (childrenQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Bosh sahifa" />
        <ErrorState error={childrenQuery.error} onRetry={() => childrenQuery.refetch()} />
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Xush kelibsiz!" subtitle="Amanat farzandingizga bergan har bir pulingizni maqsadi bilan yozib boradi." />
        <EmptyState
          action={
            <Link to="/profile" className={buttonClassName({ size: 'md' })}>
              Farzand profilini qo'shish
            </Link>
          }
        >
          Boshlash uchun farzandingiz profilini qo'shing — unga kirish ID va parol beriladi, u ham o'z xarajatlarini
          ko'ra oladi.
        </EmptyState>
      </div>
    )
  }

  const data = dashboardQuery.data
  const showPicker = children.length > 1
  const isAllView = showPicker && childId === null
  const addAction = (
    <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Qo'shish
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bosh sahifa" subtitle={data ? formatMonthLabel(data.period.from) : undefined} />

      {showPicker && <ChildPicker childOptions={children} value={childId} onChange={setSelectedChildId} />}

      {dashboardQuery.isPending ? (
        <LoadingState />
      ) : dashboardQuery.isError ? (
        <ErrorState error={dashboardQuery.error} onRetry={() => dashboardQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-6">
            <GrandTotalCard amount={data.totals.grandTotal} periodFrom={data.period.from} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:hidden">
              <StatCard type="planned" amount={data.totals.plannedTotal} />
              <StatCard type="recurring" amount={data.totals.recurringTotal} />
              <StatCard type="unplanned" amount={data.totals.unplannedTotal} />
            </div>

            <Section id="where-title" title="Pul qayerga ketdi">
              <CategoryBreakdown
                categories={data.byCategory}
                total={data.totals.grandTotal}
                emptyState={
                  <EmptyState action={addAction}>
                    Bu oy hali xarajat yozilmagan — birinchi yozuvni qo'shing, shu yerda maqsadlar bo'yicha taqsimot
                    ko'rinadi.
                  </EmptyState>
                }
              />
            </Section>

            <Section
              id="recent-title"
              title="So'nggi yozuvlar"
              action={
                data.recent.length > 0 && (
                  <Link to="/expenses" className="text-base font-bold text-forest underline-offset-4 hover:underline">
                    Barchasi
                  </Link>
                )
              }
            >
              <RecentActivityList
                items={data.recent}
                childNameById={childNameById}
                showChildName={isAllView}
                emptyState={<EmptyState>Bu oy hali yozuv yo'q.</EmptyState>}
              />
            </Section>
          </div>

          <aside className="hidden flex-col gap-6 xl:flex">
            <div className="flex flex-col gap-3">
              <StatCard type="planned" amount={data.totals.plannedTotal} />
              <StatCard type="recurring" amount={data.totals.recurringTotal} />
              <StatCard type="unplanned" amount={data.totals.unplannedTotal} />
            </div>
            {isAllView && <ByChildBreakdown byChild={data.byChild} onSelectChild={setSelectedChildId} />}
          </aside>

          {isAllView && (
            <div className="xl:hidden">
              <ByChildBreakdown byChild={data.byChild} onSelectChild={setSelectedChildId} />
            </div>
          )}
        </div>
      )}

      {isAddOpen && <QuickAddExpenseModal onClose={() => setAddOpen(false)} initialChildId={childId} />}
    </div>
  )
}

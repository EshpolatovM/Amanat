import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchChildren } from '../../api/children'
import { fetchStatistics, statisticsKeys } from '../../api/statistics'
import ChildPicker from '../../components/dashboard/ChildPicker'
import CategoryBreakdownChart from '../../components/dashboard/CategoryBreakdownChart'
import TrendChart from '../../components/statistics/TrendChart'
import SummaryTile from '../../components/statistics/SummaryTile'
import { formatMoney } from '../../lib/money'

const todayIso = () => new Date().toISOString().slice(0, 10)

const CHART_PERIODS = [
  { value: 'week', label: 'Hafta' },
  { value: 'month', label: 'Oy' },
  { value: 'year', label: 'Yil' },
]

const EMPTY_TOTALS = { plannedTotal: 0, recurringTotal: 0, unplannedTotal: 0 }

export default function Statistics() {
  const [childId, setChildId] = useState(null)
  const [chartPeriod, setChartPeriod] = useState('month')

  const { data: children } = useQuery({ queryKey: ['children'], queryFn: fetchChildren })

  const monthParams = { period: 'month', childId: childId ?? undefined }
  const weekParams = { period: 'week', childId: childId ?? undefined }
  const todayParams = { from: todayIso(), to: todayIso(), childId: childId ?? undefined }
  const chartParams = { period: chartPeriod, childId: childId ?? undefined }

  const { data: monthStats } = useQuery({
    queryKey: statisticsKeys.detail(monthParams),
    queryFn: () => fetchStatistics(monthParams),
  })
  const { data: weekStats } = useQuery({
    queryKey: statisticsKeys.detail(weekParams),
    queryFn: () => fetchStatistics(weekParams),
  })
  const { data: todayStats } = useQuery({
    queryKey: statisticsKeys.detail(todayParams),
    queryFn: () => fetchStatistics(todayParams),
  })
  const { data: chartStats } = useQuery({
    queryKey: statisticsKeys.detail(chartParams),
    queryFn: () => fetchStatistics(chartParams),
  })

  const showPicker = (children?.length ?? 0) > 1

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-serif font-semibold text-ink">Statistika</h1>

      {showPicker && <ChildPicker childOptions={children} value={childId} onChange={setChildId} />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Bugun" value={formatMoney(todayStats?.totals?.grandTotal)} />
        <SummaryTile label="Bu hafta" value={formatMoney(weekStats?.totals?.grandTotal)} />
        <SummaryTile label="Bu oy" value={formatMoney(monthStats?.totals?.grandTotal)} />
        <SummaryTile
          label="Eng katta xarajat (bu oy)"
          value={monthStats?.topExpense ? formatMoney(monthStats.topExpense.amount) : "Hali yo'q"}
          sub={monthStats?.topExpense?.label}
          type={monthStats?.topExpense?.type}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-serif font-semibold text-ink">Xarajat dinamikasi</h2>
          <div className="flex gap-2">
            {CHART_PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setChartPeriod(option.value)}
                className={
                  chartPeriod === option.value
                    ? 'rounded-full bg-forest px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-forest-dark'
                    : 'rounded-full border-2 border-line px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart trend={chartStats?.trend} period={chartPeriod} />
      </div>

      <CategoryBreakdownChart totals={monthStats?.totals ?? EMPTY_TOTALS} />
    </div>
  )
}

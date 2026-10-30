import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { childrenKeys, fetchChildren } from '../../api/children'
import { fetchStatistics, fetchStatisticsSummary, statisticsKeys } from '../../api/statistics'
import { formatDayLabel, formatPeriodLabel, periodStartIso, shiftPeriodStartIso, todayIso } from '../../lib/date'
import { formatMoney } from '../../lib/money'
import ChildPicker from '../../components/dashboard/ChildPicker'
import CategoryBreakdown from '../../components/dashboard/CategoryBreakdown'
import TrendChart from '../../components/statistics/TrendChart'
import SummaryTile from '../../components/statistics/SummaryTile'
import PageHeader from '../../components/ui/PageHeader'
import IconButton from '../../components/ui/IconButton'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'

const PERIODS = [
  { value: 'week', label: 'Hafta' },
  { value: 'month', label: 'Oy' },
  { value: 'year', label: 'Yil' },
]

const PREVIOUS_LABEL = { week: 'Oldingi hafta', month: 'Oldingi oy', year: 'Oldingi yil' }
const NEXT_LABEL = { week: 'Keyingi hafta', month: 'Keyingi oy', year: 'Keyingi yil' }

export default function Statistics() {
  const [childId, setChildId] = useState(null)
  const [period, setPeriod] = useState('month')
  // Ko'rsatilayotgan davr boshi (YYYY-MM-DD) — oldingi davrlarga o'tish uchun
  const [periodStart, setPeriodStart] = useState(() => periodStartIso('month', todayIso()))

  const childrenQuery = useQuery({ queryKey: childrenKeys.list, queryFn: fetchChildren })
  const children = childrenQuery.data ?? []
  const scopeChildId = children.some((child) => child.id === childId) ? childId : null

  const summaryQuery = useQuery({
    queryKey: statisticsKeys.summary(scopeChildId),
    queryFn: () => fetchStatisticsSummary(scopeChildId),
  })

  const params = { period, childId: scopeChildId ?? undefined, from: periodStart }
  const statsQuery = useQuery({
    queryKey: statisticsKeys.detail(params),
    queryFn: () => fetchStatistics(params),
    placeholderData: keepPreviousData,
  })

  const currentStart = periodStartIso(period, todayIso())
  const isCurrentPeriod = periodStart >= currentStart

  function changePeriod(nextPeriod) {
    setPeriod(nextPeriod)
    setPeriodStart(periodStartIso(nextPeriod, todayIso()))
  }

  const stats = statsQuery.data
  const summary = summaryQuery.data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Statistika" subtitle="Qachon, nimaga va qancha pul ketgani" />

      {children.length > 1 && <ChildPicker childOptions={children} value={scopeChildId} onChange={setChildId} />}

      {summaryQuery.isError ? (
        <ErrorState error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <SummaryTile compact label="Bugun" value={formatMoney(summary?.today.total)} loading={!summary} />
          <SummaryTile compact label="Shu hafta" value={formatMoney(summary?.week.total)} loading={!summary} />
          <SummaryTile compact label="Shu oy" value={formatMoney(summary?.month.total)} loading={!summary} />
        </div>
      )}

      <section className="flex flex-col gap-5 rounded-3xl border-2 border-line p-4 sm:p-6" aria-labelledby="period-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="Davr turi" className="grid grid-cols-3 gap-2 sm:flex">
            {PERIODS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => changePeriod(option.value)}
                aria-pressed={period === option.value}
                className={
                  period === option.value
                    ? 'min-h-11 rounded-full border-2 border-forest bg-forest px-5 text-base font-bold text-white'
                    : 'min-h-11 rounded-full border-2 border-line bg-card px-5 text-base font-semibold text-ink-soft transition-colors hover:bg-paper'
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <IconButton
              label={PREVIOUS_LABEL[period]}
              icon={ChevronLeft}
              onClick={() => setPeriodStart((start) => shiftPeriodStartIso(period, start, -1))}
              className="border-2 border-line"
            />
            <h2 id="period-title" className="min-w-40 text-center font-serif text-xl font-semibold text-ink" aria-live="polite">
              {stats ? formatPeriodLabel(period, stats.period.from, stats.period.to) : '…'}
            </h2>
            <IconButton
              label={NEXT_LABEL[period]}
              icon={ChevronRight}
              onClick={() => setPeriodStart((start) => shiftPeriodStartIso(period, start, 1))}
              disabled={isCurrentPeriod}
              className="border-2 border-line"
            />
          </div>
        </div>

        {statsQuery.isPending ? (
          <LoadingState />
        ) : statsQuery.isError ? (
          <ErrorState error={statsQuery.error} onRetry={() => statsQuery.refetch()} />
        ) : (
          <div className={`flex flex-col gap-6 ${statsQuery.isPlaceholderData ? 'opacity-60' : ''}`}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SummaryTile label="Davr bo'yicha jami" value={formatMoney(stats.totals.grandTotal)} />
              <SummaryTile
                label="Eng katta xarajat"
                value={stats.topExpense ? formatMoney(stats.topExpense.amount) : "Yo'q"}
                sub={stats.topExpense ? `${stats.topExpense.label} · ${formatDayLabel(stats.topExpense.date)}` : undefined}
                type={stats.topExpense?.type}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-ink">Xarajat dinamikasi</h3>
              <TrendChart trend={stats.trend} granularity={stats.period.granularity} />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-ink">Pul qayerga ketdi</h3>
              <CategoryBreakdown
                categories={stats.byCategory}
                total={stats.totals.grandTotal}
                emptyState={<EmptyState>Bu davrda xarajat yozilmagan.</EmptyState>}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

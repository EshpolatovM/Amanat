import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney, formatMoneyCompact } from '../../lib/money'
import { formatDayLabel, formatShortDay, formatShortMonth } from '../../lib/date'
import { EXPENSE_TYPE_STYLES } from '../dashboard/expenseTypeStyles'

// Kunlik/oylik jamlar — diskret qiymatlar, shuning uchun silliq egri chiziq
// emas, ustunlar (egri chiziq xarajat bo'lmagan kunlarda ham "o'sish" chizardi).
// Ustun turlar bo'yicha qatlamlangan; ranglar dataviz validatoridan o'tgan
// (expenseTypeStyles.chart), ustun ≤ 24px, tepasi 4px yumaloq, grid 1px tekis.
const GRID_COLOR = '#E3D6C3'
const AXIS_TEXT = '#6B5E4F'
const SURFACE = '#FCFAF4'
const TYPES = ['planned', 'recurring', 'unplanned']

const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

function bucketLabels(bucket, granularity) {
  if (granularity === 'month') {
    const [year, month] = bucket.split('-').map(Number)
    return { axis: formatShortMonth(month - 1), full: `${UZ_MONTHS[month - 1]} ${year}` }
  }
  return { axis: formatShortDay(bucket), full: formatDayLabel(bucket) }
}

// Y o'qi uchun "yumaloq" qadamlar (1 / 2 / 2,5 / 5 × 10ⁿ) — 1,95 mln kabi
// qiymat "2 mln" deb yaxlitlanib, o'qni chalg'itmasligi uchun.
function niceScale(maxValue, targetTicks = 4) {
  const rawStep = maxValue / targetTicks
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const residual = rawStep / magnitude
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10
  const step = niceResidual * magnitude
  const max = Math.ceil(maxValue / step) * step
  const ticks = []
  for (let value = 0; value <= max + step / 2; value += step) ticks.push(value)
  return { max, ticks }
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="min-w-44 rounded-xl border-2 border-line bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-bold text-ink-soft">{item.fullLabel}</p>
      <p className="text-base font-bold text-ink">{formatMoney(item.total)}</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {TYPES.filter((type) => item[type] > 0).map((type) => (
          <li key={type} className="flex items-center justify-between gap-3 text-sm font-semibold text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_TYPE_STYLES[type].chart }} aria-hidden="true" />
              {EXPENSE_TYPE_STYLES[type].shortLabel}
            </span>
            {formatMoney(item.raw[type])}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TrendChart({ trend, granularity }) {
  const data = (trend ?? []).map((point) => {
    const labels = bucketLabels(point.bucket, granularity)
    return {
      label: labels.axis,
      fullLabel: labels.full,
      total: point.total,
      raw: { planned: point.planned, recurring: point.recurring, unplanned: point.unplanned },
      value: Number(point.total),
      planned: Number(point.planned),
      recurring: Number(point.recurring),
      unplanned: Number(point.unplanned),
    }
  })

  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0)

  if (maxValue === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border-2 border-dashed border-line p-4 text-center">
        <p className="text-base font-semibold text-ink-soft">Bu davrda xarajat yo'q — xarajat yozilgach, dinamika shu yerda ko'rinadi.</p>
      </div>
    )
  }

  const { max, ticks } = niceScale(maxValue)
  const presentTypes = TYPES.filter((type) => data.some((point) => point[type] > 0))
  const peak = data.reduce((best, point) => (point.value > best.value ? point : best), data[0])
  const tickInterval = data.length > 12 ? Math.ceil(data.length / 7) - 1 : 0

  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-72 sm:h-80"
        role="img"
        aria-label={`Xarajat dinamikasi diagrammasi. Eng ko'p: ${peak.fullLabel}, ${formatMoney(peak.total)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, bottom: 4, left: 0 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeWidth={1} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
              tick={{ fill: AXIS_TEXT, fontSize: 13, fontWeight: 600 }}
              interval={tickInterval}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: AXIS_TEXT, fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value) => formatMoneyCompact(value, { suffix: '' })}
              domain={[0, max]}
              ticks={ticks}
              width={64}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F3E9DA' }} />
            {presentTypes.map((type, index) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="total"
                fill={EXPENSE_TYPE_STYLES[type].chart}
                stroke={SURFACE}
                strokeWidth={index > 0 ? 1 : 0}
                maxBarSize={24}
                radius={index === presentTypes.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {presentTypes.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Ranglar ma'nosi">
          {presentTypes.map((type) => (
            <li key={type} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_TYPE_STYLES[type].chart }} aria-hidden="true" />
              {EXPENSE_TYPE_STYLES[type].label}
            </li>
          ))}
        </ul>
      )}

      <details className="rounded-2xl border-2 border-line">
        <summary className="flex min-h-11 items-center px-4 text-base font-bold text-forest">Jadval ko'rinishida</summary>
        <table className="w-full border-t-2 border-line text-left">
          <thead>
            <tr className="text-sm font-bold text-ink-soft">
              <th scope="col" className="px-4 py-2">
                {granularity === 'month' ? 'Oy' : 'Kun'}
              </th>
              <th scope="col" className="px-4 py-2 text-right">
                Summa
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-line">
            {data
              .filter((point) => point.value > 0)
              .map((point) => (
                <tr key={point.fullLabel} className="text-base font-semibold text-ink">
                  <td className="px-4 py-2">{point.fullLabel}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatMoney(point.total)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

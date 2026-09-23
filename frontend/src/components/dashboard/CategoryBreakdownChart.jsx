import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { formatMoney, formatMoneyCompact } from '../../lib/money'

// dataviz skill: ranglar node scripts/validate_palette.js orqali CVD-xavfsizlik
// uchun tekshirilgan (forest/bronze/alert oilasi — barcha 6 tekshiruv PASS, ΔE 8.8 protan, 15.5 normal).
const SEGMENTS = [
  { key: 'planned', totalKey: 'plannedTotal', label: 'Maqsadli', color: '#1c7c53' },
  { key: 'recurring', totalKey: 'recurringTotal', label: 'Kundalik', color: '#c68039' },
  { key: 'unplanned', totalKey: 'unplannedTotal', label: 'Kutilmagan', color: '#A44A3F' },
]

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-xl border-2 border-line bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-bold text-ink">{item.label} xarajat</p>
      <p className="text-base font-bold" style={{ color: item.color }}>
        {formatMoney(item.value)}
      </p>
    </div>
  )
}

export default function CategoryBreakdownChart({ totals }) {
  const data = SEGMENTS.map((segment) => ({
    key: segment.key,
    label: segment.label,
    value: Number(totals[segment.totalKey]),
    color: segment.color,
  }))
  const hasData = data.some((entry) => entry.value > 0)

  return (
    <div className="rounded-3xl border-2 border-line bg-card p-4 sm:p-6">
      <p className="text-lg font-bold text-ink">Xarajatlar taqsimoti</p>

      {!hasData ? (
        <div className="flex h-72 items-center justify-center sm:h-80">
          <p className="text-base font-semibold text-ink-soft">
            Xarajat kiritilgach, diagramma shu yerda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 36, right: 8, bottom: 8, left: 8 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="#E3D6C3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#E3D6C3' }}
                tick={{ fill: '#6B5E4F', fontSize: 15, fontWeight: 600 }}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F7F3EC' }} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={110}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={10}
                  formatter={(value) => formatMoneyCompact(value)}
                  style={{ fill: '#2B2620', fontWeight: 700, fontSize: 13 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

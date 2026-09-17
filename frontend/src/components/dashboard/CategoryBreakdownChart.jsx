import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { formatMoney, formatMoneyCompact } from '../../lib/money'

// dataviz skill: ranglar node scripts/validate_palette.js orqali CVD-xavfsizlik
// uchun tekshirilgan (good/warning/critical status palette — ΔE 11.3 protan, 27.6 normal).
const SEGMENTS = [
  { key: 'planned', totalKey: 'plannedTotal', label: 'Maqsadli', color: '#0ca30c' },
  { key: 'recurring', totalKey: 'recurringTotal', label: 'Kundalik', color: '#fab219' },
  { key: 'unplanned', totalKey: 'unplannedTotal', label: 'Kutilmagan', color: '#d03b3b' },
]

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-bold text-slate-900">{item.label} xarajat</p>
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
    <div className="rounded-3xl border-2 border-slate-300 bg-white p-4 sm:p-6">
      <p className="text-lg font-bold text-slate-900">Xarajatlar taqsimoti</p>

      {!hasData ? (
        <div className="flex h-72 items-center justify-center sm:h-80">
          <p className="text-base font-semibold text-slate-700">
            Xarajat kiritilgach, diagramma shu yerda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 36, right: 8, bottom: 8, left: 8 }} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#334155', fontSize: 15, fontWeight: 600 }}
              />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={110}>
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={10}
                  formatter={(value) => formatMoneyCompact(value)}
                  style={{ fill: '#0F172A', fontWeight: 700, fontSize: 13 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

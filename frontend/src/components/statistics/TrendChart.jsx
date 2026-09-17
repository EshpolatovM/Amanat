import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney, formatMoneyCompact } from '../../lib/money'

// dataviz skill: mavjud CategoryBreakdownChart'dagi validatsiya qilingan yashil
// (#0ca30c) rang bilan bir xil — bitta seriya bo'lgani uchun legend shart emas.
const LINE_COLOR = '#0ca30c'

const UZ_MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

function formatBucketLabel(bucket, period) {
  if (period === 'year') {
    const month = Number(bucket.split('-')[1])
    return UZ_MONTHS_SHORT[month - 1]
  }
  const date = new Date(`${bucket}T00:00:00.000Z`)
  return `${date.getUTCDate()} ${UZ_MONTHS_SHORT[date.getUTCMonth()]}`
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-bold text-slate-900">{item.label}</p>
      <p className="text-base font-bold" style={{ color: LINE_COLOR }}>
        {formatMoney(item.value)}
      </p>
    </div>
  )
}

export default function TrendChart({ trend, period }) {
  const data = (trend ?? []).map((point) => ({
    label: formatBucketLabel(point.bucket, period),
    value: Number(point.total),
  }))
  const hasData = data.some((point) => point.value > 0)
  const tickInterval = Math.max(0, Math.floor(data.length / 6))

  return (
    <div className="rounded-3xl border-2 border-slate-300 bg-white p-4 sm:p-6">
      {!hasData ? (
        <div className="flex h-80 items-center justify-center sm:h-96">
          <p className="text-base font-semibold text-slate-700">
            Xarajat kiritilgach, diagramma shu yerda ko'rinadi.
          </p>
        </div>
      ) : (
        <div className="h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }}
                interval={tickInterval}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => formatMoneyCompact(value, { suffix: '' }).trim()}
                width={52}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: LINE_COLOR, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={LINE_COLOR}
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={false}
                activeDot={{ r: 5, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

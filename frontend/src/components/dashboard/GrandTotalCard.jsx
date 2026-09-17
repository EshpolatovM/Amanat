import { formatMoney } from '../../lib/money'
import { formatMonthLabel } from '../../lib/date'

export default function GrandTotalCard({ amount, periodFrom, variant = 'parent' }) {
  const rounded = variant === 'child' ? 'rounded-[2rem]' : 'rounded-3xl'

  return (
    <div className={`${rounded} bg-green-600 p-6 text-white shadow-lg`}>
      <p className="text-base font-semibold text-green-50">{formatMonthLabel(periodFrom)} — jami xarajat</p>
      <p className="mt-2 text-4xl font-bold">{formatMoney(amount)}</p>
    </div>
  )
}

import { formatMoney } from '../../lib/money'
import { formatMonthLabel } from '../../lib/date'

// Sahifaning bitta asosiy raqami (hero figure) — sans, katta. Raqam va "so'm"
// alohida: telefonda katta summa ham bir qatorga sig'adi va "so'm" so'z
// o'rtasidan uzilmaydi. Bola panelida bronza urg'u (CLAUDE.md §7, 4-prinsip).
export default function GrandTotalCard({ amount, periodFrom, variant = 'parent', label }) {
  const isChild = variant === 'child'

  return (
    <div className={isChild ? 'rounded-[2rem] bg-bronze-dark p-6 text-white shadow-lg' : 'rounded-3xl bg-forest p-6 text-white shadow-lg'}>
      <p className="text-base font-semibold text-white/90">{label ?? `${formatMonthLabel(periodFrom)} — jami xarajat`}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 font-bold">
        <span className="text-4xl whitespace-nowrap sm:text-5xl">{formatMoney(amount, { suffix: '' })}</span>
        <span className="text-xl sm:text-2xl">so'm</span>
      </p>
    </div>
  )
}

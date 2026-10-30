import { formatMoney, sharePercent } from '../../lib/money'
import { EXPENSE_TYPE_STYLES } from './expenseTypeStyles'

const MAX_ROWS = 6

// Kichik ulushli maqsadlar ko'p bo'lsa, "Boshqa maqsadlar" qatoriga yig'iladi
// (dataviz: 7 tadan ortiq rang/sinf o'qilmaydi).
function foldTail(categories) {
  if (categories.length <= MAX_ROWS + 1) return categories
  const head = categories.slice(0, MAX_ROWS)
  const tail = categories.slice(MAX_ROWS)
  const tailTotal = tail.reduce((acc, item) => acc + BigInt(item.total), 0n)
  return [...head, { category: `Boshqa ${tail.length} ta maqsad`, type: 'planned', goalId: 'other', total: tailTotal.toString() }]
}

// "Pul qayerga ketdi" — har bir maqsad, kundalik va kutilmagan xarajatlar
// ulushi. Gorizontal chiziqlar (daftar uslubi) — nomlar uzun bo'lsa ham
// telefonda o'qiladi; har qatorda summa va foiz matn bilan ham yozilgan,
// shuning uchun ma'lumot rangga bog'liq emas. Chiziq rangi — xarajat turi.
export default function CategoryBreakdown({ categories, total, size = 'md', emptyState }) {
  const rows = foldTail(categories ?? [])
  if (rows.length === 0) return emptyState ?? null

  const presentTypes = ['planned', 'recurring', 'unplanned'].filter((type) => rows.some((row) => row.type === type))
  const large = size === 'lg'

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {rows.map((row) => {
          const style = EXPENSE_TYPE_STYLES[row.type]
          const percent = sharePercent(row.total, total)
          return (
            <li key={`${row.type}-${row.goalId ?? row.category}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`min-w-0 truncate font-bold text-ink ${large ? 'text-lg' : 'text-base'}`}>{row.category}</span>
                <span className={`shrink-0 font-bold text-ink ${large ? 'text-lg' : 'text-base'}`}>
                  {formatMoney(row.total)}
                  <span className="ml-2 text-sm font-semibold text-ink-soft">{percent}%</span>
                </span>
              </div>
              <div className={`mt-1.5 w-full overflow-hidden rounded-full bg-line/60 ${large ? 'h-3' : 'h-2'}`} aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(percent, 2)}%`, backgroundColor: style.chart }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {presentTypes.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-line pt-3" aria-label="Ranglar ma'nosi">
          {presentTypes.map((type) => (
            <li key={type} className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_TYPE_STYLES[type].chart }} aria-hidden="true" />
              {EXPENSE_TYPE_STYLES[type].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

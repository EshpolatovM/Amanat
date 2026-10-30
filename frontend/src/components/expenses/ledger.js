import { formatMonthLabel, monthKey } from '../../lib/date'

// Yozuvlarni oylar bo'yicha guruhlaydi (ro'yxat allaqachon sana bo'yicha
// kamayish tartibida keladi) — har guruhda oy nomi va jami summa.
export function groupByMonth(items) {
  const groups = []
  const byKey = new Map()
  for (const item of items) {
    const key = monthKey(item.date)
    let group = byKey.get(key)
    if (!group) {
      group = { key, label: formatMonthLabel(item.date), total: 0n, items: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.total += BigInt(item.amount)
    group.items.push(item)
  }
  return groups
}

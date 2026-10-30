import { formatDayLabel } from '../../lib/date'

const DAY_SHORT = { 0: 'Yak', 1: 'Dush', 2: 'Sesh', 3: 'Chor', 4: 'Pay', 5: 'Juma', 6: 'Shan' }
const WORKDAYS = '1,2,3,4,5'
const EVERY_DAY = '0,1,2,3,4,5,6'

// "Har oy, 5-sanasi" / "Har kuni" / "Dushanba–juma" / "Har hafta: Dush, Chor"
export function describeSchedule(rule) {
  if (rule.frequency === 'monthly') return `Har oyning ${rule.dayOfMonth}-sanasi`
  const key = [...rule.daysOfWeek].sort((a, b) => a - b).join(',')
  if (key === EVERY_DAY) return 'Har kuni'
  if (key === WORKDAYS) return 'Dushanbadan jumagacha'
  const ordered = [1, 2, 3, 4, 5, 6, 0].filter((day) => rule.daysOfWeek.includes(day))
  return `Har hafta: ${ordered.map((day) => DAY_SHORT[day]).join(', ')}`
}

export function ruleStatus(rule, todayIso) {
  if (rule.endDate && rule.endDate.slice(0, 10) < todayIso) {
    return { key: 'ended', label: 'Tugagan' }
  }
  if (!rule.active) return { key: 'paused', label: "To'xtatilgan" }
  if (rule.nextDate) return { key: 'active', label: `Keyingisi: ${formatDayLabel(rule.nextDate)}` }
  return { key: 'active', label: 'Faol' }
}

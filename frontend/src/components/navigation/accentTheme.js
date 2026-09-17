// Ota-ona paneli navigatsiyasining asosiy urg'u rangi holatga qarab almashadi:
// 'good' — oylik xarajat holati normal (yashil), 'over' — limit/rejadan oshgan (qizil).
// Hozircha backend'dan real byudjet holati kelmagani uchun default 'good'.
const ACCENTS = {
  good: {
    text: 'text-green-600',
    activeBg: 'bg-green-50',
    activeBorder: 'border-green-500',
    indicator: 'bg-green-600',
    plusBg: 'bg-green-600',
    plusBorder: 'border-green-800',
  },
  over: {
    text: 'text-red-600',
    activeBg: 'bg-red-50',
    activeBorder: 'border-red-500',
    indicator: 'bg-red-600',
    plusBg: 'bg-red-600',
    plusBorder: 'border-red-800',
  },
}

export function getAccent(status = 'good') {
  return ACCENTS[status] ?? ACCENTS.good
}

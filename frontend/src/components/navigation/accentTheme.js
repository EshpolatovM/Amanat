// Ota-ona paneli navigatsiyasining asosiy urg'u rangi holatga qarab almashadi:
// 'good' — oylik xarajat holati normal (forest), 'over' — limit/rejadan oshgan (alert).
// Hozircha backend'dan real byudjet holati kelmagani uchun default 'good'.
const ACCENTS = {
  good: {
    text: 'text-forest',
    activeBg: 'bg-forest-soft',
    activeBorder: 'border-forest',
    indicator: 'bg-forest',
    plusBg: 'bg-forest',
    plusBorder: 'border-forest-dark',
  },
  over: {
    text: 'text-alert',
    activeBg: 'bg-alert-soft',
    activeBorder: 'border-alert',
    indicator: 'bg-alert',
    plusBg: 'bg-alert',
    plusBorder: 'border-alert-dark',
  },
}

export function getAccent(status = 'good') {
  return ACCENTS[status] ?? ACCENTS.good
}

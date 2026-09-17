const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

export function formatMonthLabel(isoDate) {
  const date = new Date(isoDate)
  return `${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDayLabel(isoDate) {
  const date = new Date(isoDate)
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]}`
}

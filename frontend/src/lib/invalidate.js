// Xarajat/maqsad/qoida o'zgarganda shu bolaga bog'liq BARCHA ko'rinishlar
// (ro'yxatlar, bosh sahifa, statistika) yangilanadi — aks holda masalan
// Statistika sahifasi eski jamlarni ko'rsatib turardi.
export function invalidateChildData(queryClient, childId) {
  const keys = [
    ['planned-expenses', childId],
    ['unplanned-expenses', childId],
    ['recurring-rules', childId],
    ['goals', childId],
    ['dashboard'],
    ['statistics'],
  ]
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

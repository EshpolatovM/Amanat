export function homePathFor(role) {
  return role === 'child' ? '/child' : '/'
}

// Kirishdan oldin so'ralgan sahifa shu rolga tegishli bo'lsagina unga qaytamiz
// (masalan bola ota-ona sahifasiga yo'naltirilib qolmasin).
export function postLoginPath(role, from) {
  if (!from || from === '/login') return homePathFor(role)
  const isChildArea = from === '/child' || from.startsWith('/child/')
  return (role === 'child') === isChildArea ? from : homePathFor(role)
}

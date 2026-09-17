export function isTabActive(pathname, to, exact = false) {
  if (exact) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

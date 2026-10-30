import { useCallback, useSyncExternalStore } from 'react'

// CSS media query holati — masalan desktop/mobil uchun faqat BITTA
// layout'ni render qilish (ikkalasini render qilib birini `hidden` qilish o'rniga).
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

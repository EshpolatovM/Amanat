import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Bo'limlar orasida o'tilganda sahifa yuqoridan ochilsin (aks holda oldingi
// sahifaning pastki qismida qolib ketardi).
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

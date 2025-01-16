import { useEffect } from 'react'

// Prevent body scroll when modal/sheet is open
export function useLockBody() {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
}

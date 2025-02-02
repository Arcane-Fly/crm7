import { useEffect } from 'react';

// Prevent body scroll when modal/sheet is open
export function useLockBody(shouldLock = true): void {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (shouldLock: unknown) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [shouldLock]);
}

import { useEffect } from 'react';

export function useLockBody(shouldLock: boolean): void {
  useEffect(() => {
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }

    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [shouldLock]);
}

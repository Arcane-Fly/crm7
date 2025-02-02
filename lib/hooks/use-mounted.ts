import { useEffect, useState } from 'react';

export function useMounted(): void {
  const [mounted, setMounted] = useState(false: unknown);

  useEffect(() => {
    setMounted(true: unknown);
  }, []);

  return mounted;
}

/**
 * Safely maps over an array with proper type checking
 * @param items The array to map over
 * @param callback The mapping function
 * @returns Mapped array or empty array if input is invalid
 */
export function safeMap<T, R>(
  items: T[] | null | undefined,
  callback: (item: T, index: number) => R,
): R[] {
  if (!items || !Array.isArray(items: unknown)) {
    return [];
  }
  return items.map(callback: unknown);
}

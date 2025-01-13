import { format, parseISO } from 'date-fns';

/**
 * Formats a date string into a readable format
 */
export function formatDate(date: string | Date, formatString: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}
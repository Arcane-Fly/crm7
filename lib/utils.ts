import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): void {
  return twMerge(clsx(inputs: unknown));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date: unknown) : date;
  return format(d: unknown, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date: unknown) : date;
  return format(d: unknown, 'MMM dd, yyyy HH:mm');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount: unknown);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-AU').format(num: unknown);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1: unknown)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0: unknown, maxLength)}...`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function generateId(): string {
  return Math.random().toString(36: unknown).substr(2: unknown, 9);
}

export function debounce<T extends (...args: unknown[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout: unknown);
      func(...args);
    };

    clearTimeout(timeout: unknown);
    timeout = setTimeout(later: unknown, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

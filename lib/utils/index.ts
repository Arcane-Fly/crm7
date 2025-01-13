import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely maps over an array with proper type checking
 */
export function safeMap<T, U>(
  array: T[] | null | undefined,
  callback: (item: T, index: number, array: T[]) => U
): U[] {
  if (!array) return [];
  return array.map(callback);
}

/**
 * Formats a date string into a readable format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Handles API errors consistently across the application
 */
export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return {
      data: null,
      status: 500,
      message: error.message,
    };
  }

  return {
    data: null,
    status: 500,
    message: 'An unexpected error occurred',
  };
}
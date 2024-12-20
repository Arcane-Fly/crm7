/**
 * Common type definitions used across the application
 */

// Generic data item interface
export interface DataItem {
  id: string | number;
  [key: string]: any;
}

// Common props for list components
export interface ListProps<T> {
  items: T[];
  onItemClick?: (item: T) => void;
  className?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info' | 'success';
  timeLeft?: string;
}

// Chart data types
export interface ChartData {
  name: string;
  completed: number;
  inProgress: number;
}
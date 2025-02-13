import { type Data } from '@measured/puck';
import type { Database } from './supabase';

export interface ExtendedPuckData extends Data {
  metadata?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface PageData {
  id: string;
  path: string;
  content: ExtendedPuckData;
  created_at: string;
  updated_at: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  content: Data;
  created_at: string;
  updated_at: string;
}

export interface EditorHistory {
  id: string;
  page_id: string;
  user_id: string;
  action: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export interface EditorAnalytics {
  id: string;
  page_id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

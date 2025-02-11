import { type PuckData } from '@measured/puck';
import { type Database } from './database';

export interface ComponentData {
  type: string;
  props: Record<string, unknown>;
  _requiredFields?: string[];
}

export interface ZoneData {
  [zoneName: string]: ComponentData[];
}

export interface ExtendedPuckData extends PuckData {
  zones: ZoneData;
  _lastHeadingLevel?: number;
  analytics?: EditorAnalytics;
  history?: EditorHistory[];
}

export type PageData = Database['public']['Tables']['pages']['Row'] & {
  content: ExtendedPuckData;
};

export type PageVersion = Database['public']['Tables']['page_versions']['Row'] & {
  content: ExtendedPuckData;
};

export type EditorAnalytics = Database['public']['Tables']['editor_analytics']['Row'] & {
  metadata: {
    componentCount: number;
    timestamp: string;
  };
};

export type EditorHistory = Database['public']['Tables']['editor_history']['Row'] & {
  id: string;
  page_id: string;
  user_email: string;
  action: string;
  created_at: string;
};

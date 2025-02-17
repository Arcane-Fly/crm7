import { type Config } from '@measured/puck';
import { type Database } from './supabase';

// Define your component props types
interface HeadingProps {
  level: '1' | '2' | '3' | '4' | '5' | '6';
  text: string;
}

interface TextProps {
  content: string;
}

// Define your Puck configuration type
export type PuckConfig = Config<{
  components: Record<string, unknown>;
  data: {
    id: string;
    title: string;
    slug: string;
  };
}>;

// Export helper types
export type PuckComponent = PuckConfig['components'];
export type ComponentProps<T extends keyof PuckComponent> = PuckComponent[T];

export interface PuckConfigData {
  id: string;
  name: string;
  description?: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PuckPlugin {
  id: string;
  name: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

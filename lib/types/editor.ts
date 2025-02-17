import type { Data as PuckData } from '@measured/puck';

export interface EditorData extends PuckData {
  id: string;
  metadata: Record<string, unknown>;
  version: number;
  root: any;
  path?: string;
  title?: string;
}

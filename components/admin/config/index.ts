import { type Config } from '@measured/puck';
import { components } from './components';
import { rootConfig } from './root';
import { categories } from './categories';
import { analyticsPlugin } from '@/components/admin/plugins/analytics';
import { historyPlugin } from '@/components/admin/plugins/history';
import { validationPlugin } from '@/components/admin/plugins/validation';

export interface ExtendedConfig extends Config {
  plugins: unknown[];
}

export const config: ExtendedConfig = {
  components,
  root: rootConfig,
  categories,
  plugins: [analyticsPlugin, historyPlugin, validationPlugin],
};

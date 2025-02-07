import { type Config } from '@measured/puck';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { type ReactNode } from 'react';
import { Hero, heroConfig } from './components/hero';
import { Stats, statsConfig } from './components/stats';

// Define your Puck components here
const components = {
  Hero: {
    component: Hero,
    ...heroConfig,
  },
  Stats: {
    component: Stats,
    ...statsConfig,
  },
};

export const config: Config = {
  components,
  // Wrap each component with error boundary for self-healing
  renderComponentWrapper: ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div className="p-4 bg-red-50 text-red-500">Component Error</div>}>
      {children}
    </ErrorBoundary>
  ),
};

// Export the type for your components
export type ComponentConfig = typeof components;

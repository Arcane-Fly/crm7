import { type Config } from '@measured/puck';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { type ReactNode } from 'react';
import { Hero, heroConfig } from './components/hero';
import { Stats, statsConfig } from './components/stats';
import { UserProfile } from '@/components/schema-aware/UserProfile';
import { type SchemaAwarePuckConfig } from '@/lib/types/schema-component';

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
  UserProfile: {
    ...UserProfile,
  },
};

export const config: SchemaAwarePuckConfig = {
  components,
  // Wrap each component with error boundary for self-healing
  renderComponentWrapper: ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div className="p-4 bg-destructive/10 text-destructive rounded-md">
      <h3 className="font-semibold">Component Error</h3>
      <p className="text-sm">An error occurred while rendering this component.</p>
    </div>}>
      {children}
    </ErrorBoundary>
  ),
};

// Export the type for your components
export type ComponentConfig = typeof components;

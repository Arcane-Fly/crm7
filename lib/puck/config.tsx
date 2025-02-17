import { type Config, type DefaultComponentProps } from '@measured/puck';
import { type ReactNode } from 'react';
import { Hero, heroConfig } from './components/hero';
import { Stats, statsConfig } from './components/stats';
import { UserProfile } from '@/components/schema-aware/UserProfile';
import { type SchemaAwarePuckConfig } from '@/lib/types/schema-component';

const components: SchemaAwarePuckConfig['components'] = {
  Hero: heroConfig,
  Stats: statsConfig,
  UserProfile: {
    ...UserProfile,
  },
};

export const config: SchemaAwarePuckConfig = {
  components,
};

export type ComponentConfig = typeof components;

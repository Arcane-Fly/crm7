'use client';

import { type ComponentConfig, type DefaultComponentProps } from '@measured/puck';

interface Stat {
  label: string;
  value: string;
  description?: string;
}

interface StatsProps extends DefaultComponentProps {
  title?: string;
  subtitle?: string;
  stats?: Stat[];
}

export function Stats({ title, subtitle, stats = [] }: StatsProps): JSX.Element {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 text-lg leading-8 text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="mx-auto mt-16 flex flex-col gap-8 sm:mt-20 lg:mx-0 lg:flex-row">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-gray-50 p-8 sm:flex-row-reverse sm:items-end lg:w-full lg:max-w-sm lg:flex-auto lg:flex-col lg:items-start lg:gap-y-44">
              <p className="flex-none text-3xl font-bold tracking-tight text-gray-900">
                {stat.value}
              </p>
              <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
                <p className="text-lg font-semibold tracking-tight text-gray-900">{stat.label}</p>
                {stat.description && (
                  <p className="mt-2 text-base leading-7 text-gray-600">{stat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const statsConfig: ComponentConfig<StatsProps> = {
  render: Stats,
  fields: {
    title: { type: 'text', label: 'Title' },
    subtitle: { type: 'textarea', label: 'Subtitle' },
    stats: {
      type: 'array',
      label: 'Stats',
      arrayFields: {
        label: { type: 'text', label: 'Label' },
        value: { type: 'text', label: 'Value' },
        description: { type: 'textarea', label: 'Description' },
      },
    },
  },
};

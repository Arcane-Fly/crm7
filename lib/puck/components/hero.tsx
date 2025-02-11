'use client';

import { type ComponentConfig } from '@measured/puck';

interface HeroProps {
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function Hero({ title, description, ctaText, ctaLink }: HeroProps) {
  return (
    <div className="px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-6 text-lg leading-8 text-gray-600">
          {description}
        </p>
      )}
      {ctaText && ctaLink && (
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href={ctaLink}
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
}

export const heroConfig: ComponentConfig = {
  fields: {
    title: { type: 'text', label: 'Title', required: true },
    description: { type: 'textarea', label: 'Description' },
    ctaText: { type: 'text', label: 'CTA Text' },
    ctaLink: { type: 'text', label: 'CTA Link' },
  },
};

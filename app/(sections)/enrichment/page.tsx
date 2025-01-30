import type { Metadata } from 'next';

import { EnrichmentClient } from './enrichment-client';

export const metadata: Metadata = {
  title: 'Data Enrichment',
  description: 'Enrich your data with external sources',
};

export default function EnrichmentPage() {
  return <EnrichmentClient />;
}

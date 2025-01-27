import { type NextApiRequest, type NextApiResponse } from 'next';

import { logger } from '@/lib/logger';
import { chargeCalculationService } from '@/lib/services/charge-calculation/charge-calculation-service';
import type { RateTemplate } from '@/lib/types/rates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { template, hours } = req.body;

    if (!template || !hours) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await chargeCalculationService.calculateChargeRate(
      template as RateTemplate,
      Number(hours),
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error calculating charge rate', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

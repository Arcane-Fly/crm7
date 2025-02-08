import { NextApiRequest, NextApiResponse } from 'next';
import { FairWorkService } from '@/lib/fairwork';

const fairWorkService = new FairWorkService();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { awardCode, classificationCode } = req.query;

  if (typeof awardCode !== 'string' || typeof classificationCode !== 'string') {
    res.status(400).json({ error: 'Invalid award or classification code' });
    return;
  }

  try {
    const classification = await fairWorkService.getClassification(awardCode, classificationCode);
    res.status(200).json(classification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classification' });
  }
}

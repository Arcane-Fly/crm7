import { NextApiRequest, NextApiResponse } from 'next';
import { getClassificationDetails } from '@/lib/services/fairwork/fairwork.client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { awardCode, classificationCode } = req.query;

  if (req.method === 'GET') {
    try {
      const classificationDetails = await getClassificationDetails(awardCode as string, classificationCode as string);
      res.status(200).json(classificationDetails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch classification details' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
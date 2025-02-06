import { FairWorkClient } from './fairwork-client';
import { Allowance } from './types';

export async function getAllowances(awardCode: string, classificationCode: string): Promise<Allowance[]> {
  const client = new FairWorkClient();
  return client.getAllowances(awardCode, { classificationCode });
}

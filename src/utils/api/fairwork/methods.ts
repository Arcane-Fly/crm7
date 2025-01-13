import { FairWorkAPI } from './client';
import type { Award, Classification } from './types';

// Create API instances
const fairworkAPI = new FairWorkAPI({
  apiKey: process.env.FAIRWORK_API_KEY_1,
});

const backupAPI = new FairWorkAPI({
  apiKey: process.env.FAIRWORK_API_KEY_2,
});

export async function searchAward(query: string) {
  try {
    const { data } = await fairworkAPI.request<Award[]>('/awards/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return data;
  } catch (error) {
    console.warn('Primary API failed, trying backup');
    const { data } = await backupAPI.request<Award[]>('/awards/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return data;
  }
}

export async function getAwardDetails(awardId: string) {
  try {
    const { data } = await fairworkAPI.request<Award>(`/awards/${awardId}`);
    return data;
  } catch (error) {
    console.warn('Primary API failed, trying backup');
    const { data } = await backupAPI.request<Award>(`/awards/${awardId}`);
    return data;
  }
}

export async function getClassifications(awardId: string) {
  try {
    const { data } = await fairworkAPI.request<Classification[]>(`/awards/${awardId}/classifications`);
    return data;
  } catch (error) {
    console.warn('Primary API failed, trying backup');
    const { data } = await backupAPI.request<Classification[]>(`/awards/${awardId}/classifications`);
    return data;
  }
}

export async function getPayRates(classificationId: string) {
  try {
    const { data } = await fairworkAPI.request<Array<{
      id: string;
      rate: number;
      type: string;
      effective_from: string;
      effective_to?: string;
    }>>(`/classifications/${classificationId}/pay-rates`);
    return data;
  } catch (error) {
    console.warn('Primary API failed, trying backup');
    const { data } = await backupAPI.request<Array<{
      id: string;
      rate: number;
      type: string;
      effective_from: string;
      effective_to?: string;
    }>>(`/classifications/${classificationId}/pay-rates`);
    return data;
  }
}
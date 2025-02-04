import axios, { type AxiosInstance } from 'axios';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import type { 
  Allowance, 
  Rate, 
  Classification, 
  LeaveEntitlement,
  RateValidationRequest,
  RateValidationResponse 
} from './types';

// ... existing config schema and constructor ...

export class FairWorkClient {
  // ... existing code ...

  async getRates(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<void> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}/rates`, {
        params,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getFutureRates(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<void> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}/future-rates`, {
        params,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getRateHistory(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<void> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}/history`, {
        params,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getLeaveEntitlements(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<void> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}/leave-entitlements`, {
        params,
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getClassification(
    awardCode: string,
    classificationCode: string
  ): Promise<void> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async validateRate(
    awardCode: string,
    classificationCode: string,
    request: RateValidationRequest
  ): Promise<void> {
    try {
      const response = await this.client.post(
        `/awards/${awardCode}/classifications/${classificationCode}/validate`,
        request
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export class FairWorkApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FairWorkApiError';
  }
}

export interface LeaveEntitlement {
  type: string;
  amount: number;
  unit: string;
  description?: string;
}

export class FairWorkClient {
  constructor(private baseUrl: string = process.env.FAIRWORK_API_URL || '') {}

  async getLeaveEntitlements(
    awardCode: string,
    classificationCode: string
  ): Promise<LeaveEntitlement[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/awards/${awardCode}/classifications/${classificationCode}/leave-entitlements`
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to fetch leave entitlements', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to fetch leave entitlements', 500, { error });
    }
  }

  async validatePayRate(
    awardCode: string,
    classificationCode: string,
    rate: number
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/awards/${awardCode}/classifications/${classificationCode}/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rate }),
        }
      );

      if (!response.ok) {
        throw new FairWorkApiError('Failed to validate pay rate', response.status);
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        throw error;
      }
      throw new FairWorkApiError('Failed to validate pay rate', 500, { error });
    }
  }
}

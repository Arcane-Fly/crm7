import { type NextApiRequest, type NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createLogger } from '@/lib/services/logger';
import { RateManagementServiceImpl } from '@/lib/services/rates/rate-management-service';
import { FairWorkService } from '@/lib/services/fairwork';
import { logger } from '@/lib/logger';

import type { ApiResponse } from '@/lib/types/api';
import type { RateTemplate, RateCalculationResult } from '@/lib/types/rates';

export const config = {
  runtime: 'edge',
};

const loggerInstance = createLogger('RateCalculationAPI');

const fairworkService = new FairWorkService(
  process.env.RATE_SERVICE_URL ?? 'http://localhost:4000',
  process.env.RATE_SERVICE_KEY ?? ''
);

const calculateRequestBodySchema = z.object({
  orgId: z.string(),
  name: z.string(),
  templateType: z.string(),
  baseRate: z.number().positive(),
  baseMargin: z.number().positive(),
  superRate: z.number().positive(),
  effectiveFrom: z.string(),
  awardCode: z.string().optional(),
  classificationCode: z.string().optional(),
  hours: z.number().positive(),
  date: z.string(),
});

const rateService = new RateManagementServiceImpl({
  baseUrl: process.env.RATE_SERVICE_URL ?? 'http://localhost:4000',
  apiKey: process.env.RATE_SERVICE_KEY ?? '',
});

async function getCookie(name: string): Promise<string | undefined> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

/**
 * POST /api/rates/calculate
 * Calculates rates based on template and parameters
 */
export default async function handler(req: NextApiRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookie = await getCookie(name);
          return cookie ?? null;
        },
        set: () => {}, // Not needed for API routes
        remove: () => {}, // Not needed for API routes
      },
    }
  );

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedBody = calculateRequestBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return new NextResponse(
        JSON.stringify({
          error: parsedBody.error.issues.map((issue) => issue.message).join(', '),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = parsedBody.data;

    const template: Partial<RateTemplate> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validationResult = await rateService.validateRateTemplate(template as RateTemplate);

    if (!validationResult.isValid) {
      return new NextResponse(
        JSON.stringify({
          error: validationResult.errors?.join(', ') ?? 'Invalid rate template',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await rateService.calculateRate(template as RateTemplate);

    return new NextResponse(
      JSON.stringify({
        data: result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    loggerInstance.error('Failed to calculate rate', {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : 'Unknown error',
    });
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

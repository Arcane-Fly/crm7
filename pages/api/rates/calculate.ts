import { type NextApiRequest, type NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createLogger } from '@/lib/services/logger';
import { RateManagementServiceImpl } from '@/lib/services/rates/rate-management-service';

import type { ApiResponse } from '@/lib/types/api';
import type { RateTemplate, RateCalculationResponse } from '@/lib/types/rates';

export const config = {
  runtime: 'edge',
};

const logger = createLogger('RateCalculationAPI');

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

/**
 * POST /api/rates/calculate
 * Calculates rates based on template and parameters
 */
export default async function handler(req: NextApiRequest): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create Supabase client
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedBody = calculateRequestBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return new Response(
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

    const template: RateTemplate = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validationResult = await rateService.validateRateTemplate(template);

    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({
          error: validationResult.error ?? 'Invalid rate template',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await rateService.calculateRate(template);

    return new Response(
      JSON.stringify({
        data: result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    logger.error('Failed to calculate rate', { error });
    return new Response(
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

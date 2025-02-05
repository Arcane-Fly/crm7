import { type NextRequest } from 'next/server';
import { z } from 'zod';

interface ApiHandlerConfig<T> {
  schema: z.Schema<T>;
  handler: (data: T, params: Record<string, string>) => Promise<unknown>;
}

export function createApiHandler<T>(config: ApiHandlerConfig<T>): Promise<void> {
  return async (req: NextRequest, { params }: { params: Record<string, string> }): Promise<Response> => {
    try {
      const jsonData = await req.json();
      const parsedData = config.schema.parse(jsonData);
      const result = await config.handler(parsedData, params);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(JSON.stringify({ error: error.issues }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

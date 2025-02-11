import { type NextRequest, type NextResponse } from 'next/server';

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type RouteHandler<T = unknown, P extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: { params: P }
) => Promise<NextResponse<ApiResponse<T>>>;

export type RouteConfig<T = unknown, P extends Record<string, string> = Record<string, string>> = {
  GET?: RouteHandler<T, P>;
  POST?: RouteHandler<T, P>;
  PUT?: RouteHandler<T, P>;
  DELETE?: RouteHandler<T, P>;
  PATCH?: RouteHandler<T, P>;
};

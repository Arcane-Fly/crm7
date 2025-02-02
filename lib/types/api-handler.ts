// Core
import type { NextRequest, NextResponse } from 'next/server';

// Types
import type { ApiResponse } from './api';

export type HandlerFunction<T> = (
  req: NextRequest,
  context: HandlerContext<{ awardCode: string }>,
) => Promise<NextResponse<ApiResponse<T>>>;

export type HandlerContext<T extends Record<string, string>> = {
  params: T;
};

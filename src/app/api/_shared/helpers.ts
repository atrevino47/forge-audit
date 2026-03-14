import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { AuthError } from '@/lib/auth/guards';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Standard error response builder.
 */
export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
      },
    },
    { status }
  );
}

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the validated data or throws a NextResponse error.
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw errorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
  }

  try {
    return schema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw errorResponse('INVALID_INPUT', 'Validation failed', 400, err.issues);
    }
    throw err;
  }
}

/**
 * Parse URL search params against a Zod schema.
 */
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof ZodError) {
      throw errorResponse('INVALID_INPUT', 'Invalid query parameters', 400, err.issues);
    }
    throw err;
  }
}

/**
 * Wrap an API handler with standard error handling.
 */
export function withErrorHandler(
  handler: (request: Request, context: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (request: Request, context: Record<string, unknown>): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof NextResponse) {
        return err;
      }
      if (err instanceof AuthError) {
        const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
        return errorResponse(err.code, err.message, status);
      }
      console.error('Unhandled API error:', err);
      return errorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        500
      );
    }
  };
}

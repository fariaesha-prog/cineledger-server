import { NextFunction, Request, Response } from 'express';
import { env } from '@config/env';
import { AppError } from '@utils/AppError';
import type { ApiErrorResponse } from '@app-types/index';

/**
 * Centralized error handler. Every route/controller should funnel
 * errors here via `next(error)` rather than handling them ad-hoc,
 * so error responses stay consistent across the whole API.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Something went wrong on the server';

  const response: ApiErrorResponse = {
    success: false,
    message,
  };

  if (env.NODE_ENV === 'development' && !isAppError) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json(response);
}

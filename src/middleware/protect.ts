import { NextFunction, Request, Response } from 'express';
import { AppError } from '@utils/AppError';
import { verifyAccessToken } from '@utils/jwt';
import { COOKIE_NAMES } from '@config/constants';

export function protect(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

  if (!token) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
 (req as Request & { userId?: string }).userId = payload.userId;
    next();
  } catch {
    next(new AppError('Invalid or expired session', 401));
  }
}
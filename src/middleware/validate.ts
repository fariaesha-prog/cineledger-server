import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@utils/AppError';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body ?? req.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(error.errors[0]?.message ?? 'Validation failed', 400));
        return;
      }
      next(error);
    }
  };
}
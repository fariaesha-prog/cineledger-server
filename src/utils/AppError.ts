/**
 * Custom error class for predictable, operational errors
 * (e.g. "not found", "unauthorized") as opposed to unexpected
 * programming errors/bugs. The central error handler middleware
 * uses `isOperational` to decide how much detail is safe to expose.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

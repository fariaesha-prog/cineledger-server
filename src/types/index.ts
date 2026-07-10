/**
 * Shared TypeScript types/interfaces used across the server.
 * As features are built (auth, movies, journal entries), their
 * feature-specific types can either live here or in colocated
 * `*.types.ts` files next to the relevant module.
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

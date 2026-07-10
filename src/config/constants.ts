/**
 * App-wide constants that aren't secrets and don't belong in .env.
 * Keeping them here (instead of scattered magic strings/numbers across
 * the codebase) makes future refactors and reviews much easier.
 */
export const API_PREFIX = '/api/v1';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'cineledger_access_token',
  REFRESH_TOKEN: 'cineledger_refresh_token',
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
} as const;

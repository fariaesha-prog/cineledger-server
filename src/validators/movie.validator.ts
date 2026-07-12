import { z } from 'zod';

export const getMoviesSchema = z.object({
  query: z.object({
    search: z.string().optional().default(''),
    genre: z.string().optional().default(''),
    year: z.string().optional().default(''),
    rating: z.string().optional().default(''),
    sortBy: z.string().optional().default('popularity'),
    page: z.coerce.number().int().min(1).optional().default(1),
  }),
});
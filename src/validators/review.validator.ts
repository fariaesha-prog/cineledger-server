import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    movieId: z.coerce.number(),
    rating: z.coerce.number().min(1).max(5),
    text: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000),
  }),
});
import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    movieId: z.coerce.number(),
    movieTitle: z.string().trim().min(1),
    moviePosterPath: z.string().trim().nullable().optional(),
    rating: z.coerce.number().min(1).max(5),
    text: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000),
    movieGenres: z.array(z.string()).optional().default([]),
movieDirector: z.string().optional().default('Unknown'),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().min(1).max(5),
    text: z.string().trim().min(10, 'Review must be at least 10 characters').max(2000),
  }),
});
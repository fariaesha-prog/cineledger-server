import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AppError } from '@utils/AppError';
import { createReview, getReviewsForMovie } from '@services/review.service';
import type { ApiSuccessResponse } from '@app-types/index';

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) throw new AppError('Not authenticated', 401);

  const { movieId, rating, text } = req.body;
  const review = await createReview(userId, movieId, rating, text);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  };
  res.status(201).json(response);
});

export const getMovieReviews = asyncHandler(async (req: Request, res: Response) => {
  const movieId = parseInt(req.params.movieId, 10);
  if (isNaN(movieId)) throw new AppError('Invalid movie ID', 400);

  const reviews = await getReviewsForMovie(movieId);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Reviews fetched successfully',
    data: { reviews },
  };
  res.status(200).json(response);
});
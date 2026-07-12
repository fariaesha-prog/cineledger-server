import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AppError } from '@utils/AppError';
import {
  createReview,
  getReviewsForMovie,
  getReviewsByUser,
  updateReview,
  deleteReview,
} from '@services/review.service';
import type { ApiSuccessResponse } from '@app-types/index';

function getUserId(req: Request): string {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) throw new AppError('Not authenticated', 401);
  return userId;
}

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { movieId, movieTitle, moviePosterPath, rating, text } = req.body;

  const review = await createReview({ userId, movieId, movieTitle, moviePosterPath, rating, text });

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

export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const reviews = await getReviewsByUser(userId);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Your reviews fetched successfully',
    data: { reviews },
  };
  res.status(200).json(response);
});

export const patchReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { rating, text } = req.body;

  const review = await updateReview(req.params.reviewId, userId, rating, text);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Review updated successfully',
    data: { review },
  };
  res.status(200).json(response);
});

export const deleteReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  await deleteReview(req.params.reviewId, userId);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Review deleted successfully',
    data: null,
  };
  res.status(200).json(response);
});
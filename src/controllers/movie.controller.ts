import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { fetchMovies, fetchTrendingMovies, fetchMovieDetails, fetchSimilarMovies} from '@services/movie.service';
import type { ApiSuccessResponse } from '@app-types/index';
import { AppError } from '@utils/AppError';
export const getSimilarMovies = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  if (isNaN(tmdbId)) throw new AppError('Invalid movie ID', 400);

  const movies = await fetchSimilarMovies(tmdbId, 4);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Similar movies fetched successfully',
    data: { movies },
  };
  res.status(200).json(response);
});
export const getMovies = asyncHandler(async (req: Request, res: Response) => {
  const { search, genre, year, rating, sortBy, page } = req.query as Record<string, string>;

  const result = await fetchMovies({
    search: search ?? '',
    genre: genre ?? '',
    year: year ?? '',
    rating: rating ?? '',
    sortBy: sortBy ?? 'popularity',
    page: page ? parseInt(page, 10) : 1,
  });

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Movies fetched successfully',
    data: result,
  };
  res.status(200).json(response);
});
export const getTrendingMovies = asyncHandler(async (_req: Request, res: Response) => {
  const movies = await fetchTrendingMovies(4);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Trending movies fetched successfully',
    data: { movies },
  };
  res.status(200).json(response);
});

export const getMovieDetails = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  if (isNaN(tmdbId)) {
    throw new AppError('Invalid movie ID', 400);
  }

  const result = await fetchMovieDetails(tmdbId);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Movie details fetched successfully',
    data: result,
  };
  res.status(200).json(response);
});
import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AppError } from '@utils/AppError';
import { User } from '@models/User.model';
import type { ApiSuccessResponse } from '@app-types/index';
import { fetchMoviesByIds } from '@services/movie.service';
async function updateList(
  userId: string,
  field: 'watchlist' | 'favorites',
  tmdbId: number,
  action: 'add' | 'remove'
) {
  const update =
    action === 'add' ? { $addToSet: { [field]: tmdbId } } : { $pull: { [field]: tmdbId } };

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw new AppError('User not found', 404);
  return user[field];
}
export const getWatchlistMovies = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId!;
  const user = await User.findById(userId);
  const movies = await fetchMoviesByIds(user?.watchlist ?? []);
  respond(res, 'Watchlist fetched', { movies });
});

export const getFavoriteMovies = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId!;
  const user = await User.findById(userId);
  const movies = await fetchMoviesByIds(user?.favorites ?? []);
  respond(res, 'Favorites fetched', { movies });
});
export const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  const userId = (req as Request & { userId?: string }).userId!;
  const watchlist = await updateList(userId, 'watchlist', tmdbId, 'add');
  respond(res, 'Added to watchlist', { watchlist });
});

export const removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  const userId = (req as Request & { userId?: string }).userId!;
  const watchlist = await updateList(userId, 'watchlist', tmdbId, 'remove');
  respond(res, 'Removed from watchlist', { watchlist });
});

export const addToFavorites = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  const userId = (req as Request & { userId?: string }).userId!;
  const favorites = await updateList(userId, 'favorites', tmdbId, 'add');
  respond(res, 'Added to favorites', { favorites });
});

export const removeFromFavorites = asyncHandler(async (req: Request, res: Response) => {
  const tmdbId = parseInt(req.params.tmdbId, 10);
  const userId = (req as Request & { userId?: string }).userId!;
  const favorites = await updateList(userId, 'favorites', tmdbId, 'remove');
  respond(res, 'Removed from favorites', { favorites });
});

function respond(res: Response, message: string, data: unknown) {
  const response: ApiSuccessResponse = { success: true, message, data };
  res.status(200).json(response);
}
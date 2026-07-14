import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AppError } from '@utils/AppError';
import { User } from '@models/User.model';
import { Review } from '@models/Review.model';
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
function getPersonality(reviewCount: number): { tier: string; description: string } {
  if (reviewCount >= 75) {
    return { tier: 'The Auteur', description: 'Top 5% of cinephiles on CineLedger' };
  }
  if (reviewCount >= 35) {
    return { tier: 'The Critic', description: 'Sharp eye for great films' };
  }
  if (reviewCount >= 15) {
    return { tier: 'The Cinephile', description: 'A true movie lover' };
  }
  if (reviewCount >= 5) {
    return { tier: 'The Casual Viewer', description: 'Building your watch history' };
  }
  return { tier: 'The Newcomer', description: 'Just getting started' };
}

export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId!;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const reviewCount = await Review.countDocuments({ userId });
  const personality = getPersonality(reviewCount);

  respond(res, 'Stats fetched', {
    stats: {
      filmsLogged: reviewCount,
      reviews: reviewCount,
      watchlist: user.watchlist.length,
      favorites: user.favorites.length,
    },
    personality,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId!;
  const { name, bio, favoriteGenre, avatarUrl, coverImageUrl } = req.body;

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (favoriteGenre !== undefined) update.favoriteGenre = favoriteGenre;
  if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
  if (coverImageUrl !== undefined) update.coverImageUrl = coverImageUrl;

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) throw new AppError('User not found', 404);

  respond(res, 'Profile updated', {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverImageUrl: user.coverImageUrl,
      bio: user.bio,
      favoriteGenre: user.favoriteGenre,
      watchlist: user.watchlist,
      favorites: user.favorites,
      createdAt: user.createdAt,
    },
  });
});
export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Current user fetched',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        coverImageUrl: user.coverImageUrl,
        bio: user.bio,
        favoriteGenre: user.favoriteGenre,
        watchlist: user.watchlist,
        favorites: user.favorites,
        createdAt: user.createdAt,
      },
    },
  };
  res.status(200).json(response);
});
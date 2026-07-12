import { Request, Response } from 'express';
import { asyncHandler } from '@utils/asyncHandler';
import { AppError } from '@utils/AppError';
import { env } from '@config/env';
import { COOKIE_NAMES } from '@config/constants';
import { registerUser, loginUser, getUserById } from '@services/auth.service';
import { verifyRefreshToken, signAccessToken } from '@utils/jwt';
import type { ApiSuccessResponse } from '@app-types/index';

const isProd = env.NODE_ENV === 'production';

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, accessCookieOptions);
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshCookieOptions);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Account created successfully',
    data: { user },
  };
  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, accessCookieOptions);
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshCookieOptions);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Logged in successfully',
    data: { user },
  };
  res.status(200).json(response);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Logged out successfully',
    data: null,
  };
  res.status(200).json(response);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const newAccessToken = signAccessToken({ userId: payload.userId });
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, accessCookieOptions);

  const response: ApiSuccessResponse = {
    success: true,
    message: 'Access token refreshed',
    data: null,
  };
  res.status(200).json(response);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await getUserById(userId);
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
        watchlist: user.watchlist,
        favorites: user.favorites,
      },
    },
  };
  res.status(200).json(response);
});
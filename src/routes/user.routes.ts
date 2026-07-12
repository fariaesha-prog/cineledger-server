import { Router } from 'express';
import { protect } from '@middleware/protect';
import {
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
} from '@controllers/user.controller';

const router = Router();

router.use(protect); // every route below requires auth

router.post('/watchlist/:tmdbId', addToWatchlist);
router.delete('/watchlist/:tmdbId', removeFromWatchlist);
router.post('/favorites/:tmdbId', addToFavorites);
router.delete('/favorites/:tmdbId', removeFromFavorites);

export default router;
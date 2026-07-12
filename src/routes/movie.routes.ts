import { Router } from 'express';
import { validate } from '@middleware/validate';
import { getMoviesSchema } from '@validators/movie.validator';
import { getMovies, getTrendingMovies, getMovieDetails, getSimilarMovies } from '@controllers/movie.controller';

const router = Router();
router.get('/trending', getTrendingMovies);
router.get('/', validate(getMoviesSchema), getMovies);
router.get('/:tmdbId/similar', getSimilarMovies);
router.get('/:tmdbId', getMovieDetails);

export default router;
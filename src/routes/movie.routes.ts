import { Router } from 'express';
import { validate } from '@middleware/validate';
import { getMoviesSchema } from '@validators/movie.validator';
import { getMovies, getTrendingMovies } from '@controllers/movie.controller';

const router = Router();
router.get('/trending', getTrendingMovies);
router.get('/', validate(getMoviesSchema), getMovies);

export default router;
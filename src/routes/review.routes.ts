import { Router } from 'express';
import { validate } from '@middleware/validate';
import { protect } from '@middleware/protect';
import { createReviewSchema } from '@validators/review.validator';
import { postReview, getMovieReviews } from '@controllers/review.controller';

const router = Router();

router.post('/', protect, validate(createReviewSchema), postReview);
router.get('/:movieId', getMovieReviews);

export default router;
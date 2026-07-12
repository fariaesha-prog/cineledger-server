import { Router } from 'express';
import { validate } from '@middleware/validate';
import { protect } from '@middleware/protect';
import { createReviewSchema, updateReviewSchema } from '@validators/review.validator';
import {
  postReview,
  getMovieReviews,
  getMyReviews,
  patchReview,
  deleteReviewHandler,
} from '@controllers/review.controller';

const router = Router();

router.post('/', protect, validate(createReviewSchema), postReview);
router.get('/me', protect, getMyReviews);
router.patch('/:reviewId', protect, validate(updateReviewSchema), patchReview);
router.delete('/:reviewId', protect, deleteReviewHandler);
router.get('/:movieId', getMovieReviews);

export default router;
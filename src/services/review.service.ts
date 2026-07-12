import { Review } from '@models/Review.model';

export async function createReview(userId: string, movieId: number, rating: number, text: string) {
  const review = await Review.create({ userId, movieId, rating, text });
  return review.populate('userId', 'name avatarUrl');
}

export async function getReviewsForMovie(movieId: number) {
  return Review.find({ movieId }).sort({ createdAt: -1 }).populate('userId', 'name avatarUrl');
}
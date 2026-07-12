import { Review } from '@models/Review.model';
import { AppError } from '@utils/AppError';

interface CreateReviewInput {
  userId: string;
  movieId: number;
  movieTitle: string;
  moviePosterPath?: string | null;
  rating: number;
  text: string;
}

export async function createReview(input: CreateReviewInput) {
  const review = await Review.create(input);
  return review.populate('userId', 'name avatarUrl');
}

export async function getReviewsForMovie(movieId: number) {
  return Review.find({ movieId }).sort({ createdAt: -1 }).populate('userId', 'name avatarUrl');
}

export async function getReviewsByUser(userId: string) {
  return Review.find({ userId }).sort({ createdAt: -1 });
}

export async function updateReview(reviewId: string, userId: string, rating: number, text: string) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (review.userId.toString() !== userId) throw new AppError('Not authorized to edit this review', 403);

  review.rating = rating;
  review.text = text;
  await review.save();
  return review;
}

export async function deleteReview(reviewId: string, userId: string) {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (review.userId.toString() !== userId) throw new AppError('Not authorized to delete this review', 403);

  await review.deleteOne();
}
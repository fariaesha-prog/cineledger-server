import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  movieId: number;
  userId: Types.ObjectId;
  rating: number;
  text: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    movieId: { type: Number, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
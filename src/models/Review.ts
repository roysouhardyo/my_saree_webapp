import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
  isHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isHelpful: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ createdAt: -1 });

// Compound index to ensure one review per user per product per order
ReviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
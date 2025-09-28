import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  vendorId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  categories: string[];
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  fabric: string;
  color: string;
  size: string;
  pattern: string;
  occasion: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  salePrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(this: IProduct, value: number) {
        return !value || value < this.price;
      },
      message: 'Sale price must be less than regular price',
    },
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  images: [{
    type: String,
    required: true,
  }],
  fabric: {
    type: String,
    required: true,
    enum: ['Cotton', 'Silk', 'Chiffon', 'Georgette', 'Crepe', 'Linen', 'Banarasi', 'Kanjivaram', 'Tussar', 'Other'],
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
    default: 'Free Size',
  },
  pattern: {
    type: String,
    required: true,
    enum: ['Solid', 'Printed', 'Embroidered', 'Woven', 'Block Print', 'Digital Print', 'Hand Painted', 'Other'],
  },
  occasion: {
    type: String,
    required: true,
    enum: ['Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Office', 'Traditional', 'Other'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ fabric: 1 });
ProductSchema.index({ occasion: 1 });

// Text search index
ProductSchema.index({
  title: 'text',
  description: 'text',
  categories: 'text',
  fabric: 'text',
  color: 'text',
  pattern: 'text',
  occasion: 'text',
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'customer' | 'vendor' | 'admin';
  provider: 'google' | 'credentials';
  googleId?: string;
  vendorProfile?: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    isApproved: boolean;
    approvedAt?: Date;
  };
  addresses: {
    type: 'home' | 'work' | 'other';
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  notifications?: {
    _id?: string;
    type: 'order_status' | 'order_cancelled' | 'order_confirmed' | 'order_shipped' | 'order_delivered';
    title: string;
    message: string;
    orderId: string;
    orderNumber: string;
    read: boolean;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.provider === 'credentials';
    },
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer',
  },
  provider: {
    type: String,
    enum: ['google', 'credentials'],
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  vendorProfile: {
    businessName: String,
    businessAddress: String,
    businessPhone: String,
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: Date,
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['order_status', 'order_cancelled', 'order_confirmed', 'order_shipped', 'order_delivered'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
export { User };
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approved = searchParams.get('approved') !== 'false';

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = { productId };
    if (approved) {
      query.isApproved = true;
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { productId, orderId, rating, comment } = await request.json();

    if (!productId || !orderId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, order ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findOne({
      _id: orderId,
      userId: session.user.id,
      status: 'delivered', // Only allow reviews for delivered orders
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not delivered' },
        { status: 404 }
      );
    }

    // Verify the product is in the order
    const orderItem = order.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Product not found in this order' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      productId,
      userId: session.user.id,
      orderId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this product and order' },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      productId,
      userId: session.user.id,
      orderId,
      rating,
      comment: comment.trim(),
      isApproved: false, // Reviews need admin approval
    });

    // Update product rating and review count
    const reviews = await Review.find({ productId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + rating;
    const reviewCount = reviews.length + 1;
    const averageRating = totalRating / reviewCount;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewsCount: reviewCount,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    return NextResponse.json(populatedReview, { status: 201 });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
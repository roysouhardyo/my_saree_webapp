import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const approved = searchParams.get('approved');

    // Build query
    const query: any = {};
    if (approved !== null) {
      query.isApproved = approved === 'true';
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name email')
        .populate('productId', 'title slug')
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
    console.error('Admin reviews GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { reviewId, action } = await request.json();

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Review ID and action are required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    let update: any = {};

    if (action === 'approve') {
      update.isApproved = true;
    } else if (action === 'reject') {
      update.isApproved = false;
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      update,
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('productId', 'title slug');

    // Recalculate product rating
    const approvedReviews = await Review.find({
      productId: review.productId,
      isApproved: true,
    });

    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / approvedReviews.length;

      await Product.findByIdAndUpdate(review.productId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: approvedReviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(review.productId, {
        rating: 0,
        reviewsCount: 0,
      });
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Admin reviews PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    const approvedReviews = await Review.find({
      productId: review.productId,
      isApproved: true,
    });

    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / approvedReviews.length;

      await Product.findByIdAndUpdate(review.productId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewsCount: approvedReviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(review.productId, {
        rating: 0,
        reviewsCount: 0,
      });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Admin reviews DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { id } = await params;

    let query: Record<string, unknown> = { _id: id };

    // Apply role-based filtering
    if (session.user.role === 'customer') {
      query.userId = session.user.id;
    } else if (session.user.role === 'vendor') {
      query['items.vendorId'] = session.user.id;
    }
    // Admin can access any order

    const order = await Order.findOne(query)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images slug')
      .populate('items.vendorId', 'name vendorProfile.businessName');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData = await request.json();

    // Role-based update permissions
    if (session.user.role === 'customer') {
      // Customers can only cancel pending orders
      if (updateData.status && updateData.status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Customers can only cancel orders' },
          { status: 403 }
        );
      }
      if (order.status !== 'pending') {
        return NextResponse.json(
          { error: 'Can only cancel pending orders' },
          { status: 400 }
        );
      }
      if (order.userId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Restore stock when cancelling
      if (updateData.status === 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }
        updateData.cancelReason = updateData.cancelReason || 'Cancelled by customer';
      }
    } else if (session.user.role === 'vendor') {
      // Vendors can update orders containing their products
      const hasVendorItems = order.items.some(
        (item: any) => item.vendorId.toString() === session.user.id
      );
      if (!hasVendorItems) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Vendors can update status and tracking
      const allowedUpdates = ['status', 'trackingNumber', 'notes'];
      const updateKeys = Object.keys(updateData);
      const hasInvalidUpdate = updateKeys.some(key => !allowedUpdates.includes(key));
      if (hasInvalidUpdate) {
        return NextResponse.json(
          { error: 'Invalid update fields for vendor' },
          { status: 400 }
        );
      }

      // Set delivered date when status changes to delivered
      if (updateData.status === 'delivered') {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = 'paid';
      }
    }
    // Admin can update anything

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('items.productId', 'title images slug')
      .populate('items.vendorId', 'name vendorProfile.businessName');

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
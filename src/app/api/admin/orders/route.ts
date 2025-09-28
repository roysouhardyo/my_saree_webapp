import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Order, { IOrderItem } from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    await connectDB();

    // Fetch all orders with user information
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to include user information
    const transformedOrders = orders.map((order) => ({
      _id: (order._id as mongoose.Types.ObjectId).toString(),
      userId: (order.userId as { _id: mongoose.Types.ObjectId; name: string; email: string })._id.toString(),
      userName: (order.userId as { _id: mongoose.Types.ObjectId; name: string; email: string }).name,
      userEmail: (order.userId as { _id: mongoose.Types.ObjectId; name: string; email: string }).email,
      items: (order.items as IOrderItem[]).map((item) => ({
        productId: item.productId.toString(),
        productName: item.title,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      status: order.status,
      createdAt: (order.createdAt as Date).toISOString(),
      updatedAt: (order.updatedAt as Date).toISOString()
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
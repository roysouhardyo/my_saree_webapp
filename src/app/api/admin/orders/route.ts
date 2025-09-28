import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Order, { IOrder } from '@/models/Order';
import User from '@/models/User';

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
    const transformedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      userId: order.userId._id.toString(),
      userName: order.userId.name,
      userEmail: order.userId.email,
      items: order.items.map((item: any) => ({
        productId: item.productId.toString(),
        productName: item.title,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
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
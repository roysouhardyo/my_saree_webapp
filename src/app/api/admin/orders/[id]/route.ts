import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import Order, { IOrder } from '@/models/Order';
import Product from '@/models/Product';
import { createOrderNotification } from '@/lib/notifications';
import { Document } from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { status } = await request.json();
    const { id: orderId } = await params;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    // If cancelling an order, return items to inventory
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    // If confirming a previously cancelled order, deduct from inventory again
    if (status === 'confirmed' && previousStatus === 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.title} not found` },
            { status: 404 }
          );
        }

        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.title}. Available: ${product.stock}, Required: ${item.quantity}` },
            { status: 400 }
          );
        }

        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email');

    // Create notification for status change
    if (updatedOrder && previousStatus !== status) {
      await createOrderNotification(
        updatedOrder.userId._id.toString(),
        updatedOrder._id.toString(),
        updatedOrder.orderNumber,
        status
      );
    }

    // Transform the response
    const transformedOrder = {
      _id: updatedOrder._id.toString(),
      userId: updatedOrder.userId._id.toString(),
      userName: updatedOrder.userId.name,
      userEmail: updatedOrder.userId.email,
      items: updatedOrder.items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.title,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: updatedOrder.totalAmount,
      shippingAddress: updatedOrder.shippingAddress,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString()
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { id: orderId } = await params;

    await connectDB();

    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedOrder = {
      _id: (order as IOrder & Document)._id.toString(),
      userId: (order as IOrder & Document & { userId: { _id: string; name: string; email: string } }).userId._id.toString(),
      userName: (order as IOrder & Document & { userId: { _id: string; name: string; email: string } }).userId.name,
      userEmail: (order as IOrder & Document & { userId: { _id: string; name: string; email: string } }).userId.email,
      items: (order as IOrder & Document).items.map((item) => ({
        productId: item.productId.toString(),
        productName: item.title,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: (order as any).totalAmount,
      shippingAddress: (order as any).shippingAddress,
      status: (order as any).status,
      createdAt: (order as any).createdAt.toISOString(),
      updatedAt: (order as any).updatedAt.toISOString()
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    const { id: orderId } = await params;

    await connectDB();

    // Find the order first to return items to inventory if needed
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order was approved or shipped, return items to inventory
    if (['approved', 'shipped'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
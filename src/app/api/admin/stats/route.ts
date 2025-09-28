import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    await connectDB();

    // Get total users
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get low stock products (stock <= 5)
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
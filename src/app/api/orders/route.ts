import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const vendorId = searchParams.get('vendorId') || '';

    // Build query based on user role
    const query: Record<string, unknown> = {};

    if (session.user.role === 'customer') {
      query.userId = session.user.id;
    } else if (session.user.role === 'vendor') {
      query['items.vendorId'] = session.user.id;
    }
    // Admin can see all orders

    if (status) {
      query.status = status;
    }

    if (vendorId && session.user.role === 'admin') {
      query['items.vendorId'] = vendorId;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'title images')
        .populate('items.vendorId', 'name vendorProfile.businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/orders - Starting order creation');
    
    const session = await requireAuth(request);
    console.log('Session check result:', session);
    
    if (session instanceof NextResponse) {
      console.log('Authentication failed, returning error response');
      return session;
    }

    console.log('User authenticated:', session.user);

    await dbConnect();
    console.log('Database connected');

    const body = await request.json();
    console.log('Request body:', body);
    
    const { items, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items:', items);
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      console.log('Missing shipping address');
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    console.log('Validating items...');
    // Validate and process items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      console.log('Processing item:', item);
      
      const product = await Product.findById(item.productId);
      console.log('Found product:', product ? product.title : 'Not found');
      
      if (!product || !product.isActive) {
        console.log(`Product ${item.productId} not found or inactive`);
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        console.log(`Insufficient stock for ${product.title}: ${product.stock} < ${item.quantity}`);
        return NextResponse.json(
          { error: `Insufficient stock for ${product.title}` },
          { status: 400 }
        );
      }

      const price = product.salePrice || product.price;
      const subtotal = price * item.quantity;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        title: product.title,
        image: product.images[0],
        price,
        quantity: item.quantity,
        subtotal,
      });

      totalAmount += subtotal;

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    console.log('Creating order with data:', {
      userId: session.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount
    });

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${Date.now()}${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order
    const order = await Order.create({
      userId: session.user.id,
      orderNumber,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: 'pending',
      paymentMethod: 'COD',
      paymentStatus: 'pending',
    });

    console.log('Order created:', order._id);

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images')
      .populate('items.vendorId', 'name vendorProfile.businessName');

    console.log('Order populated and ready to return');
    return NextResponse.json(populatedOrder, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
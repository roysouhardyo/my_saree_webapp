import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';

export async function GET(_req: NextRequest) {
  try {
    const hasMongoURI = !!process.env.MONGODB_URI;
    const nextAuthUrl = process.env.NEXTAUTH_URL || null;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;

    await connectDB();

    const [products, users, orders] = await Promise.all([
      Product.countDocuments({}),
      User.countDocuments({}),
      Order.countDocuments({}),
    ]);

    return NextResponse.json({
      ok: true,
      env: {
        MONGODB_URI: hasMongoURI,
        NEXTAUTH_SECRET: hasNextAuthSecret,
        NEXTAUTH_URL: nextAuthUrl,
      },
      db: {
        connected: true,
        counts: { products, users, orders },
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hint:
          'Verify Vercel env vars (MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL) and MongoDB Atlas Network Access (Allow access from anywhere or Vercel IPs).',
      },
      { status: 500 }
    );
  }
}
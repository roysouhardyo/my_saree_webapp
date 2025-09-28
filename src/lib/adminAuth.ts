import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import User from '@/models/User';
import { connectDB } from './mongodb';

export async function requireAdmin(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return { user, session };
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function isAdmin(email: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ email, role: 'admin' });
    return !!user;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}
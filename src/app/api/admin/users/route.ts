import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';

    // Build query
    const query: Record<string, unknown> = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
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

    const { userId, action, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let update: Record<string, unknown> = {};

    if (action === 'approve_vendor') {
      if (user.role !== 'vendor') {
        return NextResponse.json(
          { error: 'User is not a vendor' },
          { status: 400 }
        );
      }
      update = {
        'vendorProfile.isApproved': true,
        'vendorProfile.approvedAt': new Date(),
      };
    } else if (action === 'reject_vendor') {
      if (user.role !== 'vendor') {
        return NextResponse.json(
          { error: 'User is not a vendor' },
          { status: 400 }
        );
      }
      update = {
        'vendorProfile.isApproved': false,
        $unset: { 'vendorProfile.approvedAt': 1 },
      };
    } else if (action === 'update_role') {
      if (!updateData.role || !['customer', 'vendor', 'admin'].includes(updateData.role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }
      update.role = updateData.role;
    } else {
      // General update
      update = updateData;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
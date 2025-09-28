import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const addressData = await request.json();
    const { type, name, phone, address, city, state, pincode, isDefault } = addressData;

    // Validate required fields
    if (!type || !name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'All address fields are required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr: IUser['addresses'][0]) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      type,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: isDefault || user.addresses.length === 0 // First address is default
    });

    await user.save();

    const updatedUser = await User.findById(session.user.id).select('-passwordHash').lean();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Address POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
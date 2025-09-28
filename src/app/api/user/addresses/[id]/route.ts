import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { id } = await params;
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

    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === id);
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault
    };

    await user.save();

    const updatedUser = await User.findById(session.user.id).select('-passwordHash').lean();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Address PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    await dbConnect();

    const { id } = await params;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === id);
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If the deleted address was default and there are other addresses, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    const updatedUser = await User.findById(session.user.id).select('-passwordHash').lean();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Address DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
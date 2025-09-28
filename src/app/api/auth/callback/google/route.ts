import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session after Google OAuth callback
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role === 'admin') {
      // Redirect admin users to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      // Redirect regular users to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Google callback error:', error);
    // Fallback to home page on error
    return NextResponse.redirect(new URL('/', request.url));
  }
}
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from './auth';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return session;
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return session;
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, ['admin']);
}

export async function requireVendorOrAdmin(request: NextRequest) {
  return requireRole(request, ['vendor', 'admin']);
}
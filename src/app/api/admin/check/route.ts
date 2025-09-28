import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  return NextResponse.json({ 
    success: true, 
    user: adminCheck.user 
  });
}
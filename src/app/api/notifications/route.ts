import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await getUserNotifications(session.user.id);
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      const notifications = await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ notifications });
    } else if (notificationId) {
      const notification = await markNotificationAsRead(session.user.id, notificationId);
      return NextResponse.json({ notification });
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllAsRead is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
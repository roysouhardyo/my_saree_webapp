import { connectDB } from './mongodb';
import { User } from '@/models/User';
import { Order } from '@/models/Order';

export interface Notification {
  _id?: string;
  userId: string;
  type: 'order_status' | 'order_cancelled' | 'order_confirmed' | 'order_shipped' | 'order_delivered';
  title: string;
  message: string;
  orderId: string;
  orderNumber: string;
  read: boolean;
  createdAt: Date;
}

// Create notification for order status change
export async function createOrderNotification(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string,
  previousStatus?: string
) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return;

    let notification: Partial<Notification>;

    switch (status) {
      case 'confirmed':
        notification = {
          userId,
          type: 'order_confirmed',
          title: 'Order Confirmed',
          message: `Your order #${orderNumber} has been confirmed and is being processed.`,
          orderId,
          orderNumber,
          read: false,
          createdAt: new Date()
        };
        break;
      
      case 'cancelled':
        notification = {
          userId,
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: `Your order #${orderNumber} has been cancelled. The items have been returned to stock.`,
          orderId,
          orderNumber,
          read: false,
          createdAt: new Date()
        };
        break;
      
      case 'packed':
        notification = {
          userId,
          type: 'order_status',
          title: 'Order Packed',
          message: `Your order #${orderNumber} has been packed and is ready for shipping.`,
          orderId,
          orderNumber,
          read: false,
          createdAt: new Date()
        };
        break;
      
      case 'shipped':
        notification = {
          userId,
          type: 'order_shipped',
          title: 'Order Shipped',
          message: `Your order #${orderNumber} has been shipped and is on its way to you.`,
          orderId,
          orderNumber,
          read: false,
          createdAt: new Date()
        };
        break;
      
      case 'delivered':
        notification = {
          userId,
          type: 'order_delivered',
          title: 'Order Delivered',
          message: `Your order #${orderNumber} has been delivered. Thank you for shopping with us!`,
          orderId,
          orderNumber,
          read: false,
          createdAt: new Date()
        };
        break;
      
      default:
        return;
    }

    // Add notification to user's notifications array
    if (!user.notifications) {
      user.notifications = [];
    }
    
    user.notifications.unshift(notification);
    
    // Keep only the last 50 notifications
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(0, 50);
    }
    
    await user.save();
    
    return notification;
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
}

// Get user notifications
export async function getUserNotifications(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('notifications');
    if (!user || !user.notifications) {
      return [];
    }
    
    return user.notifications.sort((a: Notification, b: Notification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.notifications) return;
    
    const notification = user.notifications.find((n: Notification) => n._id?.toString() === notificationId);
    if (notification) {
      notification.read = true;
      await user.save();
    }
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || !user.notifications) return;
    
    user.notifications.forEach((notification: Notification) => {
      notification.read = true;
    });
    
    await user.save();
    return user.notifications;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}
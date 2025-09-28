'use client';

import React from 'react';
import { useNotification, Notification } from '@/contexts/NotificationContext';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotification();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl
        animate-in slide-in-from-right-full
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium text-sm ${getTitleColor()}`}>{notification.title}</h4>
          {notification.message && (
            <p className={`text-sm mt-1 ${getMessageColor()}`}>{notification.message}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs px-2 py-1 bg-white/80 hover:bg-white/90 rounded transition-colors text-gray-800 font-medium"
            >
              {notification.action.label}
            </button>
          )}
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
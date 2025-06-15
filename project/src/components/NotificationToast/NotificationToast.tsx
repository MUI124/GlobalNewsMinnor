import React, { useState, useEffect } from 'react';
import { X, Bell, TrendingUp, AlertCircle, Newspaper } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onRead: () => void;
  onArticleClick?: (articleId: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onClose, 
  onRead,
  onArticleClick 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleClick = () => {
    onRead();
    if (notification.articleId && onArticleClick) {
      onArticleClick(notification.articleId);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'breaking':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'channel':
        return <Newspaper className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'breaking':
        return 'bg-red-50 border-red-200';
      case 'trending':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`rounded-lg shadow-lg border-l-4 ${getBorderColor()} ${getBackgroundColor()} p-4 cursor-pointer hover:shadow-xl transition-shadow`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {notification.message}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
              {notification.channel && (
                <span className="text-xs text-gray-500">
                  {notification.channel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
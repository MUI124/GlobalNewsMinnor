import React, { useState } from 'react';
import { Bell, Settings, X, Trash2, Check } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification } from '../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleClick?: (articleId: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isOpen, 
  onClose, 
  onArticleClick 
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    preferences 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'breaking'>('all');

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'breaking') return notif.type === 'breaking';
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.articleId && onArticleClick) {
      onArticleClick(notification.articleId);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return '🚨';
      case 'trending':
        return '📈';
      case 'channel':
        return '📰';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 p-2 border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'breaking', label: 'Breaking', count: notifications.filter(n => n.type === 'breaking').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-primary-200 text-primary-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Subscription Status */}
          <div className="p-3 bg-blue-50 border-b border-gray-200">
            <p className="text-sm text-blue-800">
              You're receiving alerts from {preferences.subscribedChannels.length} channel{preferences.subscribedChannels.length !== 1 ? 's' : ''}: {preferences.subscribedChannels.join(', ')}
              {preferences.enableTrendingNews && ' and trending news'}
            </p>
            <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
              Update preferences in Settings
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No notifications</p>
                <p className="text-gray-400 text-sm">
                  {filter === 'unread' ? 'All caught up!' : 'Check back later for updates'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
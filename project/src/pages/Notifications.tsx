import React, { useState } from 'react';
import { Bell, Clock, Globe, TrendingUp, Settings, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'breaking' | 'digest' | 'saved' | 'trending';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'breaking',
      title: 'Breaking News Alert',
      message: 'Major climate agreement reached at international summit with 50+ countries participating',
      time: '5 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'digest',
      title: 'Morning Briefing Ready',
      message: 'Your personalized news digest covering 15 articles from your preferred topics',
      time: '2 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'trending',
      title: 'Trending Topic Alert',
      message: 'AI Regulation Debate is now trending with 89 new articles from 12 countries',
      time: '4 hours ago',
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'saved',
      title: 'Saved Topic Update',
      message: 'New articles available for "Space Exploration" - 3 new perspectives added',
      time: '6 hours ago',
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'digest',
      title: 'Weekly Summary Available',
      message: 'Your weekly global news summary covering major events from 25 countries',
      time: '1 day ago',
      read: true,
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'breaking'>('all');

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'breaking':
        return <Bell className="h-5 w-5 text-red-500" />;
      case 'digest':
        return <Globe className="h-5 w-5 text-blue-500" />;
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'saved':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'breaking') return notif.type === 'breaking';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with global news and personalized alerts</p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-1 p-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'breaking', label: 'Breaking', count: notifications.filter(n => n.type === 'breaking').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No notifications found</p>
                <p className="text-gray-400">
                  {filter === 'unread' ? 'All caught up!' : 'Check back later for updates'}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(notification.priority)} transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{notification.time}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notification.type === 'breaking' ? 'bg-red-100 text-red-800' :
                          notification.type === 'digest' ? 'bg-blue-100 text-blue-800' :
                          notification.type === 'trending' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Daily Digest Preview */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Daily Digest Preview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Top Stories</h3>
              <p className="text-sm text-gray-600">15 articles from your preferred topics</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Global Perspectives</h3>
              <p className="text-sm text-gray-600">Coverage from 8 different countries</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Trending Topics</h3>
              <p className="text-sm text-gray-600">3 emerging stories to watch</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
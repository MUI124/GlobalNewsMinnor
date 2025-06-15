import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationPreferences, Article } from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  checkForNotifications: (articles: Article[]) => void;
  clearNotification: (id: string) => void;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableTrendingNews: true,
  subscribedChannels: ['BBC News', 'CNN'],
  enableBreakingNews: true,
  enableDailyDigest: true,
  digestTime: '09:00'
};

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only latest 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Check if we should send a notification for an article
  const shouldNotify = useCallback((article: Article): boolean => {
    // Check if from subscribed channel
    const isFromSubscribedChannel = preferences.subscribedChannels.includes(article.channel || article.source);
    
    // Check if trending and user enabled trending alerts
    const isTrendingAndEnabled = article.trending && preferences.enableTrendingNews;
    
    // Check if breaking news and user enabled breaking news
    const isBreakingAndEnabled = article.tags?.includes('breaking') && preferences.enableBreakingNews;
    
    return isFromSubscribedChannel || isTrendingAndEnabled || isBreakingAndEnabled;
  }, [preferences]);

  const checkForNotifications = useCallback((articles: Article[]) => {
    const existingArticleIds = new Set(
      notifications.map(n => n.articleId).filter(Boolean)
    );

    articles.forEach(article => {
      // Skip if we already notified about this article
      if (existingArticleIds.has(article.id)) return;
      
      if (shouldNotify(article)) {
        let notificationType: Notification['type'] = 'channel';
        let priority: Notification['priority'] = 'medium';
        let title = '';
        let message = '';

        if (article.tags?.includes('breaking')) {
          notificationType = 'breaking';
          priority = 'high';
          title = '🚨 Breaking News Alert';
          message = `${article.channel || article.source}: ${article.title}`;
        } else if (article.trending) {
          notificationType = 'trending';
          priority = 'medium';
          title = '📈 Trending News';
          message = `${article.title} is trending with coverage from multiple sources`;
        } else {
          notificationType = 'channel';
          priority = 'medium';
          title = `📰 ${article.channel || article.source}`;
          message = article.title;
        }

        addNotification({
          type: notificationType,
          title,
          message,
          articleId: article.id,
          channel: article.channel || article.source,
          priority,
          trending: article.trending
        });
      }
    });
  }, [notifications, shouldNotify, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    preferences,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    addNotification,
    checkForNotifications,
    clearNotification
  };
};
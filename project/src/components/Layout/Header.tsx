import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Settings, Bookmark, Bell, Radio, Youtube } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCenter from '../NotificationCenter/NotificationCenter';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navigation = [
    { name: 'News Feed', href: '/', current: location.pathname === '/' },
    { name: 'Compare', href: '/compare', current: location.pathname === '/compare' },
    { name: 'Event Search', href: '/events', current: location.pathname === '/events' },
    { name: 'Live TV & YouTube', href: '/live-tv', current: location.pathname === '/live-tv' },
    { name: 'Saved', href: '/saved', current: location.pathname === '/saved' },
  ];

  const handleArticleClick = (articleId: string) => {
    // In a real app, this would navigate to the specific article
    console.log('Navigate to article:', articleId);
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Global News Mirror</h1>
                <p className="text-xs text-gray-500">Multi-perspective journalism</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    item.current
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name === 'Live TV & YouTube' && (
                    <div className="flex items-center space-x-1">
                      <Radio className="h-4 w-4" />
                      <Youtube className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  <span>{item.name}</span>
                  {item.name === 'Live TV & YouTube' && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className={`p-2 transition-colors relative ${
                  location.pathname === '/notifications'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Link
                to="/saved"
                className={`p-2 transition-colors ${
                  location.pathname === '/saved'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Bookmark className="h-5 w-5" />
              </Link>
              <Link
                to="/settings"
                className={`p-2 transition-colors ${
                  location.pathname === '/settings'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden animate-slide-up">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name === 'Live TV & YouTube' && (
                      <div className="flex items-center space-x-1">
                        <Radio className="h-4 w-4" />
                        <Youtube className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    <span>{item.name}</span>
                    {item.name === 'Live TV & YouTube' && (
                      <div className="flex items-center space-x-1 text-xs text-red-600">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </Link>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => {
                      setIsNotificationCenterOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 w-full"
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onArticleClick={handleArticleClick}
      />
    </>
  );
};

export default Header;
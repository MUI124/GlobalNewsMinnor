import React, { useState } from 'react';
import { Globe, Bell, Shield, Palette, Moon, Sun, Clock, Database } from 'lucide-react';
import { countries, categories } from '../data/mockData';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNotifications } from '../hooks/useNotifications';
import CacheSettings from '../components/CacheSettings/CacheSettings';

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { preferences: notificationPrefs, updatePreferences: updateNotificationPrefs } = useNotifications();
  
  const [preferences, setPreferences] = useState({
    preferredLanguages: ['English'],
    preferredCountries: ['United States', 'United Kingdom'],
    preferredTopics: ['Politics', 'Economy'],
    autoTranslate: true,
    showBiasScores: true,
    notifications: true
  });

  // Available news channels for subscription
  const availableChannels = [
    'BBC News',
    'CNN',
    'Al Jazeera',
    'Reuters',
    'Associated Press',
    'The Guardian',
    'Deutsche Welle',
    'France 24',
    'ARY News',
    'Times of India',
    'The New York Times',
    'The Washington Post'
  ];

  const handleCountryToggle = (countryName: string) => {
    const updated = preferences.preferredCountries.includes(countryName)
      ? preferences.preferredCountries.filter(c => c !== countryName)
      : [...preferences.preferredCountries, countryName];
    
    setPreferences({ ...preferences, preferredCountries: updated });
  };

  const handleTopicToggle = (topic: string) => {
    const updated = preferences.preferredTopics.includes(topic)
      ? preferences.preferredTopics.filter(t => t !== topic)
      : [...preferences.preferredTopics, topic];
    
    setPreferences({ ...preferences, preferredTopics: updated });
  };

  const handleChannelToggle = (channel: string) => {
    const updated = notificationPrefs.subscribedChannels.includes(channel)
      ? notificationPrefs.subscribedChannels.filter(c => c !== channel)
      : [...notificationPrefs.subscribedChannels, channel];
    
    updateNotificationPrefs({ subscribedChannels: updated });
  };

  const handleCacheCleared = () => {
    // Optionally show a toast or notification
    console.log('Cache cleared successfully');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Customize your Global News Mirror experience</p>
        </div>

        <div className="space-y-8">
          {/* Cache Management */}
          <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-primary-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data & Cache</h2>
              </div>
            </div>
            <div className="p-6">
              <CacheSettings onCacheCleared={handleCacheCleared} />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-primary-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Trending News Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trending News Alerts</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get notified about major trending stories</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.enableTrendingNews}
                    onChange={(e) => updateNotificationPrefs({ enableTrendingNews: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Breaking News Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Breaking News Alerts</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get immediate alerts for breaking news</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.enableBreakingNews}
                    onChange={(e) => updateNotificationPrefs({ enableBreakingNews: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Daily Digest Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Digest</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive a daily summary of news</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={notificationPrefs.digestTime}
                    onChange={(e) => updateNotificationPrefs({ digestTime: e.target.value })}
                    disabled={!notificationPrefs.enableDailyDigest}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${!notificationPrefs.enableDailyDigest ? 'opacity-50' : ''}`}
                  >
                    <option value="06:00">6:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.enableDailyDigest}
                      onChange={(e) => updateNotificationPrefs({ enableDailyDigest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {/* Channel Subscriptions */}
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Channel Subscriptions
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select news channels you want to receive notifications from
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableChannels.map((channel) => (
                    <label key={channel} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.subscribedChannels.includes(channel)}
                        onChange={() => handleChannelToggle(channel)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {channel}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📱 You're subscribed to {notificationPrefs.subscribedChannels.length} channel{notificationPrefs.subscribedChannels.length !== 1 ? 's' : ''}
                    {notificationPrefs.subscribedChannels.length > 0 && (
                      <>: {notificationPrefs.subscribedChannels.join(', ')}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6 text-primary-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Language & Region</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preferred Countries</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {countries.map((country) => (
                    <label key={country.code} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferredCountries.includes(country.name)}
                        onChange={() => handleCountryToggle(country.name)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm flex items-center space-x-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Preferred Topics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferredTopics.includes(category)}
                        onChange={() => handleTopicToggle(category)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Auto-translate articles</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Automatically translate foreign language articles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.autoTranslate}
                    onChange={(e) => setPreferences({ ...preferences, autoTranslate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Palette className="h-6 w-6 text-primary-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Display Preferences</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Show bias scores</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Display AI-calculated bias scores on articles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.showBiasScores}
                    onChange={(e) => setPreferences({ ...preferences, showBiasScores: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dark mode</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Use dark theme for better reading in low light</p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary-600" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy & Data</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Download my data
              </button>
              <button className="text-red-600 hover:text-red-700 font-medium">
                Delete my account
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
import { useState, useEffect } from 'react';

interface UserPreferences {
  preferredLanguage: string;
  autoTranslateEnabled: boolean;
  followedChannels: string[];
  preferredRegions: string[];
  darkMode: boolean;
  notificationsEnabled: boolean;
  autoPlayVideos: boolean;
  showSubtitles: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredLanguage: 'en',
  autoTranslateEnabled: false,
  followedChannels: [],
  preferredRegions: [],
  darkMode: false,
  notificationsEnabled: true,
  autoPlayVideos: false,
  showSubtitles: true
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save user preferences:', error);
      }
    }
  }, [preferences, isLoading]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const followChannel = (channelName: string) => {
    setPreferences(prev => ({
      ...prev,
      followedChannels: [...prev.followedChannels.filter(c => c !== channelName), channelName]
    }));
  };

  const unfollowChannel = (channelName: string) => {
    setPreferences(prev => ({
      ...prev,
      followedChannels: prev.followedChannels.filter(c => c !== channelName)
    }));
  };

  const toggleChannelFollow = (channelName: string) => {
    if (preferences.followedChannels.includes(channelName)) {
      unfollowChannel(channelName);
    } else {
      followChannel(channelName);
    }
  };

  const addPreferredRegion = (region: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRegions: [...prev.preferredRegions.filter(r => r !== region), region]
    }));
  };

  const removePreferredRegion = (region: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredRegions: prev.preferredRegions.filter(r => r !== region)
    }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('userPreferences');
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    followChannel,
    unfollowChannel,
    toggleChannelFollow,
    addPreferredRegion,
    removePreferredRegion,
    resetPreferences
  };
};
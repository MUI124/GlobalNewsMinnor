import React, { useState } from 'react';
import { Youtube, Search, Filter, Radio, Clock, AlertCircle, Settings } from 'lucide-react';
import { useYouTubeNews } from '../../hooks/useYouTubeNews';
import { NEWS_CHANNELS } from '../../services/youtubeApi';
import { YouTubeSearchFilters } from '../../types';
import YouTubePlayer from '../YouTubePlayer/YouTubePlayer';
import CacheIndicator from '../CacheIndicator/CacheIndicator';

const YouTubeNews: React.FC = () => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    Object.values(NEWS_CHANNELS).slice(0, 3).map(channel => channel.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'live'>('recent');

  // Prepare filters
  const filters: YouTubeSearchFilters = {
    query: searchQuery || undefined,
    publishedAfter: timeFilter || undefined,
    order: 'date',
    maxResults: 20
  };

  const {
    videos,
    liveVideos,
    loading,
    error,
    refetch,
    forceRefresh,
    isUsingCache,
    cacheAge,
    needsApiKey
  } = useYouTubeNews({
    channelIds: selectedChannels,
    filters,
    autoFetch: true,
    cacheFirst: true
  });

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const getTimeFilterDate = (filter: string): string => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      default:
        return '';
    }
  };

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(getTimeFilterDate(filter));
  };

  // Show API key configuration notice
  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Youtube className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">YouTube API Configuration Required</h2>
          <p className="text-gray-600 mb-6">
            To use YouTube news videos, you need to configure your YouTube Data API v3 key.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">How to get your API key:</h3>
            <ol className="text-sm text-blue-800 text-left space-y-1">
              <li>1. Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>2. Create a new project or select existing one</li>
              <li>3. Enable YouTube Data API v3</li>
              <li>4. Create credentials (API Key)</li>
              <li>5. Add the key to your .env file as VITE_YOUTUBE_API_KEY</li>
            </ol>
          </div>
          <button
            onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Open Google Cloud Console
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Youtube className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">YouTube News Videos</h1>
            <p className="text-gray-600">Watch news videos from official channels</p>
          </div>
          <CacheIndicator
            isUsingCache={isUsingCache}
            cacheAge={cacheAge}
            onRefresh={forceRefresh}
            loading={loading}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-amber-800 font-medium">Service Notice</h3>
              <p className="text-amber-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for specific topics (e.g., election, earthquake, climate)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters ? 'bg-red-50 border-red-200 text-red-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Channel Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">News Channels</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(NEWS_CHANNELS).map(([name, channel]) => (
                  <label key={channel.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.id)}
                      onChange={() => handleChannelToggle(channel.id)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center space-x-1">
                      <span>{channel.flag}</span>
                      <span>{name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Time Range</h4>
              <div className="flex items-center space-x-3">
                {[
                  { label: 'All Time', value: '' },
                  { label: 'Today', value: 'today' },
                  { label: 'This Week', value: 'week' },
                  { label: 'This Month', value: 'month' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeFilterChange(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (option.value === '' && !timeFilter) || 
                      (option.value !== '' && timeFilter === getTimeFilterDate(option.value))
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Recent Videos</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {videos.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Radio className="h-5 w-5" />
            <span>Live Streams</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {liveVideos.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading YouTube videos...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching from selected channels</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div>
          {activeTab === 'recent' ? (
            // Recent Videos
            videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <Youtube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No videos found</p>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search terms or selected channels
                  </p>
                  <button
                    onClick={forceRefresh}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <YouTubePlayer
                    key={video.id}
                    video={video}
                    showDetails={true}
                    className="animate-fade-in"
                  />
                ))}
              </div>
            )
          ) : (
            // Live Streams
            liveVideos.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <Radio className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No live streams available</p>
                  <p className="text-gray-400 mb-6">
                    Check back later or try different channels
                  </p>
                  <button
                    onClick={forceRefresh}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Check for Live Streams
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveVideos.map((video) => (
                  <YouTubePlayer
                    key={video.id}
                    video={video}
                    showDetails={true}
                    className="animate-fade-in"
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeNews;
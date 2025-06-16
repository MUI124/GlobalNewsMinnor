import React, { useState, useMemo } from 'react';
import { Filter } from '../types';
import FilterBar from '../components/Filters/FilterBar';
import TrendingNewsAI from '../components/TrendingNewsAI/TrendingNewsAI';
import VideoNewsFeed from '../components/VideoNewsFeed/VideoNewsFeed';
import WorldMap from '../components/WorldMap/WorldMap';
import CacheIndicator from '../components/CacheIndicator/CacheIndicator';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import ArticleCard from '../components/Article/ArticleCard';
import AIVoiceSearch from '../components/AIVoiceSearch/AIVoiceSearch';
import { useNewsApi } from '../hooks/useNewsApi';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Brain, Settings, Globe } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const [filters, setFilters] = useState<Filter>({
    countries: [],
    sources: [],
    categories: [],
    sentiment: [],
    dateRange: { start: '', end: '' },
    searchQuery: ''
  });

  const [showMap, setShowMap] = useState(false);
  const [feedType, setFeedType] = useState<'ai-trending' | 'video' | 'traditional'>('ai-trending');
  const [showPreferences, setShowPreferences] = useState(false);

  const { preferences, updatePreferences, toggleChannelFollow } = useUserPreferences();

  // Use the cached news API with AI-enhanced search
  const { 
    articles, 
    loading, 
    error, 
    refetch, 
    isUsingCache, 
    cacheAge, 
    forceRefresh, 
    clearCache 
  } = useNewsApi({
    query: filters.searchQuery || undefined,
    country: filters.countries[0]?.toLowerCase().slice(0, 2) || undefined,
    category: filters.categories[0]?.toLowerCase() || undefined,
    sources: filters.sources.join(',') || undefined,
    pageSize: 50,
    autoFetch: true,
    cacheFirst: true,
    maxCacheAge: 30 * 60 * 1000 // 30 minutes
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Country filter
      if (filters.countries.length > 0 && !filters.countries.includes(article.country)) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(article.source)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(article.category)) {
        return false;
      }

      // Sentiment filter
      if (filters.sentiment.length > 0 && !filters.sentiment.includes(article.sentiment)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const articleDate = new Date(article.publishedAt);
        const startDate = new Date(filters.dateRange.start);
        if (articleDate < startDate) return false;
      }

      if (filters.dateRange.end) {
        const articleDate = new Date(article.publishedAt);
        const endDate = new Date(filters.dateRange.end);
        if (articleDate > endDate) return false;
      }

      return true;
    });
  }, [articles, filters]);

  const handleAISearchResult = (query: string, aiFilters?: any) => {
    setFilters(prev => ({ 
      ...prev, 
      searchQuery: query,
      // Apply AI-suggested filters
      ...(aiFilters?.timeframe && { dateRange: { start: aiFilters.timeframe, end: '' } }),
      ...(aiFilters?.region && { countries: [aiFilters.region] }),
      ...(aiFilters?.category && { categories: [aiFilters.category] })
    }));
  };

  const handleCountrySelect = (country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country) 
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({ preferredLanguage: language });
  };

  const handleTranslationToggle = (enabled: boolean) => {
    updatePreferences({ autoTranslateEnabled: enabled });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">AI-Powered Global News</h1>
                <Brain className="h-8 w-8 text-primary-600" />
                <CacheIndicator
                  isUsingCache={isUsingCache}
                  cacheAge={cacheAge}
                  onRefresh={forceRefresh}
                  onClearCache={clearCache}
                  loading={loading}
                />
              </div>
              <p className="text-gray-600">
                {loading ? 'Loading AI-enhanced news...' : 
                 `Intelligent news analysis with multi-perspective coverage`}
                {isUsingCache && !error && (
                  <span className="text-amber-600 ml-2">• Showing cached content</span>
                )}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector
                selectedLanguage={preferences.preferredLanguage}
                onLanguageChange={handleLanguageChange}
                onTranslationToggle={handleTranslationToggle}
                autoTranslateEnabled={preferences.autoTranslateEnabled}
              />

              {/* Preferences Button */}
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="User Preferences"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Feed Type Toggle */}
              <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setFeedType('ai-trending')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    feedType === 'ai-trending'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>AI Trending</span>
                </button>
                <button
                  onClick={() => setFeedType('video')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    feedType === 'video'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Video Feed
                </button>
                <button
                  onClick={() => setFeedType('traditional')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    feedType === 'traditional'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Traditional
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Preferences Panel */}
        {showPreferences && (
          <div className="mb-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Followed Channels</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['BBC News', 'CNN', 'Al Jazeera', 'Reuters', 'ARY News', 'NDTV'].map(channel => (
                    <label key={channel} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.followedChannels.includes(channel)}
                        onChange={() => toggleChannelFollow(channel)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Settings</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.autoPlayVideos}
                      onChange={(e) => updatePreferences({ autoPlayVideos: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Auto-play videos</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.showSubtitles}
                      onChange={(e) => updatePreferences({ showSubtitles: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Show subtitles</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.darkMode}
                      onChange={(e) => updatePreferences({ darkMode: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Dark mode</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEnabled}
                      onChange={(e) => updatePreferences({ notificationsEnabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Push notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Voice Search */}
        <div className="mb-8">
          <AIVoiceSearch
            onSearchResult={handleAISearchResult}
            placeholder="Try: 'latest earthquake news' or 'election results today'"
          />
        </div>

        {/* Only show error message for service unavailable, not quota errors */}
        {error && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="text-amber-800 font-medium">Service Notice</h3>
                <p className="text-amber-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              showMap 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>{showMap ? 'Hide World Map' : 'Show World Map'}</span>
          </button>
        </div>

        {/* World Map */}
        {showMap && (
          <div className="mb-8">
            <WorldMap 
              onCountrySelect={handleCountrySelect}
              selectedCountry={filters.countries[0]}
            />
          </div>
        )}

        {/* Feed Content */}
        {feedType === 'ai-trending' ? (
          <TrendingNewsAI 
            userPreferences={{
              followedChannels: preferences.followedChannels,
              preferredLanguage: preferences.preferredLanguage,
              preferredRegions: preferences.preferredRegions
            }}
          />
        ) : feedType === 'video' ? (
          <VideoNewsFeed />
        ) : (
          <>
            {/* Loading State */}
            {loading && articles.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-lg">Loading latest news articles...</p>
                  <p className="text-gray-400 text-sm mt-2">Checking cache and fetching from sources</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <p className="text-gray-500 text-lg mb-4">No articles match your current filters</p>
                  <button
                    onClick={() => setFilters({
                      countries: [],
                      sources: [],
                      categories: [],
                      sentiment: [],
                      dateRange: { start: '', end: '' },
                      searchQuery: ''
                    })}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {/* Traditional Articles Grid */}
            {filteredArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="animate-fade-in">
                    <ArticleCard article={article} />
                    {/* Show if from followed channel */}
                    {preferences.followedChannels.includes(article.source) && (
                      <div className="mt-2 flex items-center space-x-1 text-primary-600">
                        <Brain className="h-3 w-3" />
                        <span className="text-xs font-medium">From your followed channel</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
import React, { useState, useMemo } from 'react';
import { Filter } from '../types';
import FilterBar from '../components/Filters/FilterBar';
import TrendingEvents from '../components/TrendingEvents/TrendingEvents';
import VideoNewsFeed from '../components/VideoNewsFeed/VideoNewsFeed';
import WorldMap from '../components/WorldMap/WorldMap';
import CacheIndicator from '../components/CacheIndicator/CacheIndicator';
import ArticleCard from '../components/Article/ArticleCard';
import { useNewsApi } from '../hooks/useNewsApi';

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
  const [feedType, setFeedType] = useState<'video' | 'traditional'>('video');

  // Use the cached news API
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

  const handleTrendingEventSelect = (eventTitle: string) => {
    setFilters(prev => ({ ...prev, searchQuery: eventTitle }));
  };

  const handleCountrySelect = (country: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.includes(country) 
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Global News Feed</h1>
                <CacheIndicator
                  isUsingCache={isUsingCache}
                  cacheAge={cacheAge}
                  onRefresh={forceRefresh}
                  onClearCache={clearCache}
                  loading={loading}
                />
              </div>
              <p className="text-gray-600">
                {loading ? 'Loading latest news...' : 
                 `Latest videos and articles from international sources`}
                {isUsingCache && !error && (
                  <span className="text-amber-600 ml-2">• Showing cached content</span>
                )}
              </p>
            </div>
            
            {/* Feed Type Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setFeedType('video')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  feedType === 'video'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Video Feed
              </button>
              <button
                onClick={() => setFeedType('traditional')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

        {/* Trending Topics */}
        <TrendingEvents onEventSelect={handleTrendingEventSelect} />

        {/* Map Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showMap 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50'
            }`}
          >
            {showMap ? 'Hide Map' : 'Show World Map'}
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
        {feedType === 'video' ? (
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
import React, { useState, useMemo } from 'react';
import { Search, Filter as FilterIcon, Calendar, MapPin, Globe, X } from 'lucide-react';
import { countries } from '../data/mockData';
import { Article } from '../types';
import ArticleCard from '../components/Article/ArticleCard';
import VoiceSearch from '../components/VoiceSearch/VoiceSearch';
import AutoComplete from '../components/AutoComplete/AutoComplete';
import CacheIndicator from '../components/CacheIndicator/CacheIndicator';
import { useNewsApi } from '../hooks/useNewsApi';

const Events: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [filters, setFilters] = useState({
    countries: [] as string[],
    sources: [] as string[],
    dateRange: { start: '', end: '' }
  });

  // Use cached news API with search query
  const { 
    articles, 
    loading, 
    error, 
    refetch, 
    sources, 
    isUsingCache, 
    cacheAge, 
    forceRefresh, 
    clearCache 
  } = useNewsApi({
    query: searchQuery || undefined,
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

  // Extract unique sources from articles
  const availableSources = useMemo(() => {
    const articleSources = [...new Set(articles.map(article => article.source))];
    const apiSources = sources.map((source: any) => source.name);
    return [...new Set([...articleSources, ...apiSources])];
  }, [articles, sources]);

  const handleCountryToggle = (countryName: string) => {
    const updated = filters.countries.includes(countryName)
      ? filters.countries.filter(c => c !== countryName)
      : [...filters.countries, countryName];
    
    setFilters({ ...filters, countries: updated });
  };

  const handleSourceToggle = (source: string) => {
    const updated = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    
    setFilters({ ...filters, sources: updated });
  };

  const clearAllFilters = () => {
    setFilters({
      countries: [],
      sources: [],
      dateRange: { start: '', end: '' }
    });
    setSearchQuery('');
  };

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
  };

  const handleAutoCompleteSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const activeFiltersCount = filters.countries.length + filters.sources.length + 
    (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0);

  // Group articles by event for better organization
  const articlesByEvent = useMemo(() => {
    const grouped = filteredArticles.reduce((acc, article) => {
      if (!acc[article.event]) {
        acc[article.event] = [];
      }
      acc[article.event].push(article);
      return acc;
    }, {} as Record<string, Article[]>);
    return grouped;
  }, [filteredArticles]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">Event Search & Filter</h1>
                  <CacheIndicator
                    isUsingCache={isUsingCache}
                    cacheAge={cacheAge}
                    onRefresh={forceRefresh}
                    onClearCache={clearCache}
                    loading={loading}
                  />
                </div>
                <p className="text-gray-600">Search for specific events and filter by country, news channel, and date</p>
              </div>
            </div>
          </div>

          {/* Only show error message for service unavailable, not quota errors */}
          {error && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div>
                  <h3 className="text-amber-800 font-medium">Service Notice</h3>
                  <p className="text-amber-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar with Voice Input */}
          <div className="flex items-center space-x-4 mb-4">
            <AutoComplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={handleAutoCompleteSelect}
              placeholder="Search for events (e.g., climate summit, trade agreement, mars mission)..."
            />
            <VoiceSearch
              onVoiceResult={handleVoiceResult}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg border transition-colors ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FilterIcon className="h-5 w-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-gray-50 rounded-lg p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
                <div className="flex items-center space-x-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Countries */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Countries</span>
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {countries.map((country) => (
                      <label key={country.code} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.countries.includes(country.name)}
                          onChange={() => handleCountryToggle(country.name)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 flex items-center space-x-1">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* News Channels */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>News Channels</span>
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableSources.map((source) => (
                      <label key={source} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.sources.includes(source)}
                          onChange={() => handleSourceToggle(source)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date Range</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">From</label>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters({ 
                          ...filters, 
                          dateRange: { ...filters.dateRange, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters({ 
                          ...filters, 
                          dateRange: { ...filters.dateRange, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {searchQuery ? `Results for "${searchQuery}"` : 'Latest News'}
              </h2>
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${filteredArticles.length} articles found`}
                {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
                {isUsingCache && !error && (
                  <span className="text-amber-600 ml-2">• Showing cached articles</span>
                )}
              </p>
            </div>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.countries.length > 0 || filters.sources.length > 0 || filters.dateRange.start || filters.dateRange.end) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.countries.map(country => (
              <span key={country} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                {countries.find(c => c.name === country)?.flag} {country}
                <button
                  onClick={() => handleCountryToggle(country)}
                  className="ml-2 hover:text-primary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.sources.map(source => (
              <span key={source} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
                {source}
                <button
                  onClick={() => handleSourceToggle(source)}
                  className="ml-2 hover:text-secondary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.dateRange.start && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800">
                From: {filters.dateRange.start}
                <button
                  onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: '' }})}
                  className="ml-2 hover:text-accent-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dateRange.end && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800">
                To: {filters.dateRange.end}
                <button
                  onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: '' }})}
                  className="ml-2 hover:text-accent-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Searching global news sources...</p>
              <p className="text-gray-400 text-sm mt-2">Checking cache and fetching fresh data</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {!loading && filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery ? `No articles found for "${searchQuery}"` : 'No articles match your filters'}
              </p>
              <p className="text-gray-400 mb-6">Try adjusting your search terms or filters</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(articlesByEvent).length > 1 ? (
              // Group by events when multiple events are shown
              Object.entries(articlesByEvent).map(([eventId, eventArticles]) => (
                <div key={eventId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {eventId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h3>
                    <p className="text-gray-600">{eventArticles.length} articles from different perspectives</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {eventArticles.map((article) => (
                        <div key={article.id} className="animate-fade-in">
                          <ArticleCard article={article} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Simple grid when showing single event or mixed results
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="animate-fade-in">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
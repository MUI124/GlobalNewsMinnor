import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, MapPin, Brain, Globe, Clock, Filter } from 'lucide-react';
import { useNewsApi } from '../../hooks/useNewsApi';
import aiService from '../../services/aiService';
import ArticleCard from '../Article/ArticleCard';

interface TrendingNewsAIProps {
  userPreferences?: {
    followedChannels: string[];
    preferredLanguage: string;
    preferredRegions: string[];
  };
}

const TrendingNewsAI: React.FC<TrendingNewsAIProps> = ({ userPreferences }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Get trending news with user preferences
  const { articles, loading, error } = useNewsApi({
    pageSize: 50,
    autoFetch: true,
    cacheFirst: true
  });

  // Filter and sort articles based on user preferences and AI analysis
  const processedArticles = React.useMemo(() => {
    let filtered = [...articles];

    // Prioritize followed channels
    if (userPreferences?.followedChannels?.length) {
      filtered.sort((a, b) => {
        const aIsFollowed = userPreferences.followedChannels.includes(a.source);
        const bIsFollowed = userPreferences.followedChannels.includes(b.source);
        
        if (aIsFollowed && !bIsFollowed) return -1;
        if (!aIsFollowed && bIsFollowed) return 1;
        return 0;
      });
    }

    // Filter by date if selected
    if (selectedDate) {
      const targetDate = new Date(selectedDate);
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishedAt);
        return articleDate.toDateString() === targetDate.toDateString();
      });
    }

    // Filter by region if selected
    if (selectedRegion) {
      filtered = filtered.filter(article => 
        article.country.toLowerCase().includes(selectedRegion.toLowerCase()) ||
        article.source.toLowerCase().includes(selectedRegion.toLowerCase())
      );
    }

    // Sort by trending status and recency
    filtered.sort((a, b) => {
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return filtered.slice(0, 20); // Limit to top 20
  }, [articles, selectedDate, selectedRegion, userPreferences]);

  // Analyze trending news with AI
  useEffect(() => {
    if (processedArticles.length > 0 && !isAnalyzing) {
      analyzeWithAI();
    }
  }, [processedArticles]);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const insights = await aiService.analyzeTrendingNews(processedArticles);
      setAiInsights(insights);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const regions = [
    { name: 'Global', value: '' },
    { name: 'North America', value: 'america' },
    { name: 'Europe', value: 'europe' },
    { name: 'Asia', value: 'asia' },
    { name: 'Middle East', value: 'middle east' },
    { name: 'Africa', value: 'africa' },
    { name: 'Oceania', value: 'australia' }
  ];

  const getRegionColor = (region: string) => {
    const colors = {
      'america': 'bg-blue-100 text-blue-800',
      'europe': 'bg-green-100 text-green-800',
      'asia': 'bg-yellow-100 text-yellow-800',
      'middle east': 'bg-purple-100 text-purple-800',
      'africa': 'bg-orange-100 text-orange-800',
      'australia': 'bg-teal-100 text-teal-800'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Insights */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Trending News</h2>
          </div>
          <div className="flex items-center space-x-2">
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-primary-600">
                <Brain className="h-4 w-4 animate-pulse" />
                <span className="text-sm">AI Analyzing...</span>
              </div>
            )}
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Updated 2 min ago</span>
          </div>
        </div>

        {/* AI Global Insights */}
        {aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Global Trends</span>
              </h3>
              <div className="space-y-1">
                {aiInsights.globalTrends?.slice(0, 3).map((trend: string, index: number) => (
                  <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-1 mb-1">
                    {trend}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Emerging Topics</span>
              </h3>
              <div className="space-y-1">
                {aiInsights.emergingTopics?.slice(0, 3).map((topic: string, index: number) => (
                  <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mr-1 mb-1">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Global Sentiment</h3>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  aiInsights.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  aiInsights.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {aiInsights.sentiment === 'positive' ? '😊 Positive' :
                   aiInsights.sentiment === 'negative' ? '😟 Negative' :
                   '😐 Mixed'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Smart Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Specific Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Region Focus
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {regions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Map Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visualization
            </label>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`w-full px-3 py-2 rounded-md font-medium transition-colors ${
                showMap 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showMap ? 'Hide Map' : 'Show News Map'}
            </button>
          </div>
        </div>
      </div>

      {/* User Preferences Info */}
      {userPreferences?.followedChannels?.length && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Personalized for You</span>
          </div>
          <p className="text-sm text-blue-800">
            Prioritizing content from your followed channels: {userPreferences.followedChannels.join(', ')}
          </p>
        </div>
      )}

      {/* Regional Insights */}
      {aiInsights?.regionalInsights && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional News Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(aiInsights.regionalInsights).map(([region, topics]: [string, any]) => (
              <div key={region} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{region}</h4>
                <div className="space-y-1">
                  {topics.slice(0, 3).map((topic: string, index: number) => (
                    <span key={index} className={`inline-block px-2 py-1 text-xs rounded mr-1 mb-1 ${getRegionColor(region.toLowerCase())}`}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Map Placeholder */}
      {showMap && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Global News Activity Map</h3>
          <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive news map would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Showing news density and trending topics by region</p>
            </div>
          </div>
        </div>
      )}

      {/* Trending Articles */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {selectedDate ? `Trending News for ${new Date(selectedDate).toLocaleDateString()}` : 'Latest Trending News'}
          {selectedRegion && ` in ${regions.find(r => r.value === selectedRegion)?.name}`}
        </h3>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Loading trending news...</p>
            </div>
          </div>
        ) : processedArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No trending news found</p>
              <p className="text-gray-400">Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedArticles.map((article, index) => (
              <div key={article.id} className="animate-fade-in">
                <ArticleCard 
                  article={article} 
                  showReactions={true}
                />
                {/* Priority indicator for followed channels */}
                {userPreferences?.followedChannels?.includes(article.source) && (
                  <div className="mt-2 flex items-center space-x-1 text-primary-600">
                    <Brain className="h-3 w-3" />
                    <span className="text-xs font-medium">From your followed channel</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingNewsAI;
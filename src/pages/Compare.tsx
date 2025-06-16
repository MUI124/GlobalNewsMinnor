import React, { useState } from 'react';
import { ArrowLeftRight, Brain, RefreshCw } from 'lucide-react';
import { Article } from '../types';
import ArticleCard from '../components/Article/ArticleCard';
import AIVideoComparison from '../components/AIVideoComparison/AIVideoComparison';
import CacheIndicator from '../components/CacheIndicator/CacheIndicator';
import { useNewsApi } from '../hooks/useNewsApi';
import { useYouTubeNews } from '../hooks/useYouTubeNews';
import { NEWS_CHANNELS } from '../services/youtubeApi';

const Compare: React.FC = () => {
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonType, setComparisonType] = useState<'articles' | 'videos'>('videos');

  // Fetch real articles for comparison with caching
  const { 
    articles, 
    loading: articlesLoading, 
    error: articlesError, 
    refetch: refetchArticles, 
    isUsingCache: articlesUsingCache, 
    cacheAge: articlesCacheAge, 
    forceRefresh: forceRefreshArticles, 
    clearCache: clearArticlesCache 
  } = useNewsApi({
    pageSize: 50,
    autoFetch: true,
    cacheFirst: true,
    maxCacheAge: 30 * 60 * 1000 // 30 minutes
  });

  // Fetch YouTube videos for comparison
  const { 
    videos, 
    loading: videosLoading, 
    error: videosError,
    forceRefresh: forceRefreshVideos,
    isUsingCache: videosUsingCache,
    cacheAge: videosCacheAge
  } = useYouTubeNews({
    channelIds: Object.values(NEWS_CHANNELS).slice(0, 6).map(channel => channel.id),
    filters: { 
      maxResults: 20, 
      order: 'date',
      videoEmbeddable: true
    },
    autoFetch: true,
    cacheFirst: true
  });

  const handleArticleSelect = (article: Article) => {
    if (selectedArticles.find(a => a.id === article.id)) {
      setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
    } else if (selectedArticles.length < 2) {
      setSelectedArticles([...selectedArticles, article]);
    }
  };

  const startComparison = () => {
    if (selectedArticles.length === 2) {
      setShowComparison(true);
    }
  };

  const resetComparison = () => {
    setSelectedArticles([]);
    setShowComparison(false);
  };

  const handleVideoAdd = (videoUrl: string) => {
    console.log('Video added:', videoUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Comparison</h1>
              <Brain className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-gray-600">Compare perspectives with advanced AI analysis</p>
          </div>
          
          {/* Comparison Type Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setComparisonType('videos')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                comparisonType === 'videos'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="h-4 w-4" />
              <span>AI Video Comparison</span>
            </button>
            <button
              onClick={() => setComparisonType('articles')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                comparisonType === 'articles'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Article Comparison
            </button>
          </div>
        </div>

        {/* Cache Indicators */}
        <div className="mb-6 flex items-center space-x-4">
          <CacheIndicator
            isUsingCache={comparisonType === 'articles' ? articlesUsingCache : videosUsingCache}
            cacheAge={comparisonType === 'articles' ? articlesCacheAge : videosCacheAge}
            onRefresh={comparisonType === 'articles' ? forceRefreshArticles : forceRefreshVideos}
            onClearCache={comparisonType === 'articles' ? clearArticlesCache : undefined}
            loading={comparisonType === 'articles' ? articlesLoading : videosLoading}
            className="text-sm"
          />
        </div>

        {/* Error Messages */}
        {(articlesError || videosError) && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="text-amber-800 font-medium">Service Notice</h3>
                <p className="text-amber-700 text-sm">
                  {comparisonType === 'articles' ? articlesError : videosError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on comparison type */}
        {comparisonType === 'videos' ? (
          <AIVideoComparison 
            videos={videos} 
            onVideoAdd={handleVideoAdd}
          />
        ) : (
          <>
            {/* Article Comparison UI */}
            {showComparison && selectedArticles.length === 2 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Article Comparison Analysis</h2>
                  <button
                    onClick={resetComparison}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    New Comparison
                  </button>
                </div>

                {/* AI Analysis would go here */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="h-6 w-6 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
                  </div>
                  <p className="text-gray-700">
                    AI-powered comparison analysis would appear here, showing bias differences, 
                    factual variations, and tone analysis between the selected articles.
                  </p>
                </div>

                {/* Side-by-side Articles */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {selectedArticles.map((article, index) => (
                    <div key={article.id} className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                        <span className={`w-6 h-6 ${index === 0 ? 'bg-primary-600' : 'bg-secondary-600'} text-white rounded-full flex items-center justify-center text-sm`}>
                          {index + 1}
                        </span>
                        <span>{article.source} - {article.country}</span>
                      </h3>
                      <ArticleCard article={article} showReactions={false} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Selection Interface */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          selectedArticles.length >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          1
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedArticles[0] ? selectedArticles[0].title.substring(0, 50) + '...' : 'Select first article'}
                        </span>
                      </div>
                      <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          selectedArticles.length >= 2 ? 'bg-secondary-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          2
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedArticles[1] ? selectedArticles[1].title.substring(0, 50) + '...' : 'Select second article'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={startComparison}
                      disabled={selectedArticles.length < 2}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        selectedArticles.length === 2
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Brain className="h-4 w-4" />
                      <span>Compare with AI</span>
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {articlesLoading && (
                  <div className="text-center py-12">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-500 text-lg">Loading latest articles...</p>
                      <p className="text-gray-400 text-sm mt-2">Checking cache and fetching from sources</p>
                    </div>
                  </div>
                )}

                {/* Article Selection Grid */}
                {!articlesLoading && articles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <div key={article.id} className="animate-fade-in">
                        <ArticleCard
                          article={article}
                          onSelect={handleArticleSelect}
                          isSelected={selectedArticles.some(a => a.id === article.id)}
                          showCompareButton={true}
                          showReactions={false}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* No Articles */}
                {!articlesLoading && articles.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-white rounded-lg shadow-sm p-8">
                      <p className="text-gray-500 text-lg mb-4">No articles available for comparison</p>
                      <button
                        onClick={forceRefreshArticles}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
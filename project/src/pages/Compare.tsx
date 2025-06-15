import React, { useState } from 'react';
import { ArrowLeftRight, Lightbulb, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Article } from '../types';
import ArticleCard from '../components/Article/ArticleCard';
import ComparisonPoll from '../components/ComparisonPoll/ComparisonPoll';
import CacheIndicator from '../components/CacheIndicator/CacheIndicator';
import { useNewsApi } from '../hooks/useNewsApi';

const Compare: React.FC = () => {
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch real articles for comparison with caching
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
    pageSize: 50,
    autoFetch: true,
    cacheFirst: true,
    maxCacheAge: 30 * 60 * 1000 // 30 minutes
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const generateComparison = (article1: Article, article2: Article) => {
    const differences = [];
    
    if (article1.sentiment !== article2.sentiment) {
      differences.push({
        type: 'sentiment',
        description: `${article1.source} reports with ${article1.sentiment} sentiment while ${article2.source} uses ${article2.sentiment} tone`
      });
    }

    if (Math.abs(article1.biasScore - article2.biasScore) > 0.1) {
      differences.push({
        type: 'bias',
        description: `Significant bias difference: ${article1.source} (${(article1.biasScore * 100).toFixed(0)}%) vs ${article2.source} (${(article2.biasScore * 100).toFixed(0)}%)`
      });
    }

    if (article1.country !== article2.country) {
      differences.push({
        type: 'perspective',
        description: `Different national perspectives: ${article1.country} vs ${article2.country}`
      });
    }

    return differences;
  };

  if (showComparison && selectedArticles.length === 2) {
    const [article1, article2] = selectedArticles;
    const differences = generateComparison(article1, article2);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Article Comparison</h1>
              <p className="text-gray-600">Side-by-side analysis of different perspectives</p>
            </div>
            <button
              onClick={resetComparison}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Comparison
            </button>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-8 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Key Differences</h3>
                <ul className="space-y-2">
                  {differences.map((diff, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{diff.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Sentiment Comparison</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{article1.source}</span>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(article1.sentiment)}
                      <span className="text-sm capitalize">{article1.sentiment}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{article2.source}</span>
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(article2.sentiment)}
                      <span className="text-sm capitalize">{article2.sentiment}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Bias Scores</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{article1.source}</span>
                    <span className="text-sm font-medium">{(article1.biasScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{article2.source}</span>
                    <span className="text-sm font-medium">{(article2.biasScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Poll */}
          <div className="mb-8">
            <ComparisonPoll article1={article1} article2={article2} />
          </div>

          {/* Side-by-side Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                <span>{article1.source} - {article1.country}</span>
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <img src={article1.imageUrl} alt={article1.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{article1.title}</h3>
                <p className="text-gray-600 mb-4">{article1.summary}</p>
                <div className="text-sm text-gray-500">
                  <p><strong>Author:</strong> {article1.author}</p>
                  <p><strong>Published:</strong> {new Date(article1.publishedAt).toLocaleDateString()}</p>
                  <p><strong>Read Time:</strong> {article1.readTime} minutes</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span className="w-6 h-6 bg-secondary-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                <span>{article2.source} - {article2.country}</span>
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <img src={article2.imageUrl} alt={article2.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{article2.title}</h3>
                <p className="text-gray-600 mb-4">{article2.summary}</p>
                <div className="text-sm text-gray-500">
                  <p><strong>Author:</strong> {article2.author}</p>
                  <p><strong>Published:</strong> {new Date(article2.publishedAt).toLocaleDateString()}</p>
                  <p><strong>Read Time:</strong> {article2.readTime} minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Compare Perspectives</h1>
                <CacheIndicator
                  isUsingCache={isUsingCache}
                  cacheAge={cacheAge}
                  onRefresh={forceRefresh}
                  onClearCache={clearCache}
                  loading={loading}
                />
              </div>
              <p className="text-gray-600">Select two articles to compare different viewpoints and analysis</p>
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

        {/* Selection Status */}
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
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedArticles.length === 2
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Compare Articles
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Loading latest articles...</p>
              <p className="text-gray-400 text-sm mt-2">Checking cache and fetching from sources</p>
            </div>
          </div>
        )}

        {/* Article Selection Grid */}
        {!loading && articles.length > 0 && (
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
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-500 text-lg mb-4">No articles available for comparison</p>
              <button
                onClick={forceRefresh}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
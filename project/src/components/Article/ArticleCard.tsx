import React, { useState } from 'react';
import { Clock, User, MapPin, TrendingUp, TrendingDown, Minus, Download, Bookmark } from 'lucide-react';
import { Article } from '../../types';
import { countries } from '../../data/mockData';
import KeywordHighlighter from '../KeywordHighlighter/KeywordHighlighter';
import ArticleReactions from '../ArticleReactions/ArticleReactions';
import BiasExplanation from '../BiasExplanation/BiasExplanation';

interface ArticleCardProps {
  article: Article;
  onSelect?: (article: Article) => void;
  isSelected?: boolean;
  showCompareButton?: boolean;
  showReactions?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onSelect, 
  isSelected = false,
  showCompareButton = false,
  showReactions = true
}) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const country = countries.find(c => c.code === article.countryCode);
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBiasColor = (score: number) => {
    if (score <= 0.1) return 'bg-green-100 text-green-800';
    if (score <= 0.3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleDownload = () => {
    setIsDownloaded(true);
    // Simulate download process
    setTimeout(() => {
      // In a real app, this would save to local storage or trigger actual download
      console.log('Article downloaded for offline reading');
    }, 1000);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-200' : 'border-gray-200'
      }`}
    >
      <div className="relative">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {article.category}
          </span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getSentimentColor(article.sentiment)}`}>
            {getSentimentIcon(article.sentiment)}
            <span className="capitalize">{article.sentiment}</span>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getBiasColor(article.biasScore)}`}>
            <span>Bias: {(article.biasScore * 100).toFixed(0)}%</span>
          </div>
          <BiasExplanation biasScore={article.biasScore} sentiment={article.sentiment} />
        </div>
        
        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved 
                ? 'bg-primary-600 text-white' 
                : 'bg-white/90 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
            }`}
            title={isSaved ? 'Saved' : 'Save article'}
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloaded}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isDownloaded
                ? 'bg-green-600 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-green-100 hover:text-green-600'
            }`}
            title={isDownloaded ? 'Downloaded' : 'Download for offline reading'}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{country?.flag}</span>
            <span className="text-sm font-medium text-gray-600">{article.source}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{article.readTime} min read</span>
          </div>
        </div>

        <KeywordHighlighter 
          text={article.title}
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
        />

        <KeywordHighlighter 
          text={article.summary}
          className="text-gray-600 text-sm mb-4 line-clamp-3"
        />

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{article.country}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          {showCompareButton && onSelect && (
            <button
              onClick={() => onSelect(article)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>

        {showReactions && <ArticleReactions articleId={article.id} />}
      </div>
    </div>
  );
};

export default ArticleCard;
import React, { useState, useEffect } from 'react';
import { Brain, Play, ExternalLink, BarChart3, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { YouTubeVideo } from '../../types';
import aiService from '../../services/aiService';
import YouTubePlayer from '../YouTubePlayer/YouTubePlayer';

interface AIVideoComparisonProps {
  videos: YouTubeVideo[];
  onVideoAdd?: (videoUrl: string) => void;
}

const AIVideoComparison: React.FC<AIVideoComparisonProps> = ({ videos, onVideoAdd }) => {
  const [selectedVideos, setSelectedVideos] = useState<YouTubeVideo[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const handleVideoSelect = (video: YouTubeVideo) => {
    if (selectedVideos.find(v => v.id === video.id)) {
      setSelectedVideos(selectedVideos.filter(v => v.id !== video.id));
    } else if (selectedVideos.length < 4) {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleUrlAdd = async () => {
    const videoId = extractVideoId(videoUrlInput);
    if (!videoId) {
      alert('Please enter a valid YouTube URL or video ID');
      return;
    }

    // Create a mock video object for URL-added videos
    const mockVideo: YouTubeVideo = {
      id: videoId,
      title: 'Video from URL',
      description: 'Added via URL',
      channelId: 'unknown',
      channelTitle: 'Unknown Channel',
      publishedAt: new Date().toISOString(),
      thumbnails: {
        default: { url: `https://img.youtube.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
        medium: { url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180 },
        high: { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 }
      },
      isEmbeddable: true
    };

    setSelectedVideos([...selectedVideos, mockVideo]);
    setVideoUrlInput('');
    onVideoAdd?.(videoUrlInput);
  };

  const performAIComparison = async () => {
    if (selectedVideos.length < 2) return;

    setIsAnalyzing(true);
    try {
      const result = await aiService.compareVideos(selectedVideos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        channelTitle: video.channelTitle
      })));
      
      setComparisonResult(result);
      setShowComparison(true);
    } catch (error) {
      console.error('AI comparison failed:', error);
      alert('AI comparison failed. Please try again or check your OpenAI API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBiasColor = (score: number) => {
    if (score <= 0.3) return 'text-green-600 bg-green-100';
    if (score <= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSentimentIcon = (emotion: string) => {
    switch (emotion) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'mixed': return '😐';
      default: return '😶';
    }
  };

  if (showComparison && comparisonResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI Video Comparison Analysis</h2>
          </div>
          <button
            onClick={() => setShowComparison(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            New Comparison
          </button>
        </div>

        {/* Overall Insight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">AI Overall Insight</h3>
          </div>
          <p className="text-blue-800">{comparisonResult.overallInsight}</p>
        </div>

        {/* Comparison Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bias Analysis</h3>
            <p className="text-gray-700 mb-4">{comparisonResult.comparison.biasComparison}</p>
            
            <div className="space-y-2">
              {comparisonResult.videos.map((video: any, index: number) => (
                <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{video.channel}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getBiasColor(video.analysis.bias.score)}`}>
                    {(video.analysis.bias.score * 100).toFixed(0)}% bias
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tone & Sentiment</h3>
            <p className="text-gray-700 mb-4">{comparisonResult.comparison.toneAnalysis}</p>
            
            <div className="space-y-2">
              {comparisonResult.videos.map((video: any, index: number) => (
                <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{video.channel}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSentimentIcon(video.analysis.sentiment.emotion)}</span>
                    <span className="text-xs text-gray-600 capitalize">{video.analysis.sentiment.emotion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factual Differences */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Factual Differences</h3>
          <ul className="space-y-2">
            {comparisonResult.comparison.factualDifferences.map((diff: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{diff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendation */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">AI Recommendation</h3>
          </div>
          <p className="text-green-800">{comparisonResult.comparison.recommendation}</p>
        </div>

        {/* Video Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisonResult.videos.map((video: any, index: number) => (
            <div key={video.id} className="space-y-4">
              <h4 className="font-semibold text-gray-900">{video.channel}</h4>
              <YouTubePlayer
                video={selectedVideos.find(v => v.id === video.id)!}
                showDetails={true}
              />
              
              {/* Detailed Analysis */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Key Facts:</span>
                  <ul className="text-sm text-gray-600 mt-1">
                    {video.analysis.facts.keyFacts.map((fact: string, i: number) => (
                      <li key={i}>• {fact}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Bias Indicators:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {video.analysis.bias.indicators.map((indicator: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Video Comparison</h2>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Video by URL</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="Paste YouTube URL or video ID here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleUrlAdd}
            disabled={!videoUrlInput.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Video
          </button>
        </div>
      </div>

      {/* Selection Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Selected Videos ({selectedVideos.length}/4)
          </h3>
          <button
            onClick={performAIComparison}
            disabled={selectedVideos.length < 2 || isAnalyzing}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              selectedVideos.length >= 2 && !isAnalyzing
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>AI Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                <span>Compare with AI</span>
              </>
            )}
          </button>
        </div>

        {selectedVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedVideos.map((video, index) => (
              <div key={video.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={video.thumbnails.medium?.url}
                  alt={video.title}
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                  <p className="text-xs text-gray-500">{video.channelTitle}</p>
                </div>
                <button
                  onClick={() => handleVideoSelect(video)}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Videos */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedVideos.find(v => v.id === video.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
              onClick={() => handleVideoSelect(video)}
            >
              <img
                src={video.thumbnails.medium?.url}
                alt={video.title}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                {video.title}
              </h4>
              <p className="text-xs text-gray-500">{video.channelTitle}</p>
              
              {selectedVideos.find(v => v.id === video.id) && (
                <div className="mt-2 flex items-center space-x-1 text-primary-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIVideoComparison;
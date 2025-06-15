import React, { useState, useEffect } from 'react';
import { Play, Clock, Eye, Calendar, Share, Bookmark, ThumbsUp, MessageCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Article, YouTubeVideo } from '../../types';
import { useYouTubeNews } from '../../hooks/useYouTubeNews';
import { useNewsApi } from '../../hooks/useNewsApi';
import { NEWS_CHANNELS, validateVideoForEmbedding } from '../../services/youtubeApi';
import YouTubePlayer from '../YouTubePlayer/YouTubePlayer';
import ArticleCard from '../Article/ArticleCard';
import { formatViewCount, formatDuration, parseDuration } from '../../services/youtubeApi';

interface FeedItem {
  id: string;
  type: 'video' | 'article';
  data: YouTubeVideo | Article;
  timestamp: number;
}

const VideoNewsFeed: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoValidation, setVideoValidation] = useState<{ [key: string]: { isValid: boolean; reason?: string } }>({});

  // Get YouTube videos (only embeddable ones)
  const { videos: youtubeVideos, loading: youtubeLoading } = useYouTubeNews({
    channelIds: Object.values(NEWS_CHANNELS).slice(0, 5).map(channel => channel.id),
    filters: { 
      maxResults: 15, 
      order: 'date',
      videoEmbeddable: true // Only get embeddable videos
    },
    autoFetch: true
  });

  // Get news articles
  const { articles, loading: articlesLoading } = useNewsApi({
    pageSize: 10,
    autoFetch: true
  });

  // Validate videos for embedding when they load
  useEffect(() => {
    const validateVideos = async () => {
      const validationPromises = youtubeVideos.map(async (video) => {
        const validation = await validateVideoForEmbedding(video.id);
        return { videoId: video.id, validation };
      });

      const results = await Promise.all(validationPromises);
      const validationMap = results.reduce((acc, { videoId, validation }) => {
        acc[videoId] = validation;
        return acc;
      }, {} as { [key: string]: { isValid: boolean; reason?: string } });

      setVideoValidation(validationMap);
    };

    if (youtubeVideos.length > 0) {
      validateVideos();
    }
  }, [youtubeVideos]);

  // Combine and sort videos and articles
  useEffect(() => {
    const combinedItems: FeedItem[] = [];

    // Add YouTube videos (only valid ones)
    youtubeVideos.forEach((video, index) => {
      const validation = videoValidation[video.id];
      if (!validation || validation.isValid) { // Include if not yet validated or if valid
        combinedItems.push({
          id: `video-${video.id}`,
          type: 'video',
          data: video,
          timestamp: new Date(video.publishedAt).getTime()
        });
      }
    });

    // Add articles (less frequently)
    articles.forEach((article, index) => {
      if (index % 3 === 0) { // Add every 3rd article to mix with videos
        combinedItems.push({
          id: `article-${article.id}`,
          type: 'article',
          data: article,
          timestamp: new Date(article.publishedAt).getTime()
        });
      }
    });

    // Sort by timestamp (newest first)
    combinedItems.sort((a, b) => b.timestamp - a.timestamp);

    setFeedItems(combinedItems);
  }, [youtubeVideos, articles, videoValidation]);

  const formatPublishedDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const VideoFeedItem: React.FC<{ video: YouTubeVideo; index: number }> = ({ video, index }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [embedError, setEmbedError] = useState<string | null>(null);
    const validation = videoValidation[video.id];

    const handlePlay = async () => {
      setIsLoading(true);
      setHasError(false);
      setEmbedError(null);

      // Double-check validation before playing
      if (validation && !validation.isValid) {
        setHasError(true);
        return;
      }

      setShowPlayer(true);
      setIsPlaying(true);
      setCurrentVideoIndex(index);
    };

    const handleOpenInYouTube = () => {
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    };

    const handleIframeLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleIframeError = () => {
      console.error(`Failed to load YouTube video: ${video.id}`);
      setHasError(true);
      setEmbedError('Video embedding failed - CORS or restriction error');
      setIsLoading(false);
      setShowPlayer(false);
    };

    // Show error state if video is not embeddable
    if (validation && !validation.isValid) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Video Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{video.channelTitle}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatPublishedDate(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center p-6">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Video Cannot Be Played
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {validation.reason || 'This video cannot be played in the app.'}
              </p>
              <button
                onClick={handleOpenInYouTube}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Watch on YouTube</span>
              </button>
            </div>
          </div>

          {/* Video Details */}
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
              {video.title}
            </h2>
            
            {video.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {video.description}
              </p>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Why can't this video play?</strong> {validation.reason || 'This video has embedding restrictions.'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Video Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Play className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{video.channelTitle}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatPublishedDate(video.publishedAt)}</span>
                {video.isLive && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">LIVE</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Share className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {showPlayer ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&fs=1&cc_load_policy=1&iv_load_policy=3&enablejsapi=1`}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
              <img
                src={video.thumbnails.high?.url || video.thumbnails.medium?.url}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-200">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-6 transform group-hover:scale-110 transition-transform duration-200">
                  <Play className="h-10 w-10 text-white ml-1" />
                </div>
              </div>

              {/* Duration Badge */}
              {video.duration && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {formatDuration(parseDuration(video.duration))}
                </div>
              )}

              {/* Live Badge */}
              {video.isLive && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              )}

              {/* Embeddable Badge */}
              <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                ✓ Playable
              </div>
            </div>
          )}
        </div>

        {/* Video Details */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
            {video.title}
          </h2>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              {video.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatViewCount(video.viewCount)}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{video.duration ? formatDuration(parseDuration(video.duration)) : 'Live'}</span>
              </div>
            </div>
          </div>

          {video.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {video.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <ThumbsUp className="h-5 w-5" />
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                <Share className="h-5 w-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
            <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ArticleFeedItem: React.FC<{ article: Article }> = ({ article }) => {
    return (
      <div className="mb-6">
        <ArticleCard article={article} showReactions={true} />
      </div>
    );
  };

  if (youtubeLoading && articlesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading news feed...</p>
          <p className="text-gray-400 text-sm mt-2">Checking video availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global News Feed</h1>
          <p className="text-gray-600">Latest videos and articles from international news sources</p>
          <p className="text-gray-500 text-sm mt-1">Only embeddable videos are shown for seamless playback</p>
        </div>

        {/* Feed Items */}
        <div className="space-y-0">
          {feedItems.map((item, index) => (
            <div key={item.id} className="animate-fade-in">
              {item.type === 'video' ? (
                <VideoFeedItem video={item.data as YouTubeVideo} index={index} />
              ) : (
                <ArticleFeedItem article={item.data as Article} />
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        {feedItems.length > 0 && (
          <div className="text-center py-8">
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Load More Content
            </button>
          </div>
        )}

        {/* Empty State */}
        {feedItems.length === 0 && !youtubeLoading && !articlesLoading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No embeddable content available</p>
              <p className="text-gray-400">Check back later for the latest news videos and articles</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoNewsFeed;
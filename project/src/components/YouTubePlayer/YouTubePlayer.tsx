import React, { useState, useRef, useEffect } from 'react';
import { Play, ExternalLink, Clock, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { YouTubeVideo } from '../../types';
import { getEmbedUrl, formatDuration, formatViewCount, parseDuration } from '../../services/youtubeApi';

interface YouTubePlayerProps {
  video: YouTubeVideo;
  autoplay?: boolean;
  showDetails?: boolean;
  className?: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  video, 
  autoplay = false, 
  showDetails = true,
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = async () => {
    setIsLoading(true);
    setHasError(false);
    setEmbedError(null);

    // Test if video can be embedded by trying to load it
    try {
      setShowPlayer(true);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
      setEmbedError('Video cannot be played in the app');
      setIsLoading(false);
    }
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

  // Listen for iframe load events and errors
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => handleIframeLoad();
      const handleError = () => handleIframeError();
      
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
      
      // Also listen for iframe content errors
      iframe.onload = () => {
        try {
          // Check if iframe loaded successfully
          if (iframe.contentWindow) {
            handleIframeLoad();
          } else {
            handleIframeError();
          }
        } catch (e) {
          // Cross-origin access denied - this is normal for YouTube embeds
          handleIframeLoad();
        }
      };
      
      iframe.onerror = handleIframeError;
      
      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };
    }
  }, [showPlayer]);

  const formatPublishedDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Video Player / Thumbnail */}
      <div className="relative aspect-video bg-black">
        {showPlayer && !hasError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Loading video...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={getEmbedUrl(video.id, autoplay)}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </>
        ) : hasError ? (
          // Error state - video cannot be played in app
          <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <div className="text-center p-6 max-w-sm">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Video Cannot Be Played
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                {embedError || 'This video cannot be played in the app due to embedding restrictions, CORS policies, or other limitations.'}
              </p>
              <button
                onClick={handleOpenInYouTube}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Watch on YouTube</span>
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Opens in YouTube app or browser
              </p>
            </div>
          </div>
        ) : (
          // Thumbnail with play button
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlay}>
            <img
              src={video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to a default image if thumbnail fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800';
              }}
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-200">
              <div className="bg-red-600 hover:bg-red-700 rounded-full p-6 transform group-hover:scale-110 transition-transform duration-200 shadow-lg">
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

            {/* YouTube Logo Badge */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-red-600 px-2 py-1 rounded text-xs font-bold">
              ▶ YouTube
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Preparing video...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Details */}
      {showDetails && (
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {video.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <span className="font-medium">{video.channelTitle}</span>
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

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {video.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{formatViewCount(video.viewCount)}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatPublishedDate(video.publishedAt)}</span>
              </div>
            </div>
          </div>

          {video.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {video.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {!showPlayer && !hasError && (
              <button
                onClick={handlePlay}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4" />
                <span>{isLoading ? 'Loading...' : 'Play Video'}</span>
              </button>
            )}
            
            <button
              onClick={handleOpenInYouTube}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in YouTube</span>
            </button>
          </div>

          {/* Embedding info */}
          {hasError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Why can't this video play?</strong> This could be due to:
              </p>
              <ul className="text-sm text-amber-700 mt-2 ml-4 list-disc">
                <li>CORS (Cross-Origin Resource Sharing) restrictions</li>
                <li>YouTube embedding policies for this video</li>
                <li>Geographic or age restrictions</li>
                <li>Channel owner preferences</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
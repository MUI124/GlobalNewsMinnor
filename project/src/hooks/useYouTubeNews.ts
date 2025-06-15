import { useState, useEffect } from 'react';
import { 
  searchChannelVideos,
  searchMultipleChannels,
  getLiveStreams,
  getVideoDetails,
  NEWS_CHANNELS,
  needsApiKeyConfiguration
} from '../services/youtubeApi';
import { YouTubeVideo, YouTubeSearchFilters } from '../types';
import cacheService from '../services/cacheService';

interface UseYouTubeNewsOptions {
  channelIds?: string[];
  filters?: YouTubeSearchFilters;
  autoFetch?: boolean;
  cacheFirst?: boolean;
  maxCacheAge?: number;
}

interface UseYouTubeNewsReturn {
  videos: YouTubeVideo[];
  liveVideos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  isUsingCache: boolean;
  cacheAge: number | null;
  needsApiKey: boolean;
}

export const useYouTubeNews = (options: UseYouTubeNewsOptions = {}): UseYouTubeNewsReturn => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [liveVideos, setLiveVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const {
    channelIds = Object.values(NEWS_CHANNELS).map(channel => channel.id),
    filters = {},
    autoFetch = true,
    cacheFirst = true,
    maxCacheAge = 30 * 60 * 1000 // 30 minutes
  } = options;

  // Generate cache key based on parameters
  const getCacheKey = (type: 'videos' | 'live') => {
    return {
      type: `youtube-${type}`,
      channelIds: channelIds.sort(),
      filters
    };
  };

  // Fetch from cache
  const fetchFromCache = async (type: 'videos' | 'live'): Promise<YouTubeVideo[] | null> => {
    const cacheKey = getCacheKey(type);
    const cached = await cacheService.get<YouTubeVideo[]>(JSON.stringify(cacheKey));
    
    if (cached) {
      const age = await cacheService.getCacheAge(cacheKey);
      setCacheAge(age);
      console.log(`Using cached YouTube ${type} (age: ${age ? Math.round(age / 1000 / 60) : 'unknown'} minutes)`);
    }
    
    return cached;
  };

  // Cache videos
  const cacheVideos = async (videosToCache: YouTubeVideo[], type: 'videos' | 'live') => {
    const cacheKey = getCacheKey(type);
    await cacheService.set(JSON.stringify(cacheKey), videosToCache, {
      ttl: type === 'live' ? 10 * 60 * 1000 : 60 * 60 * 1000, // 10 min for live, 1 hour for regular
      source: 'youtube-api',
      metadata: {
        videoCount: videosToCache.length,
        channelIds,
        filters,
        cachedAt: new Date().toISOString()
      }
    });
  };

  // Fetch from API
  const fetchFromAPI = async (forceRefresh = false): Promise<{ videos: YouTubeVideo[]; liveVideos: YouTubeVideo[] }> => {
    console.log('Fetching YouTube videos from API');
    
    // Check if API key is configured
    if (needsApiKeyConfiguration()) {
      setNeedsApiKey(true);
      throw new Error('YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
    }

    try {
      // Fetch regular videos
      const channelResults = await searchMultipleChannels(channelIds, {
        ...filters,
        maxResults: filters.maxResults || 10
      });
      
      const allVideos = channelResults.flatMap(result => result.videos);
      
      // Get video details (duration, view count)
      const videoIds = allVideos.map(video => video.id);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Enhance videos with details
      const enhancedVideos = allVideos.map(video => ({
        ...video,
        duration: videoDetails[video.id]?.duration,
        viewCount: videoDetails[video.id]?.viewCount
      }));
      
      // Fetch live streams separately
      const liveStreams = await getLiveStreams(channelIds);
      
      // Cache the results
      await cacheVideos(enhancedVideos, 'videos');
      await cacheVideos(liveStreams, 'live');
      
      return {
        videos: enhancedVideos,
        liveVideos: liveStreams
      };
      
    } catch (error) {
      console.error('YouTube API fetch failed:', error);
      throw error;
    }
  };

  // Main fetch function
  const fetchVideos = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsUsingCache(false);
    setCacheAge(null);
    setNeedsApiKey(false);

    try {
      let videosToUse: YouTubeVideo[] | null = null;
      let liveVideosToUse: YouTubeVideo[] | null = null;

      // Try cache first if enabled and not forcing refresh
      if (cacheFirst && !forceRefresh) {
        videosToUse = await fetchFromCache('videos');
        liveVideosToUse = await fetchFromCache('live');
        
        // Check if cache is too old
        if (videosToUse && cacheAge && cacheAge > maxCacheAge) {
          console.log('YouTube cache is too old, fetching fresh data');
          videosToUse = null;
          liveVideosToUse = null;
        }
      }

      // If no cache or cache is stale, try API
      if (!videosToUse || !liveVideosToUse) {
        try {
          const apiResult = await fetchFromAPI(forceRefresh);
          videosToUse = apiResult.videos;
          liveVideosToUse = apiResult.liveVideos;
          setIsUsingCache(false);
          setCacheAge(null);
        } catch (apiError) {
          console.error('YouTube API fetch failed:', apiError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to fetch YouTube videos';
          
          // Try cache as fallback
          if (!videosToUse) {
            videosToUse = await fetchFromCache('videos');
          }
          if (!liveVideosToUse) {
            liveVideosToUse = await fetchFromCache('live');
          }
          
          if (videosToUse || liveVideosToUse) {
            setIsUsingCache(true);
            setError('Unable to fetch latest videos. Showing cached content.');
          } else {
            setError(errorMessage);
          }
        }
      } else {
        setIsUsingCache(true);
      }

      // Set the results
      setVideos(videosToUse || []);
      setLiveVideos(liveVideosToUse || []);
      
    } catch (err) {
      console.error('Error in fetchVideos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube videos';
      setError(errorMessage);
      
      // Try to use any cached data as final fallback
      const cachedVideos = await fetchFromCache('videos');
      const cachedLiveVideos = await fetchFromCache('live');
      
      setVideos(cachedVideos || []);
      setLiveVideos(cachedLiveVideos || []);
      setIsUsingCache(true);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    await fetchVideos(true);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchVideos();
    }
  }, [JSON.stringify(channelIds), JSON.stringify(filters), autoFetch]);

  return {
    videos,
    liveVideos,
    loading,
    error,
    refetch: () => fetchVideos(false),
    forceRefresh,
    isUsingCache,
    cacheAge,
    needsApiKey
  };
};

// Hook for searching specific channel
export const useChannelVideos = (channelId: string, filters: YouTubeSearchFilters = {}) => {
  return useYouTubeNews({
    channelIds: [channelId],
    filters,
    autoFetch: true,
    cacheFirst: true
  });
};

// Hook for live streams only
export const useLiveStreams = () => {
  const { liveVideos, loading, error, refetch, forceRefresh, isUsingCache, needsApiKey } = useYouTubeNews({
    channelIds: Object.values(NEWS_CHANNELS).map(channel => channel.id),
    filters: { eventType: 'live' },
    autoFetch: true,
    cacheFirst: true,
    maxCacheAge: 5 * 60 * 1000 // 5 minutes for live content
  });

  return {
    liveVideos,
    loading,
    error,
    refetch,
    forceRefresh,
    isUsingCache,
    needsApiKey
  };
};
// YouTube Data API v3 service for fetching news videos
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

import { YouTubeVideo, YouTubeChannel, YouTubeSearchFilters } from '../types';

// Official news channel IDs
export const NEWS_CHANNELS = {
  'BBC News': {
    id: 'UCCj956IF62FbT7Gouszaj9w',
    country: 'United Kingdom',
    flag: '🇬🇧'
  },
  'CNN': {
    id: 'UCupvZG-5ko_eiXAupbDfxWw',
    country: 'United States',
    flag: '🇺🇸'
  },
  'ARY News': {
    id: 'UC4JCksJF76g_MdzPVBJoC3Q',
    country: 'Pakistan',
    flag: '🇵🇰'
  },
  'SAMAA TV': {
    id: 'UCeBBZIOxTImZ_8sabWVQwBA',
    country: 'Pakistan',
    flag: '🇵🇰'
  },
  'Al Jazeera English': {
    id: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    country: 'Qatar',
    flag: '🇶🇦'
  },
  'Reuters': {
    id: 'UChqUTb7kYRX8-EiaN3XFoSQ',
    country: 'United Kingdom',
    flag: '🇬🇧'
  },
  'France 24 English': {
    id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg',
    country: 'France',
    flag: '🇫🇷'
  },
  'Deutsche Welle': {
    id: 'UCknLrEdhRCp1aegoMqRaCZg',
    country: 'Germany',
    flag: '🇩🇪'
  },
  'Sky News': {
    id: 'UCoMdktPbSTixAyNGwb-UYkQ',
    country: 'United Kingdom',
    flag: '🇬🇧'
  },
  'NDTV': {
    id: 'UCZFMm1mMw0F81Z37aaEzTUA',
    country: 'India',
    flag: '🇮🇳'
  }
};

// Check if API key is available and properly configured
const isApiKeyAvailable = (): boolean => {
  console.log('YouTube API Key check:', {
    hasKey: !!YOUTUBE_API_KEY,
    keyLength: YOUTUBE_API_KEY?.length || 0,
    keyPreview: YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.substring(0, 8)}...` : 'none',
    isValidFormat: YOUTUBE_API_KEY ? /^AIza[0-9A-Za-z_-]{35}$/.test(YOUTUBE_API_KEY) : false
  });
  
  // Check if key exists and has proper format
  const hasKey = !!YOUTUBE_API_KEY && 
    YOUTUBE_API_KEY !== 'your_youtube_api_key_here' && 
    YOUTUBE_API_KEY.length >= 35 && // YouTube API keys are typically 39 characters
    YOUTUBE_API_KEY.startsWith('AIza'); // YouTube API keys start with AIza
  
  return hasKey;
};

// Create request with proper error handling
const createYouTubeRequest = async (url: string): Promise<Response> => {
  console.log('Making YouTube API request to:', url);
  
  if (!isApiKeyAvailable()) {
    throw new Error('YouTube API key is not configured properly. Please check your .env file and ensure VITE_YOUTUBE_API_KEY is set correctly.');
  }
  
  try {
    const response = await fetch(url);
    console.log('YouTube API response status:', response.status, response.statusText);
    
    return response;
  } catch (error) {
    console.error('Network error during YouTube request:', error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Search for videos from specific channels with embeddable filter
export const searchChannelVideos = async (
  channelId: string,
  filters: YouTubeSearchFilters = {}
): Promise<YouTubeVideo[]> => {
  const params = new URLSearchParams();
  
  params.append('part', 'snippet');
  params.append('channelId', channelId);
  params.append('type', 'video');
  params.append('order', filters.order || 'date');
  params.append('maxResults', (filters.maxResults || 25).toString());
  params.append('videoEmbeddable', 'true'); // Only get embeddable videos
  params.append('key', YOUTUBE_API_KEY);
  
  if (filters.query) {
    params.append('q', filters.query);
  }
  
  if (filters.publishedAfter) {
    params.append('publishedAfter', filters.publishedAfter);
  }
  
  if (filters.publishedBefore) {
    params.append('publishedBefore', filters.publishedBefore);
  }
  
  if (filters.videoDuration) {
    params.append('videoDuration', filters.videoDuration);
  }
  
  if (filters.eventType) {
    params.append('eventType', filters.eventType);
  }

  const url = `${YOUTUBE_BASE_URL}/search?${params}`;
  
  try {
    const response = await createYouTubeRequest(url);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';
      
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorDetails = errorData.error.message;
        }
        console.log('YouTube API Error Details:', errorData);
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      // Handle specific YouTube API errors
      if (response.status === 400) {
        throw new Error(`Bad Request: ${errorDetails || 'Invalid parameters provided to YouTube API.'}`);
      } else if (response.status === 403) {
        if (errorDetails.includes('quota') || errorDetails.includes('exceeded')) {
          throw new Error('YouTube API quota exceeded. Please try again later or upgrade your API plan.');
        } else if (errorDetails.includes('key') || errorDetails.includes('API key')) {
          throw new Error('Invalid YouTube API key. Please check your VITE_YOUTUBE_API_KEY in the .env file.');
        } else if (errorDetails.includes('disabled') || errorDetails.includes('not enabled')) {
          throw new Error('YouTube Data API v3 is not enabled for this project. Please enable it in Google Cloud Console.');
        } else {
          throw new Error(`Access forbidden: ${errorDetails || 'Please check your YouTube API key and permissions.'}`);
        }
      } else if (response.status === 404) {
        throw new Error('Channel not found. Please check the channel ID.');
      }
      
      throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No embeddable videos found for channel:', channelId);
      return [];
    }
    
    // Convert YouTube API response to our format
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      isLive: item.snippet.liveBroadcastContent === 'live',
      liveBroadcastContent: item.snippet.liveBroadcastContent,
      tags: item.snippet.tags || [],
      isEmbeddable: true // We filtered for embeddable videos
    }));
    
    console.log(`Successfully fetched ${videos.length} embeddable videos from YouTube channel ${channelId}`);
    return videos;
    
  } catch (error) {
    console.error('YouTube API request failed:', error);
    throw error;
  }
};

// Search across multiple channels
export const searchMultipleChannels = async (
  channelIds: string[],
  filters: YouTubeSearchFilters = {}
): Promise<{ channelId: string; videos: YouTubeVideo[] }[]> => {
  console.log('Searching multiple channels for embeddable videos:', channelIds);
  
  const results = await Promise.allSettled(
    channelIds.map(async (channelId) => {
      try {
        const videos = await searchChannelVideos(channelId, filters);
        return { channelId, videos };
      } catch (error) {
        console.error(`Failed to fetch embeddable videos for channel ${channelId}:`, error);
        return { channelId, videos: [] };
      }
    })
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<{ channelId: string; videos: YouTubeVideo[] }> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
};

// Get live streams from channels (embeddable only)
export const getLiveStreams = async (channelIds: string[]): Promise<YouTubeVideo[]> => {
  const allLiveVideos: YouTubeVideo[] = [];
  
  for (const channelId of channelIds) {
    try {
      const videos = await searchChannelVideos(channelId, {
        eventType: 'live',
        order: 'date',
        maxResults: 5
      });
      allLiveVideos.push(...videos);
    } catch (error) {
      console.error(`Failed to get embeddable live streams for channel ${channelId}:`, error);
    }
  }
  
  return allLiveVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};

// Get channel information
export const getChannelInfo = async (channelId: string): Promise<YouTubeChannel | null> => {
  const params = new URLSearchParams();
  params.append('part', 'snippet,statistics');
  params.append('id', channelId);
  params.append('key', YOUTUBE_API_KEY);

  const url = `${YOUTUBE_BASE_URL}/channels?${params}`;
  
  try {
    const response = await createYouTubeRequest(url);
    
    if (!response.ok) {
      throw new Error(`Failed to get channel info: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    const channel = data.items[0];
    
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      country: channel.snippet.country || 'Unknown',
      flag: getCountryFlag(channel.snippet.country),
      subscriberCount: channel.statistics?.subscriberCount,
      videoCount: channel.statistics?.videoCount,
      thumbnails: channel.snippet.thumbnails
    };
    
  } catch (error) {
    console.error('Failed to get channel info:', error);
    return null;
  }
};

// Get video details including duration, view count, and embeddability
export const getVideoDetails = async (videoIds: string[]): Promise<{ [key: string]: any }> => {
  if (videoIds.length === 0) return {};
  
  const params = new URLSearchParams();
  params.append('part', 'contentDetails,statistics,status');
  params.append('id', videoIds.join(','));
  params.append('key', YOUTUBE_API_KEY);

  const url = `${YOUTUBE_BASE_URL}/videos?${params}`;
  
  try {
    const response = await createYouTubeRequest(url);
    
    if (!response.ok) {
      throw new Error(`Failed to get video details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const details: { [key: string]: any } = {};
    
    data.items?.forEach((item: any) => {
      details[item.id] = {
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
        likeCount: item.statistics?.likeCount,
        commentCount: item.statistics?.commentCount,
        embeddable: item.status?.embeddable !== false // Default to true if not specified
      };
    });
    
    return details;
    
  } catch (error) {
    console.error('Failed to get video details:', error);
    return {};
  }
};

// Check if a specific video is embeddable
export const checkVideoEmbeddability = async (videoId: string): Promise<boolean> => {
  try {
    const details = await getVideoDetails([videoId]);
    return details[videoId]?.embeddable !== false;
  } catch (error) {
    console.error('Failed to check video embeddability:', error);
    return false;
  }
};

// Helper function to get country flag
const getCountryFlag = (countryCode?: string): string => {
  const flagMap: { [key: string]: string } = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'PK': '🇵🇰', 'QA': '🇶🇦',
    'FR': '🇫🇷', 'DE': '🇩🇪', 'IN': '🇮🇳', 'AU': '🇦🇺',
    'CA': '🇨🇦', 'JP': '🇯🇵', 'CN': '🇨🇳', 'RU': '🇷🇺'
  };
  return flagMap[countryCode || ''] || '🌍';
};

// Parse YouTube duration (PT4M13S format) to seconds
export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Format duration for display
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Format view count for display
export const formatViewCount = (count: string): string => {
  const num = parseInt(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  } else {
    return `${num} views`;
  }
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  fallbackData?: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('YouTube API Error:', error);
    if (fallbackData) {
      return fallbackData;
    }
    throw error;
  }
};

// Generate YouTube embed URL with proper parameters to avoid CORS issues
export const getEmbedUrl = (videoId: string, autoplay = false): string => {
  const params = new URLSearchParams();
  
  // Essential parameters for embedding
  if (autoplay) params.append('autoplay', '1');
  params.append('rel', '0'); // Don't show related videos from other channels
  params.append('modestbranding', '1'); // Modest YouTube branding
  params.append('fs', '1'); // Allow fullscreen
  params.append('cc_load_policy', '1'); // Show captions by default
  params.append('iv_load_policy', '3'); // Hide video annotations
  params.append('enablejsapi', '1'); // Enable JavaScript API
  params.append('origin', window.location.origin); // Set origin for CORS
  params.append('widget_referrer', window.location.origin); // Widget referrer
  
  // Use youtube-nocookie.com domain for better privacy and fewer restrictions
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
};

// Check if API key needs to be configured
export const needsApiKeyConfiguration = (): boolean => {
  return !isApiKeyAvailable();
};

// Validate video URL for embedding using oEmbed (doesn't require API key)
export const validateVideoForEmbedding = async (videoId: string): Promise<{
  isValid: boolean;
  reason?: string;
}> => {
  try {
    // Use YouTube oEmbed API to check if video exists and is embeddable
    const oEmbedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!oEmbedResponse.ok) {
      if (oEmbedResponse.status === 401) {
        return {
          isValid: false,
          reason: 'Video is private or requires authentication'
        };
      } else if (oEmbedResponse.status === 404) {
        return {
          isValid: false,
          reason: 'Video not found or has been removed'
        };
      } else if (oEmbedResponse.status === 403) {
        return {
          isValid: false,
          reason: 'Video embedding is disabled by the channel owner'
        };
      } else {
        return {
          isValid: false,
          reason: 'Video not available for embedding'
        };
      }
    }

    const oEmbedData = await oEmbedResponse.json();
    
    // Check if we got valid embed data
    if (!oEmbedData.html || !oEmbedData.title) {
      return {
        isValid: false,
        reason: 'Video metadata unavailable'
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Error validating video for embedding:', error);
    return {
      isValid: false,
      reason: 'Unable to verify video availability due to network error'
    };
  }
};
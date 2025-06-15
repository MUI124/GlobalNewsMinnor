export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  country: string;
  countryCode: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  event: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  biasScore: number;
  originalLanguage: string;
  readTime: number;
  tags: string[];
  trending?: boolean;
  channel: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  articles: Article[];
  countries: string[];
  summary: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
}

export interface Filter {
  countries: string[];
  sources: string[];
  categories: string[];
  sentiment: string[];
  dateRange: {
    start: string;
    end: string;
  };
  searchQuery: string;
}

export interface UserPreferences {
  preferredLanguages: string[];
  preferredCountries: string[];
  preferredTopics: string[];
  autoTranslate: boolean;
  showBiasScores: boolean;
}

export interface NotificationPreferences {
  enableTrendingNews: boolean;
  subscribedChannels: string[];
  enableBreakingNews: boolean;
  enableDailyDigest: boolean;
  digestTime: string; // e.g., "09:00"
}

export interface Notification {
  id: string;
  type: 'breaking' | 'trending' | 'digest' | 'channel';
  title: string;
  message: string;
  articleId?: string;
  channel?: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  trending?: boolean;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  duration?: string;
  viewCount?: string;
  isLive?: boolean;
  liveBroadcastContent?: 'live' | 'upcoming' | 'none';
  tags?: string[];
  categoryId?: string;
  isEmbeddable?: boolean; // Whether the video can be embedded
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  country: string;
  flag: string;
  subscriberCount?: string;
  videoCount?: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
}

export interface YouTubeSearchFilters {
  channelId?: string;
  query?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  order?: 'date' | 'relevance' | 'viewCount' | 'rating';
  videoDuration?: 'short' | 'medium' | 'long';
  eventType?: 'live' | 'completed' | 'upcoming';
  maxResults?: number;
  videoEmbeddable?: boolean; // Filter for embeddable videos only
}
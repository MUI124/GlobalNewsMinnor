// News API service for fetching real news data
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Alternative APIs that can be used
const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY;
const GUARDIAN_BASE_URL = 'https://content.guardianapis.com';

const BBC_API_KEY = import.meta.env.VITE_BBC_API_KEY;
const BBC_BASE_URL = 'https://api.bbc.co.uk';

export interface NewsApiArticle {
  source: {
    id: string;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

// Fetch news from NewsAPI.org
export const fetchNewsFromNewsAPI = async (
  query?: string,
  country?: string,
  category?: string,
  sources?: string,
  pageSize: number = 20
): Promise<NewsApiResponse> => {
  const params = new URLSearchParams();
  
  if (query) params.append('q', query);
  if (country) params.append('country', country);
  if (category) params.append('category', category);
  if (sources) params.append('sources', sources);
  
  params.append('pageSize', pageSize.toString());
  params.append('apiKey', NEWS_API_KEY || '');

  const endpoint = query || sources ? 'everything' : 'top-headlines';
  const response = await fetch(`${NEWS_API_BASE_URL}/${endpoint}?${params}`);
  
  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch news from The Guardian API
export const fetchNewsFromGuardian = async (
  query?: string,
  section?: string,
  pageSize: number = 20
) => {
  const params = new URLSearchParams();
  
  if (query) params.append('q', query);
  if (section) params.append('section', section);
  
  params.append('page-size', pageSize.toString());
  params.append('show-fields', 'thumbnail,trailText,body');
  params.append('api-key', GUARDIAN_API_KEY || '');

  const response = await fetch(`${GUARDIAN_BASE_URL}/search?${params}`);
  
  if (!response.ok) {
    throw new Error(`Guardian API error: ${response.statusText}`);
  }
  
  return response.json();
};

// Fetch news sources
export const fetchNewsSources = async (
  country?: string,
  category?: string,
  language?: string
) => {
  const params = new URLSearchParams();
  
  if (country) params.append('country', country);
  if (category) params.append('category', category);
  if (language) params.append('language', language);
  
  params.append('apiKey', NEWS_API_KEY || '');

  const response = await fetch(`${NEWS_API_BASE_URL}/sources?${params}`);
  
  if (!response.ok) {
    throw new Error(`NewsAPI sources error: ${response.statusText}`);
  }
  
  return response.json();
};

// Convert NewsAPI article to our Article interface
export const convertNewsApiToArticle = (apiArticle: NewsApiArticle, countryCode: string = 'US'): any => {
  // Simple sentiment analysis based on keywords
  const getSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['success', 'achievement', 'breakthrough', 'progress', 'victory', 'growth'];
    const negativeWords = ['crisis', 'conflict', 'war', 'disaster', 'failure', 'decline', 'threat'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // Simple bias score calculation
  const getBiasScore = (text: string): number => {
    const biasWords = ['allegedly', 'reportedly', 'sources say', 'claims', 'according to'];
    const emotionalWords = ['shocking', 'devastating', 'incredible', 'amazing', 'terrible'];
    
    const lowerText = text.toLowerCase();
    const biasCount = biasWords.filter(word => lowerText.includes(word)).length;
    const emotionalCount = emotionalWords.filter(word => lowerText.includes(word)).length;
    
    return Math.min((biasCount + emotionalCount) * 0.1, 0.5);
  };

  const fullText = `${apiArticle.title} ${apiArticle.description || ''} ${apiArticle.content || ''}`;
  
  return {
    id: `${apiArticle.source.id}-${Date.now()}`,
    title: apiArticle.title,
    content: apiArticle.content || apiArticle.description || '',
    summary: apiArticle.description || apiArticle.title,
    source: apiArticle.source.name,
    country: getCountryFromSource(apiArticle.source.name),
    countryCode: countryCode,
    author: apiArticle.author || 'Unknown',
    publishedAt: apiArticle.publishedAt,
    imageUrl: apiArticle.urlToImage || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: getCategoryFromContent(fullText),
    event: generateEventId(apiArticle.title),
    sentiment: getSentiment(fullText),
    biasScore: getBiasScore(fullText),
    originalLanguage: 'en',
    readTime: Math.ceil((apiArticle.content?.length || 500) / 200), // Rough estimate
    tags: extractTags(fullText),
    url: apiArticle.url
  };
};

// Helper functions
const getCountryFromSource = (sourceName: string): string => {
  const sourceCountryMap: { [key: string]: string } = {
    'BBC News': 'United Kingdom',
    'CNN': 'United States',
    'Fox News': 'United States',
    'The Guardian': 'United Kingdom',
    'Reuters': 'United Kingdom',
    'Associated Press': 'United States',
    'Al Jazeera English': 'Qatar',
    'Deutsche Welle': 'Germany',
    'France 24': 'France',
    'RT': 'Russia',
    'CGTN': 'China',
    'NHK World': 'Japan',
    'Times of India': 'India',
    'Dawn': 'Pakistan',
    'Arab News': 'Saudi Arabia'
  };
  
  return sourceCountryMap[sourceName] || 'Unknown';
};

const getCategoryFromContent = (content: string): string => {
  const categories = {
    'Politics': ['election', 'government', 'president', 'minister', 'parliament', 'congress', 'senate'],
    'Economy': ['economy', 'market', 'stock', 'trade', 'business', 'finance', 'gdp', 'inflation'],
    'Technology': ['technology', 'tech', 'ai', 'artificial intelligence', 'software', 'app', 'digital'],
    'Health': ['health', 'medical', 'hospital', 'doctor', 'vaccine', 'virus', 'disease', 'covid'],
    'Environment': ['climate', 'environment', 'global warming', 'pollution', 'renewable', 'carbon'],
    'Sports': ['sports', 'football', 'soccer', 'basketball', 'olympics', 'championship', 'match'],
    'Science': ['science', 'research', 'study', 'discovery', 'space', 'nasa', 'experiment'],
    'International': ['international', 'global', 'world', 'foreign', 'diplomatic', 'treaty']
  };
  
  const lowerContent = content.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return category;
    }
  }
  
  return 'General';
};

const generateEventId = (title: string): string => {
  // Simple event ID generation based on title keywords
  const keywords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .join('-');
  
  return keywords || 'general-news';
};

const extractTags = (content: string): string[] => {
  const commonTags = [
    'breaking', 'news', 'update', 'report', 'analysis', 'exclusive',
    'global', 'international', 'national', 'local', 'politics', 'economy',
    'technology', 'health', 'environment', 'sports', 'science'
  ];
  
  const lowerContent = content.toLowerCase();
  return commonTags.filter(tag => lowerContent.includes(tag)).slice(0, 5);
};

// Live TV stream URLs (these would need to be real streaming URLs)
export const getLiveStreamUrl = (channelName: string): string => {
  const streamUrls: { [key: string]: string } = {
    'BBC News': process.env.VITE_BBC_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'CNN': process.env.VITE_CNN_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'Al Jazeera': process.env.VITE_ALJAZEERA_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'France 24': process.env.VITE_FRANCE24_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'Deutsche Welle': process.env.VITE_DW_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  };
  
  return streamUrls[channelName] || streamUrls['BBC News'];
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  fallbackData?: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API Error:', error);
    if (fallbackData) {
      return fallbackData;
    }
    throw error;
  }
};
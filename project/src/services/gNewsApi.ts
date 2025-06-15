// GNews API service for fetching real news data
const GNEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || import.meta.env.VITE_GNEWS_API_KEY;

// Use proxy in development, direct API in production
const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api/gnews'; // Use Vite proxy in development
  }
  return 'https://gnews.io/api/v4'; // Direct API in production
};

const GNEWS_BASE_URL = getBaseUrl();

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

// Create request with proper headers and error handling
const createGNewsRequest = async (url: string): Promise<Response> => {
  console.log('Making GNews API request to:', url);
  
  // Check if API key is available and not a placeholder
  if (!GNEWS_API_KEY || GNEWS_API_KEY.includes('your_gnews_api_key_here')) {
    throw new Error('GNews API key is not configured properly. Please:\n1. Get a free API key from https://gnews.io/\n2. Replace "your_gnews_api_key_here" in your .env file with your actual API key\n3. Restart the development server');
  }
  
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-cache'
  };

  console.log('Request options:', requestOptions);

  try {
    const response = await fetch(url, requestOptions);
    console.log('Response status:', response.status, response.statusText);
    
    return response;
  } catch (error) {
    console.error('Network error during GNews request:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('CORS Error: The news API cannot be accessed directly from the browser. This is a common limitation with news APIs. In production, this would be handled by a backend server.');
    }
    
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Fetch top headlines from GNews - matches official documentation
export const fetchTopHeadlines = async (
  country?: string,
  category?: string,
  lang: string = 'en',
  max: number = 10
): Promise<GNewsResponse> => {
  // Validate and limit parameters according to GNews API specs
  const validatedMax = Math.min(Math.max(max, 1), 100); // Between 1 and 100
  const validatedLang = ['ar', 'zh', 'nl', 'en', 'fr', 'de', 'el', 'hi', 'it', 'ja', 'ml', 'mr', 'no', 'pt', 'ro', 'ru', 'es', 'sv', 'ta', 'te', 'uk'].includes(lang) ? lang : 'en';
  const validatedCategory = ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'].includes(category || '') ? category : 'general';
  const validatedCountry = ['au', 'br', 'ca', 'cn', 'eg', 'fr', 'de', 'gr', 'hk', 'in', 'ie', 'it', 'jp', 'nl', 'no', 'pk', 'pe', 'ph', 'pt', 'ro', 'ru', 'sg', 'es', 'se', 'ch', 'tw', 'ua', 'gb', 'us'].includes(country || '') ? country : undefined;
  
  const params = new URLSearchParams();
  
  params.append('category', validatedCategory);
  params.append('lang', validatedLang);
  params.append('max', validatedMax.toString());
  params.append('apikey', GNEWS_API_KEY);
  
  if (validatedCountry) {
    params.append('country', validatedCountry);
  }

  const url = `${GNEWS_BASE_URL}/top-headlines?${params}`;
  console.log('Fetching GNews top headlines:', { url, params: Object.fromEntries(params) });

  try {
    const response = await createGNewsRequest(url);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorDetails = errorData.message;
          } else if (errorData.error) {
            errorDetails = errorData.error;
          }
        } catch (e) {
          errorDetails = errorText;
        }
      } catch (e) {
        console.log('Could not read error response body');
      }
      
      // Handle specific GNews API error codes
      if (response.status === 400) {
        throw new Error('Bad Request: Your request is invalid. Please check the parameters.');
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Your API key is wrong. Please check your VITE_NEWS_API_KEY in the .env file.');
      } else if (response.status === 403) {
        throw new Error('Forbidden: You have reached your daily quota, the next reset is at 00:00 UTC. Please wait or upgrade your GNews API plan.');
      } else if (response.status === 429) {
        throw new Error('Too Many Requests: You have made more requests per second than you are allowed.');
      } else if (response.status === 500) {
        throw new Error('Internal Server Error: We had a problem with our server. Try again later.');
      } else if (response.status === 503) {
        throw new Error('Service Unavailable: We\'re temporarily offline for maintenance. Please try again later.');
      }
      
      throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
    
    const data = await response.json();
    console.log('GNews API success response:', { totalArticles: data.totalArticles, articlesCount: data.articles?.length });
    return data;
  } catch (error) {
    console.error('GNews API request failed:', error);
    throw error;
  }
};

// Search for articles in GNews - matches official documentation
export const searchArticles = async (
  query: string,
  lang: string = 'en',
  country?: string,
  max: number = 10,
  from?: string,
  to?: string,
  sortby: 'relevance' | 'publishedAt' = 'publishedAt'
): Promise<GNewsResponse> => {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query is required and cannot be empty.');
  }

  // Validate and limit parameters according to GNews API specs
  const validatedMax = Math.min(Math.max(max, 1), 100); // Between 1 and 100
  const validatedLang = ['ar', 'zh', 'nl', 'en', 'fr', 'de', 'el', 'hi', 'it', 'ja', 'ml', 'mr', 'no', 'pt', 'ro', 'ru', 'es', 'sv', 'ta', 'te', 'uk'].includes(lang) ? lang : 'en';
  const validatedSort = ['relevance', 'publishedAt'].includes(sortby) ? sortby : 'publishedAt';
  const validatedCountry = ['au', 'br', 'ca', 'cn', 'eg', 'fr', 'de', 'gr', 'hk', 'in', 'ie', 'it', 'jp', 'nl', 'no', 'pk', 'pe', 'ph', 'pt', 'ro', 'ru', 'sg', 'es', 'se', 'ch', 'tw', 'ua', 'gb', 'us'].includes(country || '') ? country : undefined;
  
  const params = new URLSearchParams();
  
  params.append('q', query.trim());
  params.append('lang', validatedLang);
  params.append('max', validatedMax.toString());
  params.append('sortby', validatedSort);
  params.append('apikey', GNEWS_API_KEY);
  
  if (validatedCountry) {
    params.append('country', validatedCountry);
  }
  if (from) {
    params.append('from', from);
  }
  if (to) {
    params.append('to', to);
  }

  const url = `${GNEWS_BASE_URL}/search?${params}`;
  console.log('Searching GNews:', { url, params: Object.fromEntries(params) });

  try {
    const response = await createGNewsRequest(url);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorDetails = errorData.message;
          } else if (errorData.error) {
            errorDetails = errorData.error;
          }
        } catch (e) {
          errorDetails = errorText;
        }
      } catch (e) {
        console.log('Could not read error response body');
      }
      
      // Handle specific GNews API error codes
      if (response.status === 400) {
        throw new Error('Bad Request: Your request is invalid. Please check the parameters.');
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Your API key is wrong. Please check your VITE_NEWS_API_KEY in the .env file.');
      } else if (response.status === 403) {
        throw new Error('Forbidden: You have reached your daily quota, the next reset is at 00:00 UTC. Please wait or upgrade your GNews API plan.');
      } else if (response.status === 429) {
        throw new Error('Too Many Requests: You have made more requests per second than you are allowed.');
      } else if (response.status === 500) {
        throw new Error('Internal Server Error: We had a problem with our server. Try again later.');
      } else if (response.status === 503) {
        throw new Error('Service Unavailable: We\'re temporarily offline for maintenance. Please try again later.');
      }
      
      throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
    
    const data = await response.json();
    console.log('GNews search success response:', { totalArticles: data.totalArticles, articlesCount: data.articles?.length });
    return data;
  } catch (error) {
    console.error('GNews search request failed:', error);
    throw error;
  }
};

// Convert GNews article to our Article interface
export const convertGNewsToArticle = (gNewsArticle: GNewsArticle): any => {
  // Simple sentiment analysis based on keywords
  const getSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['success', 'achievement', 'breakthrough', 'progress', 'victory', 'growth', 'agreement', 'peace', 'cooperation'];
    const negativeWords = ['crisis', 'conflict', 'war', 'disaster', 'failure', 'decline', 'threat', 'attack', 'violence', 'crisis'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // Simple bias score calculation
  const getBiasScore = (text: string): number => {
    const biasWords = ['allegedly', 'reportedly', 'sources say', 'claims', 'according to', 'it is believed'];
    const emotionalWords = ['shocking', 'devastating', 'incredible', 'amazing', 'terrible', 'outrageous', 'stunning'];
    
    const lowerText = text.toLowerCase();
    const biasCount = biasWords.filter(word => lowerText.includes(word)).length;
    const emotionalCount = emotionalWords.filter(word => lowerText.includes(word)).length;
    
    return Math.min((biasCount + emotionalCount) * 0.1, 0.5);
  };

  // Check if article is trending based on keywords
  const isTrending = (text: string): boolean => {
    const trendingKeywords = ['breaking', 'urgent', 'major', 'historic', 'unprecedented', 'massive', 'global', 'worldwide'];
    const lowerText = text.toLowerCase();
    return trendingKeywords.some(keyword => lowerText.includes(keyword));
  };

  const fullText = `${gNewsArticle.title} ${gNewsArticle.description || ''} ${gNewsArticle.content || ''}`;
  
  return {
    id: `gnews-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: gNewsArticle.title,
    content: gNewsArticle.content || gNewsArticle.description || '',
    summary: gNewsArticle.description || gNewsArticle.title,
    source: gNewsArticle.source.name,
    country: getCountryFromSource(gNewsArticle.source.name),
    countryCode: getCountryCodeFromSource(gNewsArticle.source.name),
    author: extractAuthorFromContent(gNewsArticle.content) || 'Staff Reporter',
    publishedAt: gNewsArticle.publishedAt,
    imageUrl: gNewsArticle.image || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: getCategoryFromContent(fullText),
    event: generateEventId(gNewsArticle.title),
    sentiment: getSentiment(fullText),
    biasScore: getBiasScore(fullText),
    originalLanguage: 'en',
    readTime: Math.ceil((gNewsArticle.content?.length || 500) / 200), // Rough estimate: 200 words per minute
    tags: extractTags(fullText),
    url: gNewsArticle.url,
    trending: isTrending(fullText),
    channel: gNewsArticle.source.name
  };
};

// Helper functions
const getCountryFromSource = (sourceName: string): string => {
  const sourceCountryMap: { [key: string]: string } = {
    'BBC News': 'United Kingdom',
    'BBC': 'United Kingdom',
    'CNN': 'United States',
    'Fox News': 'United States',
    'The Guardian': 'United Kingdom',
    'Reuters': 'United Kingdom',
    'Associated Press': 'United States',
    'AP News': 'United States',
    'Al Jazeera': 'Qatar',
    'Al Jazeera English': 'Qatar',
    'Deutsche Welle': 'Germany',
    'DW': 'Germany',
    'France 24': 'France',
    'RT': 'Russia',
    'CGTN': 'China',
    'NHK World': 'Japan',
    'Times of India': 'India',
    'Dawn': 'Pakistan',
    'Arab News': 'Saudi Arabia',
    'The New York Times': 'United States',
    'The Washington Post': 'United States',
    'The Wall Street Journal': 'United States',
    'Financial Times': 'United Kingdom',
    'Le Monde': 'France',
    'Der Spiegel': 'Germany',
    'La Repubblica': 'Italy',
    'El País': 'Spain',
    'The Times of Israel': 'Israel',
    'Haaretz': 'Israel',
    'The Hindu': 'India',
    'South China Morning Post': 'Hong Kong',
    'The Japan Times': 'Japan',
    'The Australian': 'Australia',
    'Globe and Mail': 'Canada',
    'Toronto Star': 'Canada',
    'PhoneArena': 'United States'
  };
  
  // Try exact match first
  if (sourceCountryMap[sourceName]) {
    return sourceCountryMap[sourceName];
  }
  
  // Try partial match
  for (const [source, country] of Object.entries(sourceCountryMap)) {
    if (sourceName.toLowerCase().includes(source.toLowerCase()) || 
        source.toLowerCase().includes(sourceName.toLowerCase())) {
      return country;
    }
  }
  
  return 'International';
};

const getCountryCodeFromSource = (sourceName: string): string => {
  const country = getCountryFromSource(sourceName);
  const countryCodeMap: { [key: string]: string } = {
    'United Kingdom': 'gb',
    'United States': 'us',
    'Germany': 'de',
    'France': 'fr',
    'Qatar': 'qa',
    'Russia': 'ru',
    'China': 'cn',
    'Japan': 'jp',
    'India': 'in',
    'Pakistan': 'pk',
    'Saudi Arabia': 'sa',
    'Italy': 'it',
    'Spain': 'es',
    'Israel': 'il',
    'Hong Kong': 'hk',
    'Australia': 'au',
    'Canada': 'ca',
    'International': 'un'
  };
  
  return countryCodeMap[country] || 'un';
};

const getCategoryFromContent = (content: string): string => {
  const categories = {
    'Politics': ['election', 'government', 'president', 'minister', 'parliament', 'congress', 'senate', 'political', 'vote', 'campaign'],
    'Economy': ['economy', 'market', 'stock', 'trade', 'business', 'finance', 'gdp', 'inflation', 'economic', 'financial', 'bank'],
    'Technology': ['technology', 'tech', 'ai', 'artificial intelligence', 'software', 'app', 'digital', 'cyber', 'internet', 'computer', 'pixel', 'google', 'apple', 'microsoft'],
    'Health': ['health', 'medical', 'hospital', 'doctor', 'vaccine', 'virus', 'disease', 'covid', 'pandemic', 'medicine'],
    'Environment': ['climate', 'environment', 'global warming', 'pollution', 'renewable', 'carbon', 'green', 'sustainability'],
    'Sports': ['sports', 'football', 'soccer', 'basketball', 'olympics', 'championship', 'match', 'game', 'athlete'],
    'Science': ['science', 'research', 'study', 'discovery', 'space', 'nasa', 'experiment', 'scientific'],
    'International': ['international', 'global', 'world', 'foreign', 'diplomatic', 'treaty', 'summit', 'alliance']
  };
  
  const lowerContent = content.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    const matchCount = keywords.filter(keyword => lowerContent.includes(keyword)).length;
    if (matchCount >= 2) { // Require at least 2 keyword matches for better accuracy
      return category;
    }
  }
  
  // Single keyword match as fallback
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
    'technology', 'health', 'environment', 'sports', 'science', 'business',
    'world', 'crisis', 'summit', 'agreement', 'conflict', 'peace'
  ];
  
  const lowerContent = content.toLowerCase();
  return commonTags.filter(tag => lowerContent.includes(tag)).slice(0, 5);
};

const extractAuthorFromContent = (content: string): string | null => {
  if (!content) return null;
  
  // Look for common author patterns
  const authorPatterns = [
    /By\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    /Written by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/,
    /Author:\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/
  ];
  
  for (const pattern of authorPatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  fallbackData?: T
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('GNews API Error:', error);
    if (fallbackData) {
      return fallbackData;
    }
    throw error;
  }
};

// Available countries for GNews API - from official documentation
export const GNEWS_COUNTRIES = [
  { code: 'au', name: 'Australia' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'cn', name: 'China' },
  { code: 'eg', name: 'Egypt' },
  { code: 'fr', name: 'France' },
  { code: 'de', name: 'Germany' },
  { code: 'gr', name: 'Greece' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'in', name: 'India' },
  { code: 'ie', name: 'Ireland' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russian Federation' },
  { code: 'sg', name: 'Singapore' },
  { code: 'es', name: 'Spain' },
  { code: 'se', name: 'Sweden' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' }
];

// Available categories for GNews API - from official documentation
export const GNEWS_CATEGORIES = [
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health'
];
import { useState, useEffect } from 'react';
import { 
  fetchTopHeadlines,
  searchArticles,
  convertGNewsToArticle,
  withErrorHandling,
  GNEWS_COUNTRIES,
  GNEWS_CATEGORIES
} from '../services/gNewsApi';
import { Article } from '../types';
import { mockArticles } from '../data/mockData';
import { useNotifications } from './useNotifications';
import cacheService from '../services/cacheService';

interface UseCachedNewsApiOptions {
  query?: string;
  country?: string;
  category?: string;
  sources?: string;
  pageSize?: number;
  autoFetch?: boolean;
  cacheFirst?: boolean; // Whether to try cache first
  maxCacheAge?: number; // Max age in milliseconds before forcing refresh
}

interface UseCachedNewsApiReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  sources: any[];
  loadingSources: boolean;
  isUsingCache: boolean;
  cacheAge: number | null;
  forceRefresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useCachedNewsApi = (options: UseCachedNewsApiOptions = {}): UseCachedNewsApiReturn => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  
  const { checkForNotifications } = useNotifications();

  const {
    query,
    country,
    category,
    sources: sourcesFilter,
    pageSize = 20,
    autoFetch = true,
    cacheFirst = true,
    maxCacheAge = 30 * 60 * 1000 // 30 minutes default
  } = options;

  // Convert country name to country code for GNews API
  const getCountryCode = (countryName?: string): string | undefined => {
    if (!countryName) return undefined;
    
    const countryMap: { [key: string]: string } = {
      'Australia': 'au',
      'Brazil': 'br',
      'Canada': 'ca',
      'China': 'cn',
      'Egypt': 'eg',
      'France': 'fr',
      'Germany': 'de',
      'Greece': 'gr',
      'Hong Kong': 'hk',
      'India': 'in',
      'Ireland': 'ie',
      'Italy': 'it',
      'Japan': 'jp',
      'Netherlands': 'nl',
      'Norway': 'no',
      'Pakistan': 'pk',
      'Peru': 'pe',
      'Philippines': 'ph',
      'Portugal': 'pt',
      'Romania': 'ro',
      'Russian Federation': 'ru',
      'Singapore': 'sg',
      'Spain': 'es',
      'Sweden': 'se',
      'Switzerland': 'ch',
      'Taiwan': 'tw',
      'Ukraine': 'ua',
      'United Kingdom': 'gb',
      'United States': 'us'
    };
    
    return countryMap[countryName] || countryName.toLowerCase().slice(0, 2);
  };

  // Convert category to GNews category
  const getGNewsCategory = (categoryName?: string): string | undefined => {
    if (!categoryName) return undefined;
    
    const categoryMap: { [key: string]: string } = {
      'Politics': 'nation',
      'Economy': 'business',
      'Technology': 'technology',
      'Health': 'health',
      'Science': 'science',
      'Sports': 'sports',
      'International': 'world',
      'Environment': 'science',
      'Culture': 'entertainment',
      'General': 'general'
    };
    
    return categoryMap[categoryName] || categoryName.toLowerCase();
  };

  // Check if error is a quota/rate limit error
  const isQuotaError = (errorMessage: string): boolean => {
    const quotaKeywords = [
      'quota',
      'rate limit',
      'daily limit',
      'forbidden',
      '403',
      'too many requests',
      '429'
    ];
    
    return quotaKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Check if error is a service unavailable error
  const isServiceError = (errorMessage: string): boolean => {
    const serviceKeywords = [
      'service unavailable',
      'server error',
      'maintenance',
      '500',
      '503',
      'network error',
      'cors error',
      'failed to fetch'
    ];
    
    return serviceKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const fetchFromAPI = async (forceRefresh = false): Promise<Article[]> => {
    const countryCode = getCountryCode(country);
    const gNewsCategory = getGNewsCategory(category);
    
    console.log('Fetching from API with options:', { query, countryCode, gNewsCategory, pageSize });
    
    let gNewsResponse;
    
    if (query) {
      // Use search endpoint when there's a query
      console.log('Using search endpoint for query:', query);
      gNewsResponse = await withErrorHandling(
        () => searchArticles(
          query,
          'en', // language
          countryCode,
          Math.min(pageSize, 100), // GNews max is 100
          undefined, // from date
          undefined, // to date
          'publishedAt' // sort by
        ),
        null
      );
    } else {
      // Use top headlines when no query
      console.log('Using top headlines endpoint');
      gNewsResponse = await withErrorHandling(
        () => fetchTopHeadlines(
          countryCode,
          gNewsCategory,
          'en', // language
          Math.min(pageSize, 100) // GNews max is 100
        ),
        null
      );
    }

    if (gNewsResponse && gNewsResponse.articles && gNewsResponse.articles.length > 0) {
      console.log(`Successfully fetched ${gNewsResponse.articles.length} articles from GNews`);
      
      let convertedArticles = gNewsResponse.articles.map(article => 
        convertGNewsToArticle(article)
      );

      // Apply source filter if specified
      if (sourcesFilter) {
        const sourceList = sourcesFilter.split(',').map(s => s.trim().toLowerCase());
        convertedArticles = convertedArticles.filter(article => 
          sourceList.some(source => article.source.toLowerCase().includes(source))
        );
      }

      // Cache the results
      await cacheService.cacheArticles(convertedArticles, {
        query,
        country,
        category,
        sources: sourcesFilter,
        pageSize
      });

      return convertedArticles;
    } else {
      throw new Error('No articles returned from API');
    }
  };

  const fetchFromCache = async (): Promise<Article[] | null> => {
    const cachedArticles = await cacheService.getCachedArticles({
      query,
      country,
      category,
      sources: sourcesFilter,
      pageSize
    });

    if (cachedArticles) {
      const age = await cacheService.getCacheAge({
        type: 'articles',
        query,
        country,
        category,
        sources: sourcesFilter,
        pageSize
      });
      
      setCacheAge(age);
      console.log(`Using cached articles (age: ${age ? Math.round(age / 1000 / 60) : 'unknown'} minutes)`);
    }

    return cachedArticles;
  };

  const fetchArticles = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsUsingCache(false);
    setCacheAge(null);

    try {
      let articlesToUse: Article[] | null = null;

      // Try cache first if enabled and not forcing refresh
      if (cacheFirst && !forceRefresh) {
        articlesToUse = await fetchFromCache();
        
        // Check if cache is too old
        if (articlesToUse && cacheAge && cacheAge > maxCacheAge) {
          console.log('Cache is too old, fetching fresh data');
          articlesToUse = null;
        }
      }

      // If no cache or cache is stale, try API
      if (!articlesToUse) {
        try {
          articlesToUse = await fetchFromAPI(forceRefresh);
          setIsUsingCache(false);
          setCacheAge(null);
        } catch (apiError) {
          console.error('API fetch failed:', apiError);
          const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to fetch news';
          
          // Handle different types of errors gracefully
          if (isQuotaError(errorMessage)) {
            // Quota exceeded - try cache as fallback
            console.log('API quota exceeded, trying cache fallback');
            articlesToUse = await fetchFromCache();
            if (articlesToUse) {
              setIsUsingCache(true);
              setError('Daily API limit reached. Showing cached articles.');
            }
          } else if (isServiceError(errorMessage)) {
            // Service unavailable - try cache as fallback
            console.log('Service unavailable, trying cache fallback');
            articlesToUse = await fetchFromCache();
            if (articlesToUse) {
              setIsUsingCache(true);
              setError('News service temporarily unavailable. Showing cached articles.');
            }
          } else {
            // Other errors - try cache as fallback
            console.log('API error, trying cache fallback');
            articlesToUse = await fetchFromCache();
            if (articlesToUse) {
              setIsUsingCache(true);
              setError('Unable to fetch latest news. Showing cached articles.');
            }
          }
        }
      } else {
        setIsUsingCache(true);
      }

      // Final fallback to mock data
      if (!articlesToUse) {
        console.log('Using mock data as final fallback');
        articlesToUse = mockArticles;
        setIsUsingCache(true);
        setError('Unable to load news. Showing sample articles.');
      }

      setArticles(articlesToUse);
      
      // Check for notifications with new articles (only for fresh data)
      if (!isUsingCache) {
        checkForNotifications(articlesToUse);
      }
      
      // Extract unique sources for the sources list
      const uniqueSources = [...new Set(articlesToUse.map(article => article.source))]
        .map(sourceName => ({ name: sourceName, id: sourceName.toLowerCase().replace(/\s+/g, '-') }));
      setSources(uniqueSources);
      
    } catch (err) {
      console.error('Error in fetchArticles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news';
      setError(errorMessage);
      
      // Use mock data as final fallback
      setArticles(mockArticles);
      setSources([]);
      setIsUsingCache(true);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    await fetchArticles(true);
  };

  const clearCache = async () => {
    try {
      await cacheService.clear();
      console.log('Cache cleared successfully');
      // Refetch after clearing cache
      await fetchArticles(true);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const fetchSourcesList = async () => {
    setLoadingSources(true);
    try {
      // GNews doesn't have a dedicated sources endpoint, so we'll create a list from available data
      const mockSources = [
        { name: 'BBC News', id: 'bbc-news' },
        { name: 'CNN', id: 'cnn' },
        { name: 'Reuters', id: 'reuters' },
        { name: 'Associated Press', id: 'associated-press' },
        { name: 'The Guardian', id: 'the-guardian' },
        { name: 'Al Jazeera', id: 'al-jazeera' },
        { name: 'Deutsche Welle', id: 'deutsche-welle' },
        { name: 'France 24', id: 'france-24' },
        { name: 'The New York Times', id: 'the-new-york-times' },
        { name: 'The Washington Post', id: 'the-washington-post' }
      ];
      setSources(mockSources);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setSources([]);
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchArticles();
    }
  }, [query, country, category, sourcesFilter, pageSize, autoFetch]);

  useEffect(() => {
    fetchSourcesList();
  }, []);

  // Cleanup expired cache entries on mount
  useEffect(() => {
    cacheService.cleanupExpired().then(deletedCount => {
      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} expired cache entries`);
      }
    });
  }, []);

  return {
    articles,
    loading,
    error,
    refetch: () => fetchArticles(false),
    sources,
    loadingSources,
    isUsingCache,
    cacheAge,
    forceRefresh,
    clearCache
  };
};

// Hook for live TV channels with caching
export const useCachedLiveChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUsingCache, setIsUsingCache] = useState(false);

  const fetchLiveChannels = async (forceRefresh = false) => {
    setLoading(true);
    setIsUsingCache(false);

    try {
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedChannels = await cacheService.getCachedLiveChannels();
        if (cachedChannels) {
          setChannels(cachedChannels as any);
          setIsUsingCache(true);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data (in real app, this would be an API call)
      const mockChannels = [
        {
          id: '1',
          name: 'BBC World News',
          country: 'United Kingdom',
          streamUrl: import.meta.env.VITE_BBC_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          isOnline: true
        },
        {
          id: '2',
          name: 'CNN International',
          country: 'United States',
          streamUrl: import.meta.env.VITE_CNN_STREAM_URL || 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          isOnline: true
        }
      ];

      // Cache the results
      await cacheService.cacheLiveChannels(mockChannels);
      
      setChannels(mockChannels as any);
      setIsUsingCache(false);
    } catch (error) {
      console.error('Error fetching live channels:', error);
      
      // Try cache as fallback
      const cachedChannels = await cacheService.getCachedLiveChannels();
      if (cachedChannels) {
        setChannels(cachedChannels as any);
        setIsUsingCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveChannels();
  }, []);

  return { 
    channels, 
    loading, 
    refetch: () => fetchLiveChannels(false),
    forceRefresh: () => fetchLiveChannels(true),
    isUsingCache
  };
};

// Export available countries and categories for use in components
export { GNEWS_COUNTRIES, GNEWS_CATEGORIES };
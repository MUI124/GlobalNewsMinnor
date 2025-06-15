// Cache service for persistent news storage and offline support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  source: string;
  metadata?: Record<string, any>;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  source?: string;
  metadata?: Record<string, any>;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number; // Approximate size in bytes
  oldestEntry: number;
  newestEntry: number;
}

class CacheService {
  private dbName = 'GlobalNewsMirrorCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private storeName = 'newsCache';
  private maxCacheSize = 50 * 1024 * 1024; // 50MB limit
  private defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for news cache
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('source', 'source', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  private generateCacheKey(params: Record<string, any>): string {
    // Create a consistent cache key from parameters
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          result[key] = params[key];
        }
        return result;
      }, {} as Record<string, any>);

    return btoa(JSON.stringify(sortedParams)).replace(/[/+=]/g, '');
  }

  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    const now = Date.now();
    const ttl = options.ttl || this.defaultTTL;
    
    const entry: CacheEntry<T> & { key: string } = {
      key,
      data,
      timestamp: now,
      expiresAt: now + ttl,
      source: options.source || 'unknown',
      metadata: options.metadata
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(entry);
      
      request.onsuccess = () => {
        console.log(`Cached data with key: ${key}`);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to cache data:', request.error);
        reject(request.error);
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> & { key: string };
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
          console.log(`Cache entry expired for key: ${key}`);
          this.delete(key); // Clean up expired entry
          resolve(null);
          return;
        }

        console.log(`Cache hit for key: ${key}`);
        resolve(entry.data);
      };

      request.onerror = () => {
        console.error('Failed to get cached data:', request.error);
        reject(request.error);
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        console.log(`Deleted cache entry: ${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete cache entry:', request.error);
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Cache cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear cache:', request.error);
        reject(request.error);
      };
    });
  }

  async getStats(): Promise<CacheStats> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        
        if (entries.length === 0) {
          resolve({
            totalEntries: 0,
            totalSize: 0,
            oldestEntry: 0,
            newestEntry: 0
          });
          return;
        }

        const timestamps = entries.map(entry => entry.timestamp);
        const totalSize = JSON.stringify(entries).length; // Approximate size

        resolve({
          totalEntries: entries.length,
          totalSize,
          oldestEntry: Math.min(...timestamps),
          newestEntry: Math.max(...timestamps)
        });
      };

      request.onerror = () => {
        console.error('Failed to get cache stats:', request.error);
        reject(request.error);
      };
    });
  }

  async cleanupExpired(): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const now = Date.now();
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      
      // Get all expired entries
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`Cleaned up ${deletedCount} expired cache entries`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        console.error('Failed to cleanup expired entries:', request.error);
        reject(request.error);
      };
    });
  }

  // Cache articles with smart key generation
  async cacheArticles(
    articles: any[], 
    params: {
      query?: string;
      country?: string;
      category?: string;
      sources?: string;
      pageSize?: number;
    },
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = this.generateCacheKey({
      type: 'articles',
      ...params
    });

    await this.set(cacheKey, articles, {
      ttl: options.ttl || this.defaultTTL,
      source: 'news-api',
      metadata: {
        articleCount: articles.length,
        params,
        cachedAt: new Date().toISOString()
      }
    });
  }

  // Get cached articles
  async getCachedArticles(params: {
    query?: string;
    country?: string;
    category?: string;
    sources?: string;
    pageSize?: number;
  }): Promise<any[] | null> {
    const cacheKey = this.generateCacheKey({
      type: 'articles',
      ...params
    });

    return await this.get<any[]>(cacheKey);
  }

  // Cache video bulletins
  async cacheVideoBulletins(
    bulletins: any[],
    params: {
      channel?: string;
      timeSlot?: string;
      date?: string;
      searchQuery?: string;
    },
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = this.generateCacheKey({
      type: 'video-bulletins',
      ...params
    });

    await this.set(cacheKey, bulletins, {
      ttl: options.ttl || this.defaultTTL,
      source: 'video-api',
      metadata: {
        bulletinCount: bulletins.length,
        params,
        cachedAt: new Date().toISOString()
      }
    });
  }

  // Get cached video bulletins
  async getCachedVideoBulletins(params: {
    channel?: string;
    timeSlot?: string;
    date?: string;
    searchQuery?: string;
  }): Promise<any[] | null> {
    const cacheKey = this.generateCacheKey({
      type: 'video-bulletins',
      ...params
    });

    return await this.get<any[]>(cacheKey);
  }

  // Cache live channels
  async cacheLiveChannels(
    channels: any[],
    options: CacheOptions = {}
  ): Promise<void> {
    const cacheKey = 'live-channels';

    await this.set(cacheKey, channels, {
      ttl: options.ttl || 30 * 60 * 1000, // 30 minutes for live data
      source: 'live-tv-api',
      metadata: {
        channelCount: channels.length,
        cachedAt: new Date().toISOString()
      }
    });
  }

  // Get cached live channels
  async getCachedLiveChannels(): Promise<any[] | null> {
    return await this.get<any[]>('live-channels');
  }

  // Check if we're in offline mode
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Get cache age for display
  async getCacheAge(params: Record<string, any>): Promise<number | null> {
    const cacheKey = this.generateCacheKey(params);
    
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          resolve(Date.now() - entry.timestamp);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, RefreshCw, Clock, Database } from 'lucide-react';
import cacheService from '../../services/cacheService';

interface CacheSettingsProps {
  onCacheCleared?: () => void;
}

const CacheSettings: React.FC<CacheSettingsProps> = ({ onCacheCleared }) => {
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    totalSize: 0,
    oldestEntry: 0,
    newestEntry: 0
  });
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadCacheStats = async () => {
    setLoading(true);
    try {
      const stats = await cacheService.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setClearing(true);
    try {
      await cacheService.clear();
      await loadCacheStats();
      onCacheCleared?.();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setClearing(false);
    }
  };

  const cleanupExpired = async () => {
    setLoading(true);
    try {
      const deletedCount = await cacheService.cleanupExpired();
      await loadCacheStats();
      console.log(`Cleaned up ${deletedCount} expired entries`);
    } catch (error) {
      console.error('Failed to cleanup expired entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Cache Management</h3>
        </div>
        <button
          onClick={loadCacheStats}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total Entries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Cache Size</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatBytes(cacheStats.totalSize)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Oldest Entry</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{formatDate(cacheStats.oldestEntry)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Newest Entry</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{formatDate(cacheStats.newestEntry)}</p>
        </div>
      </div>

      {/* Cache Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Cache Actions</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Cleanup Expired Entries</h5>
              <p className="text-sm text-gray-600">Remove expired cache entries to free up space</p>
            </div>
            <button
              onClick={cleanupExpired}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cleaning...' : 'Cleanup'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Clear All Cache</h5>
                <p className="text-sm text-gray-600">Remove all cached data (this will force fresh API calls)</p>
              </div>
              <button
                onClick={clearCache}
                disabled={clearing || cacheStats.totalEntries === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{clearing ? 'Clearing...' : 'Clear Cache'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Caching Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Articles are cached for 24 hours by default</li>
          <li>• Live TV data is cached for 30 minutes</li>
          <li>• Cache is automatically used when API quota is exceeded</li>
          <li>• Offline mode automatically uses cached data</li>
          <li>• Cache is stored locally in your browser</li>
        </ul>
      </div>
    </div>
  );
};

export default CacheSettings;
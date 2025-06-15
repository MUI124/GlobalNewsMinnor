import React from 'react';
import { Wifi, WifiOff, Clock, HardDrive, RefreshCw } from 'lucide-react';

interface CacheIndicatorProps {
  isUsingCache: boolean;
  cacheAge?: number | null;
  onRefresh?: () => void;
  onClearCache?: () => void;
  loading?: boolean;
  className?: string;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({
  isUsingCache,
  cacheAge,
  onRefresh,
  onClearCache,
  loading = false,
  className = ''
}) => {
  const formatCacheAge = (age: number): string => {
    const minutes = Math.floor(age / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const getCacheStatus = () => {
    if (loading) {
      return {
        icon: RefreshCw,
        text: 'Loading...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    if (isUsingCache) {
      const isStale = cacheAge && cacheAge > 30 * 60 * 1000; // 30 minutes
      return {
        icon: HardDrive,
        text: cacheAge ? `Cached ${formatCacheAge(cacheAge)}` : 'Cached',
        color: isStale ? 'text-amber-600' : 'text-green-600',
        bgColor: isStale ? 'bg-amber-50' : 'bg-green-50',
        borderColor: isStale ? 'border-amber-200' : 'border-green-200'
      };
    }

    return {
      icon: Wifi,
      text: 'Live',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const status = getCacheStatus();
  const IconComponent = status.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${status.bgColor} ${status.borderColor} ${status.color}`}>
        <IconComponent className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">{status.text}</span>
      </div>

      {/* Action buttons */}
      {(onRefresh || onClearCache) && (
        <div className="flex items-center space-x-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onClearCache && isUsingCache && (
            <button
              onClick={onClearCache}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Clear cache"
            >
              <WifiOff className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CacheIndicator;
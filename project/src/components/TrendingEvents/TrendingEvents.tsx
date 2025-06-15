import React from 'react';
import { TrendingUp, Clock, Globe } from 'lucide-react';

interface TrendingEvent {
  id: string;
  title: string;
  category: string;
  articleCount: number;
  trend: 'up' | 'hot' | 'new';
  countries: string[];
}

interface TrendingEventsProps {
  onEventSelect: (eventTitle: string) => void;
}

const TrendingEvents: React.FC<TrendingEventsProps> = ({ onEventSelect }) => {
  const trendingEvents: TrendingEvent[] = [
    {
      id: '1',
      title: 'Climate Summit 2024',
      category: 'Environment',
      articleCount: 156,
      trend: 'hot',
      countries: ['🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷']
    },
    {
      id: '2',
      title: 'AI Regulation Debate',
      category: 'Technology',
      articleCount: 89,
      trend: 'up',
      countries: ['🇺🇸', '🇨🇳', '🇯🇵']
    },
    {
      id: '3',
      title: 'Global Trade Agreement',
      category: 'Economy',
      articleCount: 67,
      trend: 'new',
      countries: ['🇺🇸', '🇬🇧', '🇨🇦']
    },
    {
      id: '4',
      title: 'Space Exploration Mission',
      category: 'Science',
      articleCount: 45,
      trend: 'up',
      countries: ['🇺🇸', '🇯🇵', '🇮🇳']
    },
    {
      id: '5',
      title: 'Energy Crisis Response',
      category: 'Politics',
      articleCount: 123,
      trend: 'hot',
      countries: ['🇩🇪', '🇫🇷', '🇮🇹']
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <span className="text-red-500">🔥</span>;
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'new':
        return <span className="text-blue-500">✨</span>;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'hot':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'up':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'new':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Trending Events</h2>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated 5 min ago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {trendingEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventSelect(event.title)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md text-left ${getTrendColor(event.trend)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded-full">
                {event.category}
              </span>
              {getTrendIcon(event.trend)}
            </div>
            
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {event.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{event.articleCount} articles</span>
              </div>
              <div className="flex items-center space-x-1">
                {event.countries.slice(0, 3).map((flag, index) => (
                  <span key={index} className="text-sm">{flag}</span>
                ))}
                {event.countries.length > 3 && (
                  <span className="text-xs text-gray-500">+{event.countries.length - 3}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingEvents;
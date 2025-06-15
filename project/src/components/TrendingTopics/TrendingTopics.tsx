import React from 'react';
import { TrendingUp, Clock, Globe, Play, Eye } from 'lucide-react';

interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  videoCount: number;
  viewCount: string;
  trend: 'up' | 'hot' | 'new';
  thumbnail: string;
  duration: string;
  channel: string;
  flag: string;
}

interface TrendingTopicsProps {
  onTopicSelect: (topicTitle: string) => void;
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ onTopicSelect }) => {
  const trendingTopics: TrendingTopic[] = [
    {
      id: '1',
      title: 'Breaking: Major Earthquake Hits Pacific Region',
      category: 'Breaking News',
      videoCount: 45,
      viewCount: '2.3M',
      trend: 'hot',
      thumbnail: 'https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '12:34',
      channel: 'CNN',
      flag: '🇺🇸'
    },
    {
      id: '2',
      title: 'Climate Summit 2024: World Leaders Gather',
      category: 'Environment',
      videoCount: 67,
      viewCount: '1.8M',
      trend: 'up',
      thumbnail: 'https://images.pexels.com/photos/87611/earth-blue-planet-globe-planet-87611.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '8:45',
      channel: 'BBC News',
      flag: '🇬🇧'
    },
    {
      id: '3',
      title: 'Tech Giants Face New AI Regulations',
      category: 'Technology',
      videoCount: 23,
      viewCount: '956K',
      trend: 'new',
      thumbnail: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '15:22',
      channel: 'Reuters',
      flag: '🇬🇧'
    },
    {
      id: '4',
      title: 'Global Markets React to Trade Agreement',
      category: 'Economy',
      videoCount: 34,
      viewCount: '1.2M',
      trend: 'up',
      thumbnail: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '6:18',
      channel: 'Al Jazeera',
      flag: '🇶🇦'
    },
    {
      id: '5',
      title: 'Space Mission Achieves Historic Milestone',
      category: 'Science',
      videoCount: 18,
      viewCount: '743K',
      trend: 'hot',
      thumbnail: 'https://images.pexels.com/photos/73871/rocket-launch-rocket-take-off-nasa-73871.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '9:56',
      channel: 'Deutsche Welle',
      flag: '🇩🇪'
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
        return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100';
      case 'up':
        return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100';
      case 'new':
        return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Trending Now</h2>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Updated 2 min ago</span>
        </div>
      </div>

      <div className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.title)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-left ${getTrendColor(topic.trend)}`}
          >
            <div className="flex items-start space-x-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={topic.thumbnail}
                  alt={topic.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white px-1 py-0.5 rounded text-xs">
                  {topic.duration}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded-full">
                    {topic.category}
                  </span>
                  {getTrendIcon(topic.trend)}
                </div>
                
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {topic.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span>{topic.flag}</span>
                      <span className="text-gray-600">{topic.channel}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="h-3 w-3" />
                      <span>{topic.videoCount} videos</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{topic.viewCount} views</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <button className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
          View All Trending Topics →
        </button>
      </div>
    </div>
  );
};

export default TrendingTopics;
import React, { useState } from 'react';
import { Radio, Globe, Clock, Users, Filter } from 'lucide-react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

interface LiveChannel {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  language: string;
  category: string;
  viewers: number;
  streamUrl: string;
  isOnline: boolean;
  description: string;
  logo: string;
}

const LiveChannels: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [filters, setFilters] = useState({
    country: '',
    language: '',
    category: ''
  });

  const liveChannels: LiveChannel[] = [
    {
      id: '1',
      name: 'BBC World News',
      country: 'United Kingdom',
      countryCode: 'GB',
      flag: '🇬🇧',
      language: 'English',
      category: 'International',
      viewers: 45230,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: true,
      description: 'Global news and current affairs',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '2',
      name: 'CNN International',
      country: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      language: 'English',
      category: 'Breaking News',
      viewers: 67890,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: true,
      description: 'Breaking news and analysis',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '3',
      name: 'ARY News',
      country: 'Pakistan',
      countryCode: 'PK',
      flag: '🇵🇰',
      language: 'Urdu',
      category: 'Regional',
      viewers: 23450,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: true,
      description: 'Pakistani news and current affairs',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '4',
      name: 'Al Jazeera English',
      country: 'Qatar',
      countryCode: 'QA',
      flag: '🇶🇦',
      language: 'English',
      category: 'International',
      viewers: 34560,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: true,
      description: 'Middle Eastern perspective on global news',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '5',
      name: 'Deutsche Welle',
      country: 'Germany',
      countryCode: 'DE',
      flag: '🇩🇪',
      language: 'English',
      category: 'International',
      viewers: 18920,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: false,
      description: 'German international broadcaster',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '6',
      name: 'France 24',
      country: 'France',
      countryCode: 'FR',
      flag: '🇫🇷',
      language: 'English',
      category: 'International',
      viewers: 21340,
      streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      isOnline: true,
      description: 'French international news channel',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const filteredChannels = liveChannels.filter(channel => {
    if (filters.country && channel.country !== filters.country) return false;
    if (filters.language && channel.language !== filters.language) return false;
    if (filters.category && channel.category !== filters.category) return false;
    return true;
  });

  const countries = [...new Set(liveChannels.map(c => c.country))];
  const languages = [...new Set(liveChannels.map(c => c.language))];
  const categories = [...new Set(liveChannels.map(c => c.category))];

  const handleChannelSelect = (channel: LiveChannel) => {
    if (channel.isOnline) {
      setSelectedChannel(channel);
    }
  };

  const handleVideoError = () => {
    if (selectedChannel) {
      setSelectedChannel({ ...selectedChannel, isOnline: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Live News Channels</h2>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Live Now</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredChannels.filter(c => c.isOnline).length} channels online
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Channels</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Player */}
      {selectedChannel && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src={selectedChannel.logo} 
                alt={selectedChannel.name}
                className="w-8 h-8 rounded"
              />
              <h3 className="text-xl font-semibold text-gray-900">{selectedChannel.name}</h3>
              <span className="text-lg">{selectedChannel.flag}</span>
              <div className="flex items-center space-x-1 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{selectedChannel.description}</p>
          </div>
          
          <VideoPlayer
            src={selectedChannel.streamUrl}
            title={selectedChannel.name}
            isLive={true}
            onError={handleVideoError}
          />
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{selectedChannel.viewers.toLocaleString()} viewers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{selectedChannel.language}</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{selectedChannel.category}</span>
          </div>
        </div>
      )}

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelSelect(channel)}
            disabled={!channel.isOnline}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left transition-all duration-200 ${
              channel.isOnline 
                ? 'hover:shadow-md hover:scale-105 cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            } ${
              selectedChannel?.id === channel.id 
                ? 'ring-2 ring-primary-500 border-primary-200' 
                : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{channel.name}</h3>
                  <span className="text-lg">{channel.flag}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{channel.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {channel.isOnline ? (
                      <div className="flex items-center space-x-1 text-xs text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Offline</span>
                    )}
                    <span className="text-xs text-gray-500">{channel.language}</span>
                  </div>
                  {channel.isOnline && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{(channel.viewers / 1000).toFixed(1)}k</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Radio className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No channels match your filters</p>
            <button
              onClick={() => setFilters({ country: '', language: '', category: '' })}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChannels;
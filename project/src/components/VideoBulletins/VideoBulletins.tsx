import React, { useState } from 'react';
import { Play, Clock, Calendar, Search, Mic } from 'lucide-react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import VoiceSearch from '../VoiceSearch/VoiceSearch';

interface VideoBulletin {
  id: string;
  title: string;
  channel: string;
  country: string;
  flag: string;
  timeSlot: string;
  date: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  category: string;
  isAvailable: boolean;
}

const VideoBulletins: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBulletin, setSelectedBulletin] = useState<VideoBulletin | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [filters, setFilters] = useState({
    channel: '',
    timeSlot: '',
    date: ''
  });

  const bulletins: VideoBulletin[] = [
    {
      id: '1',
      title: 'BBC World News - Morning Headlines',
      channel: 'BBC News',
      country: 'United Kingdom',
      flag: '🇬🇧',
      timeSlot: '9:00 AM',
      date: '2024-01-15',
      duration: 1800, // 30 minutes
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: 'Global news roundup covering major international events',
      category: 'Morning News',
      isAvailable: true
    },
    {
      id: '2',
      title: 'CNN International - Evening Update',
      channel: 'CNN',
      country: 'United States',
      flag: '🇺🇸',
      timeSlot: '10:00 PM',
      date: '2024-01-14',
      duration: 3600, // 60 minutes
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: 'Breaking news analysis and in-depth reporting',
      category: 'Prime Time',
      isAvailable: true
    },
    {
      id: '3',
      title: 'ARY News - 10 PM Headlines',
      channel: 'ARY News',
      country: 'Pakistan',
      flag: '🇵🇰',
      timeSlot: '10:00 PM',
      date: '2024-01-14',
      duration: 1800,
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: 'Pakistani national and international news coverage',
      category: 'Prime Time',
      isAvailable: true
    },
    {
      id: '4',
      title: 'Al Jazeera - Midday Report',
      channel: 'Al Jazeera',
      country: 'Qatar',
      flag: '🇶🇦',
      timeSlot: '12:00 PM',
      date: '2024-01-15',
      duration: 1800,
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: 'Middle Eastern perspective on global affairs',
      category: 'Midday News',
      isAvailable: false
    },
    {
      id: '5',
      title: 'Deutsche Welle - Morning Brief',
      channel: 'Deutsche Welle',
      country: 'Germany',
      flag: '🇩🇪',
      timeSlot: '8:00 AM',
      date: '2024-01-15',
      duration: 900, // 15 minutes
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      description: 'European news and analysis',
      category: 'Morning News',
      isAvailable: true
    }
  ];

  const parseSearchQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Extract channel
    const channelMatches = bulletins.map(b => b.channel.toLowerCase()).find(channel => 
      lowerQuery.includes(channel.toLowerCase())
    );
    
    // Extract time patterns
    const timePatterns = [
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(morning|evening|night|midday|noon)/i
    ];
    
    let timeSlot = '';
    for (const pattern of timePatterns) {
      const match = lowerQuery.match(pattern);
      if (match) {
        if (match[0].includes('morning')) timeSlot = 'morning';
        else if (match[0].includes('evening') || match[0].includes('night')) timeSlot = 'evening';
        else if (match[0].includes('midday') || match[0].includes('noon')) timeSlot = 'midday';
        else timeSlot = match[0];
        break;
      }
    }
    
    return { channel: channelMatches, timeSlot };
  };

  const filteredBulletins = bulletins.filter(bulletin => {
    // Search query filter
    if (searchQuery) {
      const { channel, timeSlot } = parseSearchQuery(searchQuery);
      
      if (channel && !bulletin.channel.toLowerCase().includes(channel)) return false;
      if (timeSlot) {
        const bulletinTime = bulletin.timeSlot.toLowerCase();
        const bulletinCategory = bulletin.category.toLowerCase();
        
        if (timeSlot === 'morning' && !bulletinCategory.includes('morning')) return false;
        if (timeSlot === 'evening' && !bulletinCategory.includes('prime')) return false;
        if (timeSlot === 'midday' && !bulletinCategory.includes('midday')) return false;
        if (timeSlot !== 'morning' && timeSlot !== 'evening' && timeSlot !== 'midday' && 
            !bulletinTime.includes(timeSlot)) return false;
      }
      
      // General text search
      const generalMatch = bulletin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bulletin.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bulletin.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!channel && !timeSlot && !generalMatch) return false;
    }
    
    // Filter by channel
    if (filters.channel && bulletin.channel !== filters.channel) return false;
    
    // Filter by time slot
    if (filters.timeSlot && bulletin.timeSlot !== filters.timeSlot) return false;
    
    // Filter by date
    if (filters.date && bulletin.date !== filters.date) return false;
    
    return true;
  });

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const channels = [...new Set(bulletins.map(b => b.channel))];
  const timeSlots = [...new Set(bulletins.map(b => b.timeSlot))];
  const dates = [...new Set(bulletins.map(b => b.date))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Video News Bulletins</h2>
        <p className="text-gray-600">Search and watch recorded news bulletins by time, channel, and topic</p>
      </div>

      {/* Search and Voice Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder='Try: "CNN 9 AM headlines" or "BBC morning news"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>
          <VoiceSearch
            onVoiceResult={handleVoiceResult}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.channel}
            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Channels</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
          <select
            value={filters.timeSlot}
            onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Time Slots</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Dates</option>
            {dates.map(date => (
              <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
            ))}
          </select>
        </div>

        {/* Search Examples */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Try these voice commands:</p>
          <div className="flex flex-wrap gap-2">
            {[
              '"CNN 9 AM headlines"',
              '"BBC morning news"',
              '"ARY 10 PM bulletin"',
              '"Show me evening news"'
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(example.replace(/"/g, ''))}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Player */}
      {selectedBulletin && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-lg">{selectedBulletin.flag}</span>
              <h3 className="text-xl font-semibold text-gray-900">{selectedBulletin.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{selectedBulletin.description}</p>
          </div>
          
          <VideoPlayer
            src={selectedBulletin.videoUrl}
            title={selectedBulletin.title}
            isLive={false}
          />
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(selectedBulletin.duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(selectedBulletin.date).toLocaleDateString()}</span>
              </div>
            </div>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{selectedBulletin.category}</span>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'Available Bulletins'}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredBulletins.length} bulletin{filteredBulletins.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredBulletins.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {searchQuery ? 'No bulletins found for your search' : 'No bulletins match your filters'}
              </p>
              <p className="text-gray-400 mb-6">
                That bulletin isn't available right now — try another time or channel.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ channel: '', timeSlot: '', date: '' });
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBulletins.map((bulletin) => (
              <div
                key={bulletin.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                  bulletin.isAvailable 
                    ? 'hover:shadow-md hover:scale-105 cursor-pointer' 
                    : 'opacity-60'
                } ${
                  selectedBulletin?.id === bulletin.id 
                    ? 'ring-2 ring-primary-500 border-primary-200' 
                    : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={bulletin.thumbnail}
                    alt={bulletin.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    {bulletin.isAvailable ? (
                      <button
                        onClick={() => setSelectedBulletin(bulletin)}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                      >
                        <Play className="h-6 w-6 text-white ml-1" />
                      </button>
                    ) : (
                      <div className="text-white text-center">
                        <div className="text-red-400 mb-1">⚠️</div>
                        <p className="text-xs">Not Available</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(bulletin.duration)}
                  </div>
                  <div className="absolute top-2 right-2 text-lg">
                    {bulletin.flag}
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{bulletin.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bulletin.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{bulletin.timeSlot}</span>
                    </div>
                    <span>{new Date(bulletin.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{bulletin.channel}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{bulletin.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoBulletins;
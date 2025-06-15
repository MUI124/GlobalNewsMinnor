import React, { useState } from 'react';
import { Radio, Play, Youtube } from 'lucide-react';
import LiveChannels from '../components/LiveChannels/LiveChannels';
import VideoBulletins from '../components/VideoBulletins/VideoBulletins';
import YouTubeNews from '../components/YouTubeNews/YouTubeNews';

const LiveTV: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'bulletins' | 'youtube'>('youtube');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live TV & Video News</h1>
          <p className="text-gray-600">Watch live news streams, recorded bulletins, and YouTube videos from global channels</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'youtube'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Youtube className="h-5 w-5" />
              <span>YouTube News</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                NEW
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'live'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Radio className="h-5 w-5" />
              <span>Live Channels</span>
              <div className="flex items-center space-x-1 text-xs text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bulletins')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'bulletins'
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Play className="h-5 w-5" />
              <span>Video Bulletins</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'youtube' && <YouTubeNews />}
          {activeTab === 'live' && <LiveChannels />}
          {activeTab === 'bulletins' && <VideoBulletins />}
        </div>
      </div>
    </div>
  );
};

export default LiveTV;
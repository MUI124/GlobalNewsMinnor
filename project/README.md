# Global News Mirror

A comprehensive web application that helps users compare how different countries and news channels report on the same global events. The goal is to reduce bias and misinformation by showing multiple perspectives, AI-generated summaries, tone analysis, and side-by-side comparisons.

## Features

### 🌍 Multi-Perspective News Feed
- Real-time news from multiple international sources
- Smart filtering by country, source, category, and sentiment
- AI-powered bias detection and sentiment analysis

### 🔍 Advanced Search & Discovery
- Voice-powered event search
- Trending events and global timeline
- Interactive world map for country-based filtering
- Smart autocomplete with event suggestions

### 📺 Live TV & Video News
- Live streaming from global news channels
- Video bulletin search and playback
- Natural language queries for specific bulletins
- Multi-language support

### 🤖 AI-Powered Analysis
- Automatic bias scoring and sentiment analysis
- Multi-perspective event summaries
- Keyword highlighting and entity recognition
- Translation support for international content

### 📊 Comparison Tools
- Side-by-side article comparison
- Community polls and user reactions
- Bias explanation and educational content
- Cross-cultural perspective analysis

## API Integration

The application supports multiple news APIs for real-time content:

### Supported News APIs

1. **NewsAPI.org** - Primary news source
   - 70,000+ news sources worldwide
   - Real-time and historical data
   - Country and category filtering

2. **The Guardian API** - Secondary source
   - High-quality journalism
   - Detailed article content
   - Advanced search capabilities

3. **BBC News API** - Premium content
   - Trusted international coverage
   - Video and audio content
   - Multiple language support

### Live TV Streaming

The app supports live news streaming through:
- HLS (.m3u8) streams
- RTMP streaming protocols
- WebRTC for low-latency streams
- Adaptive bitrate streaming

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd global-news-mirror
npm install
```

### 2. Configure API Keys

Copy the example environment file:
```bash
cp .env.example .env
```

Add your API keys to `.env`:

```env
# Required: NewsAPI.org (Free tier available)
VITE_NEWS_API_KEY=your_newsapi_org_key_here

# Optional: Additional news sources
VITE_GUARDIAN_API_KEY=your_guardian_api_key_here
VITE_BBC_API_KEY=your_bbc_api_key_here

# Optional: Live TV streams (if you have access)
VITE_BBC_STREAM_URL=https://your-bbc-stream-url.m3u8
VITE_CNN_STREAM_URL=https://your-cnn-stream-url.m3u8

# Optional: Enhanced AI features
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Getting API Keys

#### NewsAPI.org (Primary - Required)
1. Visit [newsapi.org](https://newsapi.org)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 1,000 requests/day

#### The Guardian (Secondary - Optional)
1. Visit [The Guardian Open Platform](https://open-platform.theguardian.com)
2. Register for a developer key
3. Free tier: 12 calls per second

#### BBC News API (Premium - Optional)
1. Contact BBC for API access
2. Requires approval for commercial use
3. Provides high-quality video content

### 4. Live TV Streaming Setup

For live TV functionality, you'll need:

1. **Legal streaming URLs** from news organizations
2. **CORS-enabled** streaming endpoints
3. **HLS (.m3u8)** or **RTMP** stream formats

**Note**: Most news organizations require licensing agreements for live streaming. The app includes demo streams for development.

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

## API Usage Examples

### Fetching News Articles
```typescript
import { useNewsApi } from './hooks/useNewsApi';

const { articles, loading, error } = useNewsApi({
  query: 'climate change',
  country: 'us',
  category: 'environment',
  pageSize: 20
});
```

### Live Channel Integration
```typescript
import { useLiveChannels } from './hooks/useNewsApi';

const { channels, loading } = useLiveChannels();
```

## Fallback Behavior

The application includes robust fallback mechanisms:

1. **Primary API fails** → Falls back to secondary APIs
2. **All APIs fail** → Uses cached/mock data
3. **Live streams unavailable** → Shows error with retry option
4. **Network issues** → Graceful degradation with offline support

## Features by API

| Feature | NewsAPI | Guardian | BBC | Mock Data |
|---------|---------|----------|-----|-----------|
| Articles | ✅ | ✅ | ✅ | ✅ |
| Live TV | ❌ | ❌ | ✅ | ✅ |
| Video Content | ❌ | ❌ | ✅ | ✅ |
| Real-time | ✅ | ✅ | ✅ | ❌ |
| Historical | ✅ | ✅ | ✅ | ✅ |

## Development Notes

- The app works fully with mock data for development
- Real APIs enhance the experience but aren't required
- Live TV features use demo streams by default
- All AI features include fallback implementations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your API integrations
4. Test with both real and mock data
5. Submit a pull request

## License

This project is licensed under the MIT License.
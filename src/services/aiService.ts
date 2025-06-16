// AI Service for intelligent news analysis and processing
interface AIAnalysisResult {
  bias: {
    score: number;
    explanation: string;
    indicators: string[];
  };
  sentiment: {
    score: number;
    emotion: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence: number;
  };
  facts: {
    keyFacts: string[];
    figures: string[];
    claims: string[];
  };
  tone: {
    formal: number;
    emotional: number;
    objective: number;
  };
  keywords: string[];
  summary: string;
}

interface VideoComparisonResult {
  videos: {
    id: string;
    title: string;
    channel: string;
    analysis: AIAnalysisResult;
  }[];
  comparison: {
    biasComparison: string;
    factualDifferences: string[];
    toneAnalysis: string;
    recommendation: string;
  };
  overallInsight: string;
}

class AIService {
  private openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
  private baseURL = 'https://api.openai.com/v1';

  // Intelligent voice search processing
  async processVoiceSearch(query: string): Promise<{
    intent: string;
    keywords: string[];
    searchTerms: string[];
    filters: {
      timeframe?: string;
      region?: string;
      category?: string;
    };
  }> {
    try {
      const prompt = `
        Analyze this voice search query for news content: "${query}"
        
        Extract:
        1. User intent (what they're looking for)
        2. Key search keywords
        3. Optimized search terms for news APIs
        4. Any implicit filters (time, location, category)
        
        Return as JSON with: intent, keywords, searchTerms, filters
      `;

      const response = await this.callOpenAI(prompt, 'gpt-3.5-turbo');
      
      try {
        return JSON.parse(response);
      } catch {
        // Fallback to basic keyword extraction
        return this.fallbackVoiceProcessing(query);
      }
    } catch (error) {
      console.error('AI voice processing failed:', error);
      return this.fallbackVoiceProcessing(query);
    }
  }

  // Analyze video content for comparison
  async analyzeVideoContent(
    title: string, 
    description: string, 
    channelName: string
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = `
        Analyze this news video content:
        Title: ${title}
        Description: ${description}
        Channel: ${channelName}
        
        Provide detailed analysis including:
        1. Bias score (0-1) and explanation
        2. Sentiment analysis with emotion and confidence
        3. Key facts, figures, and claims mentioned
        4. Tone analysis (formal, emotional, objective scores 0-1)
        5. Important keywords
        6. Brief summary
        
        Return as structured JSON.
      `;

      const response = await this.callOpenAI(prompt, 'gpt-4');
      
      try {
        return JSON.parse(response);
      } catch {
        return this.fallbackAnalysis(title, description, channelName);
      }
    } catch (error) {
      console.error('AI content analysis failed:', error);
      return this.fallbackAnalysis(title, description, channelName);
    }
  }

  // Compare multiple videos on the same topic
  async compareVideos(videos: Array<{
    id: string;
    title: string;
    description: string;
    channelTitle: string;
  }>): Promise<VideoComparisonResult> {
    try {
      // First analyze each video
      const analyses = await Promise.all(
        videos.map(async (video) => ({
          id: video.id,
          title: video.title,
          channel: video.channelTitle,
          analysis: await this.analyzeVideoContent(
            video.title,
            video.description,
            video.channelTitle
          )
        }))
      );

      // Then compare them
      const comparisonPrompt = `
        Compare these news videos on the same topic:
        ${analyses.map(a => `
          Channel: ${a.channel}
          Title: ${a.title}
          Bias Score: ${a.analysis.bias.score}
          Sentiment: ${a.analysis.sentiment.emotion}
          Key Facts: ${a.analysis.facts.keyFacts.join(', ')}
        `).join('\n')}
        
        Provide:
        1. Bias comparison analysis
        2. Factual differences between reports
        3. Tone analysis comparison
        4. Recommendation for most balanced coverage
        5. Overall insight about the coverage differences
        
        Return as structured JSON.
      `;

      const comparisonResponse = await this.callOpenAI(comparisonPrompt, 'gpt-4');
      
      try {
        const comparison = JSON.parse(comparisonResponse);
        return {
          videos: analyses,
          comparison: comparison.comparison || {},
          overallInsight: comparison.overallInsight || 'Analysis completed'
        };
      } catch {
        return {
          videos: analyses,
          comparison: {
            biasComparison: 'Multiple perspectives detected',
            factualDifferences: ['Different emphasis on key points'],
            toneAnalysis: 'Varying tones across sources',
            recommendation: 'Compare multiple sources for balanced view'
          },
          overallInsight: 'Different perspectives found across sources'
        };
      }
    } catch (error) {
      console.error('AI video comparison failed:', error);
      throw error;
    }
  }

  // Generate trending news insights
  async analyzeTrendingNews(articles: any[]): Promise<{
    globalTrends: string[];
    regionalInsights: { [region: string]: string[] };
    emergingTopics: string[];
    sentiment: string;
  }> {
    try {
      const prompt = `
        Analyze these trending news articles:
        ${articles.slice(0, 10).map(a => `
          Title: ${a.title}
          Source: ${a.source}
          Country: ${a.country}
          Category: ${a.category}
        `).join('\n')}
        
        Identify:
        1. Global trending topics
        2. Regional insights by area
        3. Emerging topics to watch
        4. Overall sentiment of global news
        
        Return as JSON.
      `;

      const response = await this.callOpenAI(prompt, 'gpt-3.5-turbo');
      
      try {
        return JSON.parse(response);
      } catch {
        return this.fallbackTrendingAnalysis(articles);
      }
    } catch (error) {
      console.error('AI trending analysis failed:', error);
      return this.fallbackTrendingAnalysis(articles);
    }
  }

  // Translate content to user's preferred language
  async translateContent(
    text: string, 
    targetLanguage: string
  ): Promise<string> {
    try {
      const prompt = `
        Translate this news content to ${targetLanguage}:
        "${text}"
        
        Maintain journalistic tone and accuracy. Return only the translation.
      `;

      return await this.callOpenAI(prompt, 'gpt-3.5-turbo');
    } catch (error) {
      console.error('AI translation failed:', error);
      return text; // Return original if translation fails
    }
  }

  // Private helper methods
  private async callOpenAI(prompt: string, model: string = 'gpt-3.5-turbo'): Promise<string> {
    if (!this.openAIKey || this.openAIKey.includes('your_openai_api_key_here')) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert news analyst. Provide accurate, unbiased analysis in the requested format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private fallbackVoiceProcessing(query: string) {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    return {
      intent: 'search_news',
      keywords,
      searchTerms: keywords,
      filters: {}
    };
  }

  private fallbackAnalysis(title: string, description: string, channel: string): AIAnalysisResult {
    const text = `${title} ${description}`.toLowerCase();
    
    // Simple bias detection
    const biasWords = ['allegedly', 'claims', 'reportedly', 'sources say'];
    const biasScore = biasWords.filter(word => text.includes(word)).length * 0.2;
    
    // Simple sentiment
    const positiveWords = ['success', 'achievement', 'progress', 'victory'];
    const negativeWords = ['crisis', 'disaster', 'conflict', 'failure'];
    const posCount = positiveWords.filter(word => text.includes(word)).length;
    const negCount = negativeWords.filter(word => text.includes(word)).length;
    
    let emotion: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (posCount > negCount) emotion = 'positive';
    else if (negCount > posCount) emotion = 'negative';

    return {
      bias: {
        score: Math.min(biasScore, 1),
        explanation: biasScore > 0.3 ? 'Contains subjective language' : 'Relatively objective reporting',
        indicators: biasWords.filter(word => text.includes(word))
      },
      sentiment: {
        score: emotion === 'positive' ? 0.7 : emotion === 'negative' ? -0.7 : 0,
        emotion,
        confidence: 0.6
      },
      facts: {
        keyFacts: [title],
        figures: [],
        claims: []
      },
      tone: {
        formal: 0.7,
        emotional: emotion !== 'neutral' ? 0.6 : 0.3,
        objective: biasScore < 0.3 ? 0.8 : 0.5
      },
      keywords: title.split(' ').filter(word => word.length > 3).slice(0, 5),
      summary: description.substring(0, 150) + '...'
    };
  }

  private fallbackTrendingAnalysis(articles: any[]) {
    const categories = [...new Set(articles.map(a => a.category))];
    const countries = [...new Set(articles.map(a => a.country))];
    
    return {
      globalTrends: categories.slice(0, 5),
      regionalInsights: countries.reduce((acc, country) => {
        acc[country] = [articles.find(a => a.country === country)?.category || 'General'];
        return acc;
      }, {} as { [key: string]: string[] }),
      emergingTopics: articles.filter(a => a.trending).map(a => a.category).slice(0, 3),
      sentiment: 'mixed'
    };
  }
}

export const aiService = new AIService();
export default aiService;
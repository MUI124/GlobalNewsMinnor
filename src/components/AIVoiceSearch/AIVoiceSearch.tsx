import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Brain, Search, Loader } from 'lucide-react';
import aiService from '../../services/aiService';

interface AIVoiceSearchProps {
  onSearchResult: (query: string, filters?: any) => void;
  placeholder?: string;
}

const AIVoiceSearch: React.FC<AIVoiceSearchProps> = ({ onSearchResult, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setAiInsight('');
      };

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognitionInstance.onend = async () => {
        setIsListening(false);
        if (transcript.trim()) {
          await processWithAI(transcript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
      };

      setRecognition(recognitionInstance);
    }
  }, [transcript]);

  const processWithAI = async (query: string) => {
    setIsProcessing(true);
    try {
      const aiResult = await aiService.processVoiceSearch(query);
      
      setAiInsight(`AI understood: "${aiResult.intent}" - Searching for: ${aiResult.searchTerms.join(', ')}`);
      
      // Use the AI-processed search terms
      const searchQuery = aiResult.searchTerms.join(' ');
      onSearchResult(searchQuery, aiResult.filters);
      
      // Clear after a delay
      setTimeout(() => {
        setTranscript('');
        setAiInsight('');
      }, 3000);
      
    } catch (error) {
      console.error('AI processing failed:', error);
      setAiInsight('AI processing unavailable, using basic search');
      onSearchResult(query);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    } else {
      // Fallback for browsers without speech recognition
      const mockQuery = prompt('Enter your search query:');
      if (mockQuery) {
        setTranscript(mockQuery);
        processWithAI(mockQuery);
      }
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const handleManualSearch = async () => {
    if (transcript.trim()) {
      await processWithAI(transcript);
    }
  };

  return (
    <div className="relative">
      {/* Voice Input Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={placeholder || "Try: 'earthquake news today' or 'election results'"}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          
          {/* AI Processing Indicator */}
          {isProcessing && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <Loader className="h-5 w-5 text-primary-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Voice Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            isListening 
              ? 'bg-red-100 text-red-600 animate-pulse border-2 border-red-300' 
              : isProcessing
              ? 'bg-blue-100 text-blue-600'
              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice search'}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : isProcessing ? (
            <Brain className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">
            {isListening ? 'Listening...' : isProcessing ? 'AI Processing...' : 'Voice Search'}
          </span>
        </button>

        {/* Manual Search Button */}
        <button
          onClick={handleManualSearch}
          disabled={!transcript.trim() || isProcessing}
          className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>

      {/* AI Insight Display */}
      {(transcript || aiInsight) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          {transcript && (
            <div className="mb-2">
              <div className="text-sm text-gray-600 mb-1">Voice Input:</div>
              <div className="text-gray-900 font-medium">"{transcript}"</div>
            </div>
          )}
          
          {aiInsight && (
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center space-x-2 mb-1">
                <Brain className="h-4 w-4 text-primary-600" />
                <div className="text-sm text-primary-600 font-medium">AI Analysis:</div>
              </div>
              <div className="text-sm text-gray-700">{aiInsight}</div>
            </div>
          )}
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          'breaking news today',
          'election results',
          'climate summit',
          'tech news',
          'sports updates'
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              setTranscript(suggestion);
              processWithAI(suggestion);
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIVoiceSearch;
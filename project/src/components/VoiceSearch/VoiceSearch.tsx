import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchProps {
  onVoiceResult: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onVoiceResult, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');

  const mockVoiceRecognition = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript('');
      return;
    }

    setIsListening(true);
    setTranscript('Listening...');

    // Simulate voice recognition with mock results
    const mockResults = [
      'climate summit',
      'trade agreement',
      'mars mission',
      'israel palestine conflict',
      'ukraine war',
      'covid vaccine'
    ];

    setTimeout(() => {
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setTranscript(`"${randomResult}"`);
      onVoiceResult(randomResult);
      
      setTimeout(() => {
        setIsListening(false);
        setTranscript('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={mockVoiceRecognition}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
        }`}
        title={isListening ? 'Stop listening' : 'Voice search'}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      
      {transcript && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-50">
          <div className="text-sm text-gray-600 mb-1">Voice Input:</div>
          <div className="text-sm font-medium text-gray-900">{transcript}</div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
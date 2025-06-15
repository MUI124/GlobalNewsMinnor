import React, { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';

interface AutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: string) => void;
  placeholder?: string;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({ value, onChange, onSelect, placeholder }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const eventSuggestions = [
    'Climate Summit 2024',
    'Israel-Palestine Conflict',
    'Ukraine War Updates',
    'AI Regulation Debate',
    'Global Trade Agreement',
    'Space Exploration Mission',
    'Energy Crisis Response',
    'COVID-19 Vaccine Distribution',
    'Cryptocurrency Regulation',
    'Nuclear Energy Policy',
    'Immigration Reform',
    'Cybersecurity Threats'
  ];

  useEffect(() => {
    if (value.length > 1) {
      const filtered = eventSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Suggested events</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
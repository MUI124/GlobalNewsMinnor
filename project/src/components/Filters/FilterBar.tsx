import React, { useState } from 'react';
import { Filter as FilterIcon, Search, X } from 'lucide-react';
import { GNEWS_COUNTRIES, GNEWS_CATEGORIES } from '../../hooks/useNewsApi';
import { Filter } from '../../types';

interface FilterBarProps {
  filters: Filter;
  onFiltersChange: (filters: Filter) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Convert GNews countries to our format
  const countries = GNEWS_COUNTRIES.map(country => ({
    code: country.code.toUpperCase(),
    name: country.name,
    flag: getCountryFlag(country.code)
  }));

  // Convert GNews categories to our format
  const categories = GNEWS_CATEGORIES.map(cat => 
    cat.charAt(0).toUpperCase() + cat.slice(1)
  ).filter(cat => cat !== 'General'); // Remove 'General' as it's not very useful

  function getCountryFlag(countryCode: string): string {
    const flagMap: { [key: string]: string } = {
      'au': '🇦🇺', 'br': '🇧🇷', 'ca': '🇨🇦', 'cn': '🇨🇳', 'eg': '🇪🇬',
      'fr': '🇫🇷', 'de': '🇩🇪', 'gr': '🇬🇷', 'hk': '🇭🇰', 'in': '🇮🇳',
      'ie': '🇮🇪', 'il': '🇮🇱', 'it': '🇮🇹', 'jp': '🇯🇵', 'nl': '🇳🇱',
      'no': '🇳🇴', 'pk': '🇵🇰', 'pe': '🇵🇪', 'ph': '🇵🇭', 'pt': '🇵🇹',
      'ro': '🇷🇴', 'ru': '🇷🇺', 'sg': '🇸🇬', 'es': '🇪🇸', 'se': '🇸🇪',
      'ch': '🇨🇭', 'tw': '🇹🇼', 'ua': '🇺🇦', 'gb': '🇬🇧', 'us': '🇺🇸'
    };
    return flagMap[countryCode] || '🌍';
  }

  const handleCountryToggle = (countryName: string) => {
    const updatedCountries = filters.countries.includes(countryName)
      ? filters.countries.filter(c => c !== countryName)
      : [...filters.countries, countryName];
    
    onFiltersChange({ ...filters, countries: updatedCountries });
  };

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: updatedCategories });
  };

  const handleSentimentToggle = (sentiment: string) => {
    const updatedSentiment = filters.sentiment.includes(sentiment)
      ? filters.sentiment.filter(s => s !== sentiment)
      : [...filters.sentiment, sentiment];
    
    onFiltersChange({ ...filters, sentiment: updatedSentiment });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      countries: [],
      sources: [],
      categories: [],
      sentiment: [],
      dateRange: { start: '', end: '' },
      searchQuery: ''
    });
  };

  const activeFiltersCount = filters.countries.length + filters.categories.length + filters.sentiment.length;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filter Toggle */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              isFilterOpen || activeFiltersCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FilterIcon className="h-5 w-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-gray-50 rounded-lg p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Articles</h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Countries */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Countries</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {countries.map((country) => (
                    <label key={country.code} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.countries.includes(country.name)}
                        onChange={() => handleCountryToggle(country.name)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center space-x-1">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sentiment</h4>
                <div className="space-y-2">
                  {['positive', 'neutral', 'negative'].map((sentiment) => (
                    <label key={sentiment} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.sentiment.includes(sentiment)}
                        onChange={() => handleSentimentToggle(sentiment)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{sentiment}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
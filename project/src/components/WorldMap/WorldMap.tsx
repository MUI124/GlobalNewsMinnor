import React, { useState } from 'react';
import { MapPin, Globe } from 'lucide-react';

interface WorldMapProps {
  onCountrySelect: (country: string) => void;
  selectedCountry?: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountrySelect, selectedCountry }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const regions = [
    {
      name: 'North America',
      countries: [
        { name: 'United States', flag: '🇺🇸', articles: 245, position: { top: '35%', left: '20%' } },
        { name: 'Canada', flag: '🇨🇦', articles: 89, position: { top: '25%', left: '22%' } },
        { name: 'Mexico', flag: '🇲🇽', articles: 67, position: { top: '45%', left: '18%' } }
      ]
    },
    {
      name: 'Europe',
      countries: [
        { name: 'United Kingdom', flag: '🇬🇧', articles: 198, position: { top: '28%', left: '48%' } },
        { name: 'Germany', flag: '🇩🇪', articles: 156, position: { top: '30%', left: '52%' } },
        { name: 'France', flag: '🇫🇷', articles: 134, position: { top: '32%', left: '50%' } },
        { name: 'Russia', flag: '🇷🇺', articles: 178, position: { top: '25%', left: '65%' } }
      ]
    },
    {
      name: 'Asia',
      countries: [
        { name: 'China', flag: '🇨🇳', articles: 289, position: { top: '35%', left: '75%' } },
        { name: 'Japan', flag: '🇯🇵', articles: 123, position: { top: '32%', left: '82%' } },
        { name: 'India', flag: '🇮🇳', articles: 167, position: { top: '40%', left: '70%' } }
      ]
    },
    {
      name: 'Middle East',
      countries: [
        { name: 'Qatar', flag: '🇶🇦', articles: 78, position: { top: '38%', left: '58%' } },
        { name: 'Israel', flag: '🇮🇱', articles: 145, position: { top: '40%', left: '56%' } }
      ]
    },
    {
      name: 'Other',
      countries: [
        { name: 'Brazil', flag: '🇧🇷', articles: 98, position: { top: '55%', left: '35%' } },
        { name: 'Australia', flag: '🇦🇺', articles: 76, position: { top: '65%', left: '80%' } }
      ]
    }
  ];

  const allCountries = regions.flatMap(region => region.countries);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Globe className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Global News Map</h2>
        <span className="text-sm text-gray-500">Click a country to filter news</span>
      </div>

      <div className="relative">
        {/* World Map Background */}
        <div className="relative bg-gradient-to-b from-blue-50 to-green-50 rounded-lg h-96 overflow-hidden">
          {/* Continents as colored areas */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 60" className="w-full h-full">
              {/* North America */}
              <path d="M15 20 L30 15 L35 25 L25 35 L15 30 Z" fill="#e5e7eb" opacity="0.6" />
              {/* Europe */}
              <path d="M45 20 L55 18 L58 28 L50 32 L45 25 Z" fill="#e5e7eb" opacity="0.6" />
              {/* Asia */}
              <path d="M60 15 L85 20 L88 35 L75 40 L60 30 Z" fill="#e5e7eb" opacity="0.6" />
              {/* Africa */}
              <path d="M45 35 L60 32 L58 50 L48 52 L45 45 Z" fill="#e5e7eb" opacity="0.6" />
              {/* South America */}
              <path d="M25 40 L35 38 L38 55 L28 58 L25 50 Z" fill="#e5e7eb" opacity="0.6" />
              {/* Australia */}
              <path d="M75 50 L85 48 L88 55 L80 57 L75 53 Z" fill="#e5e7eb" opacity="0.6" />
            </svg>
          </div>

          {/* Country Markers */}
          {allCountries.map((country) => (
            <button
              key={country.name}
              onClick={() => onCountrySelect(country.name)}
              onMouseEnter={() => setHoveredCountry(country.name)}
              onMouseLeave={() => setHoveredCountry(null)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                selectedCountry === country.name
                  ? 'scale-125 z-20'
                  : hoveredCountry === country.name
                  ? 'scale-110 z-10'
                  : 'hover:scale-105'
              }`}
              style={country.position}
            >
              <div className={`relative ${
                selectedCountry === country.name
                  ? 'ring-4 ring-primary-400 ring-opacity-50 rounded-full'
                  : ''
              }`}>
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedCountry === country.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}>
                  {country.articles}
                </div>
              </div>
            </button>
          ))}

          {/* Hover Tooltip */}
          {hoveredCountry && (
            <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-30">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {allCountries.find(c => c.name === hoveredCountry)?.flag}
                </span>
                <div>
                  <div className="font-medium text-gray-900">{hoveredCountry}</div>
                  <div className="text-sm text-gray-500">
                    {allCountries.find(c => c.name === hoveredCountry)?.articles} articles
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Click country flags to filter news</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
            <span>Selected country</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
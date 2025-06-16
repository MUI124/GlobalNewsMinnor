import React, { useState, useEffect } from 'react';
import { Globe, Check, Loader } from 'lucide-react';
import aiService from '../../services/aiService';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onTranslationToggle?: (enabled: boolean) => void;
  autoTranslateEnabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  onTranslationToggle,
  autoTranslateEnabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' }
  ];

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
    
    // Save to localStorage
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const handleAutoTranslateToggle = () => {
    const newValue = !autoTranslateEnabled;
    onTranslationToggle?.(newValue);
    localStorage.setItem('autoTranslateEnabled', JSON.stringify(newValue));
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedAutoTranslate = localStorage.getItem('autoTranslateEnabled');
    
    if (savedLanguage && savedLanguage !== selectedLanguage) {
      onLanguageChange(savedLanguage);
    }
    
    if (savedAutoTranslate && onTranslationToggle) {
      onTranslationToggle(JSON.parse(savedAutoTranslate));
    }
  }, []);

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-lg">{selectedLang.flag}</span>
        <span className="text-sm font-medium text-gray-700">{selectedLang.name}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Language</h3>
            
            {/* Auto-translate toggle */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Auto-translate content</span>
                <p className="text-xs text-gray-500">Translate articles to your preferred language</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTranslateEnabled}
                  onChange={handleAutoTranslateToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {isTranslating && (
              <div className="flex items-center space-x-2 text-primary-600 text-sm">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Translating content...</span>
              </div>
            )}
          </div>

          <div className="p-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                  selectedLanguage === language.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{language.name}</div>
                  <div className="text-xs text-gray-500">{language.nativeName}</div>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Auto-translation uses AI to provide approximate translations. 
              Original language content is always preferred when available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
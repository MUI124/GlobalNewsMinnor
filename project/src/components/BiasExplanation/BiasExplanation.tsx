import React, { useState } from 'react';
import { HelpCircle, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface BiasExplanationProps {
  biasScore: number;
  sentiment: string;
}

const BiasExplanation: React.FC<BiasExplanationProps> = ({ biasScore, sentiment }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getBiasLevel = (score: number) => {
    if (score <= 0.1) return { level: 'Low', color: 'green', icon: CheckCircle };
    if (score <= 0.3) return { level: 'Moderate', color: 'yellow', icon: Info };
    return { level: 'High', color: 'red', icon: AlertTriangle };
  };

  const biasInfo = getBiasLevel(biasScore);
  const IconComponent = biasInfo.icon;

  const getExplanation = () => {
    const biasLevel = getBiasLevel(biasScore);
    const examples = {
      low: [
        'Balanced reporting with multiple viewpoints',
        'Factual language without emotional words',
        'Clear separation of facts and opinions'
      ],
      moderate: [
        'Some emotional language detected',
        'Slight preference for one perspective',
        'Minor use of loaded terms'
      ],
      high: [
        'Strong emotional language used',
        'One-sided perspective dominant',
        'Frequent use of loaded or biased terms'
      ]
    };

    return examples[biasLevel.level.toLowerCase() as keyof typeof examples] || examples.moderate;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Learn more</span>
      </button>

      {showExplanation && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Bias Analysis Explained</h3>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Current Article Analysis */}
            <div className={`p-3 rounded-lg border-l-4 border-${biasInfo.color}-400 bg-${biasInfo.color}-50`}>
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className={`h-5 w-5 text-${biasInfo.color}-600`} />
                <span className={`font-medium text-${biasInfo.color}-800`}>
                  {biasInfo.level} Bias ({(biasScore * 100).toFixed(0)}%)
                </span>
              </div>
              <p className={`text-sm text-${biasInfo.color}-700`}>
                This article shows {biasInfo.level.toLowerCase()} levels of bias based on our AI analysis.
              </p>
            </div>

            {/* What We Detected */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What we detected:</h4>
              <ul className="space-y-1">
                {getExplanation().map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sentiment Impact */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sentiment Analysis:</h4>
              <p className="text-sm text-gray-600">
                The article has a <span className="font-medium capitalize">{sentiment}</span> tone, 
                which {sentiment === 'neutral' ? 'suggests balanced reporting' : 
                       sentiment === 'positive' ? 'may indicate favorable coverage' : 
                       'may indicate critical coverage'}.
              </p>
            </div>

            {/* How It Works */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="font-medium text-gray-900 mb-2">How bias detection works:</h4>
              <p className="text-xs text-gray-500">
                Our AI analyzes language patterns, emotional words, source diversity, 
                and factual vs. opinion content to calculate bias scores. 
                Lower scores indicate more balanced reporting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiasExplanation;
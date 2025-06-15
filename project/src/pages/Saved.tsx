import React, { useState } from 'react';
import { Bookmark, Trash2, Share } from 'lucide-react';

const Saved: React.FC = () => {
  const [savedArticles] = useState([
    {
      id: '1',
      title: 'Global Climate Summit Reaches Historic Agreement',
      source: 'BBC News',
      country: 'United Kingdom',
      savedAt: '2024-01-15T14:30:00Z',
      category: 'Environment'
    },
    {
      id: '4',
      title: 'Economic Markets React to Trade Agreement',
      source: 'Financial Times',
      country: 'United Kingdom',
      savedAt: '2024-01-14T16:45:00Z',
      category: 'Economy'
    }
  ]);

  const categories = [...new Set(savedArticles.map(article => article.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Articles</h1>
          <p className="text-gray-600">
            Your bookmarked articles for later reading and comparison
          </p>
        </div>

        {savedArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No saved articles yet</p>
              <p className="text-gray-400">Start bookmarking articles to build your reading list</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {savedArticles
                    .filter(article => article.category === category)
                    .map((article) => (
                      <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{article.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <span>{article.source}</span>
                              <span>•</span>
                              <span>{article.country}</span>
                              <span>•</span>
                              <span>Saved {new Date(article.savedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                              <Share className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
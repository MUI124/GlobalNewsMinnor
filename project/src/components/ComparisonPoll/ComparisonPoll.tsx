import React, { useState } from 'react';
import { BarChart3, Users } from 'lucide-react';
import { Article } from '../../types';

interface ComparisonPollProps {
  article1: Article;
  article2: Article;
}

const ComparisonPoll: React.FC<ComparisonPollProps> = ({ article1, article2 }) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [votes, setVotes] = useState({
    article1: 127,
    article2: 89,
    neither: 34
  });

  const totalVotes = votes.article1 + votes.article2 + votes.neither;

  const handleVote = (choice: 'article1' | 'article2' | 'neither') => {
    if (userVote === choice) return; // Prevent double voting

    setVotes(prev => ({
      ...prev,
      [choice]: prev[choice] + 1,
      ...(userVote && { [userVote]: prev[userVote] - 1 })
    }));
    setUserVote(choice);
  };

  const getPercentage = (count: number) => {
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-semibold text-gray-900">Community Poll</h3>
      </div>

      <p className="text-gray-700 mb-6">Which article feels more balanced and trustworthy?</p>

      <div className="space-y-4">
        {/* Article 1 Option */}
        <button
          onClick={() => handleVote('article1')}
          disabled={!!userVote}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            userVote === 'article1'
              ? 'border-primary-500 bg-primary-100'
              : userVote
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span className="font-medium text-gray-900">{article1.source}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{getPercentage(votes.article1)}%</span>
              {userVote === 'article1' && <span className="text-primary-600">✓</span>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(votes.article1)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{article1.title}</p>
        </button>

        {/* Article 2 Option */}
        <button
          onClick={() => handleVote('article2')}
          disabled={!!userVote}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            userVote === 'article2'
              ? 'border-secondary-500 bg-secondary-100'
              : userVote
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-200 bg-white hover:border-secondary-300 hover:bg-secondary-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-secondary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span className="font-medium text-gray-900">{article2.source}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{getPercentage(votes.article2)}%</span>
              {userVote === 'article2' && <span className="text-secondary-600">✓</span>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-secondary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(votes.article2)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{article2.title}</p>
        </button>

        {/* Neither Option */}
        <button
          onClick={() => handleVote('neither')}
          disabled={!!userVote}
          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
            userVote === 'neither'
              ? 'border-gray-500 bg-gray-100'
              : userVote
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Both seem equally biased</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">{getPercentage(votes.neither)}%</span>
              {userVote === 'neither' && <span className="text-gray-600">✓</span>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-gray-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${getPercentage(votes.neither)}%` }}
            ></div>
          </div>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        <span>{totalVotes} people voted</span>
      </div>

      {userVote && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Thanks for voting! Results help other users identify balanced reporting.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonPoll;
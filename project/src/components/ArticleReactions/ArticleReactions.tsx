import React, { useState } from 'react';
import { ThumbsUp, AlertCircle, ThumbsDown, MessageCircle } from 'lucide-react';

interface ArticleReactionsProps {
  articleId: string;
}

const ArticleReactions: React.FC<ArticleReactionsProps> = ({ articleId }) => {
  const [reactions, setReactions] = useState({
    trustworthy: 0,
    needsInfo: 0,
    biased: 0
  });
  
  const [userReaction, setUserReaction] = useState<string | null>(null);

  const handleReaction = (type: 'trustworthy' | 'needsInfo' | 'biased') => {
    if (userReaction === type) {
      // Remove reaction
      setReactions(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setUserReaction(null);
    } else {
      // Add new reaction, remove old one if exists
      setReactions(prev => ({
        ...prev,
        ...(userReaction && { [userReaction]: prev[userReaction] - 1 }),
        [type]: prev[type] + 1
      }));
      setUserReaction(type);
    }
  };

  const reactionButtons = [
    {
      type: 'trustworthy' as const,
      icon: ThumbsUp,
      emoji: '👍',
      label: 'Trustworthy',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      activeColor: 'bg-green-100 text-green-700'
    },
    {
      type: 'needsInfo' as const,
      icon: AlertCircle,
      emoji: '🤔',
      label: 'Needs more info',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      activeColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      type: 'biased' as const,
      icon: ThumbsDown,
      emoji: '👎',
      label: 'Biased',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      activeColor: 'bg-red-100 text-red-700'
    }
  ];

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center space-x-2 mb-3">
        <MessageCircle className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">How do you find this article?</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {reactionButtons.map((button) => {
          const isActive = userReaction === button.type;
          const count = reactions[button.type];
          
          return (
            <button
              key={button.type}
              onClick={() => handleReaction(button.type)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive ? button.activeColor : `${button.bgColor} ${button.color}`
              }`}
            >
              <span className="text-base">{button.emoji}</span>
              <span>{button.label}</span>
              {count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isActive ? 'bg-white/50' : 'bg-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleReactions;
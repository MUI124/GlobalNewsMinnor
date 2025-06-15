import React from 'react';

interface KeywordHighlighterProps {
  text: string;
  className?: string;
}

const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({ text, className = '' }) => {
  const keywords = {
    countries: ['United States', 'USA', 'America', 'China', 'Russia', 'Germany', 'France', 'Japan', 'India', 'Brazil', 'UK', 'Britain', 'Qatar', 'Pakistan', 'Israel', 'Palestine'],
    people: ['Biden', 'Putin', 'Xi Jinping', 'Macron', 'Johnson', 'Trump', 'Zelensky', 'Netanyahu'],
    conflicts: ['war', 'conflict', 'crisis', 'tension', 'dispute', 'violence', 'attack', 'invasion'],
    locations: ['Middle East', 'Europe', 'Asia', 'Africa', 'Americas', 'Gaza', 'Ukraine', 'Taiwan', 'Kashmir'],
    dates: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi
  };

  let highlightedText = text;

  // Highlight countries in blue
  keywords.countries.forEach(country => {
    const regex = new RegExp(`\\b${country}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="bg-blue-100 text-blue-800 px-1 rounded">${country}</span>`);
  });

  // Highlight people in green
  keywords.people.forEach(person => {
    const regex = new RegExp(`\\b${person}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="bg-green-100 text-green-800 px-1 rounded">${person}</span>`);
  });

  // Highlight conflicts in red
  keywords.conflicts.forEach(conflict => {
    const regex = new RegExp(`\\b${conflict}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="bg-red-100 text-red-800 px-1 rounded">${conflict}</span>`);
  });

  // Highlight locations in purple
  keywords.locations.forEach(location => {
    const regex = new RegExp(`\\b${location}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span class="bg-purple-100 text-purple-800 px-1 rounded">${location}</span>`);
  });

  // Highlight dates in orange
  highlightedText = highlightedText.replace(keywords.dates, (match) => 
    `<span class="bg-orange-100 text-orange-800 px-1 rounded">${match}</span>`
  );

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};

export default KeywordHighlighter;
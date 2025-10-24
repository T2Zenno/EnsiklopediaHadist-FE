import React from 'react';

interface HighlightProps {
  text: string;
  searchTerm: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, searchTerm }) => {
  if (!searchTerm.trim()) {
    return <>{text}</>;
  }

  // Escape special characters in searchTerm for regex
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-emerald-200 dark:bg-emerald-700/50 rounded-sm px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

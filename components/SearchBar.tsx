
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  term: string;
  onSearch: (term: string) => void;
  variant?: 'default' | 'hero';
}

export const SearchBar: React.FC<SearchBarProps> = ({ term, onSearch, variant = 'default' }) => {
  const [localTerm, setLocalTerm] = useState(term);

  useEffect(() => {
    setLocalTerm(term);
  }, [term]);

  const handleSearchClick = () => {
    // No need to check if terms are different. Allow user to re-submit the same search.
    onSearch(localTerm);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const isHero = variant === 'hero';
  const inputClasses = isHero
    ? "w-full pl-12 pr-28 py-3.5 border border-white/40 bg-white/20 backdrop-blur-sm rounded-full text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
    : "w-full pl-10 pr-28 py-3 border border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500 dark:focus:ring-emerald-600 transition-colors";

  const iconClasses = isHero ? "h-5 w-5 text-gray-200" : "h-5 w-5 text-gray-400";
  const iconContainerClasses = isHero ? "absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none" : "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none";

  const buttonClasses = isHero
    ? "absolute inset-y-0 right-0 my-1.5 mr-1.5 flex items-center justify-center px-6 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 focus:ring-offset-transparent transition-colors"
    : "absolute inset-y-0 right-0 my-1.5 mr-1.5 flex items-center justify-center px-6 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors";

  return (
    <div className="relative">
      <input
        type="text"
        value={localTerm}
        onChange={(e) => setLocalTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Cari hadits berdasarkan kata kunci, perawi..."
        className={inputClasses}
      />
      <div className={iconContainerClasses}>
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <button
        type="button"
        onClick={handleSearchClick}
        className={buttonClasses}
      >
        Cari
      </button>
    </div>
  );
};

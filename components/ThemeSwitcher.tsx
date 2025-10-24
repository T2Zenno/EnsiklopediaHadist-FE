import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC<{ asButton?: boolean }> = ({ asButton = true }) => {
  const { theme, toggleTheme } = useTheme();

  const icon = theme === 'dark' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );

  const commonClasses = "p-2 rounded-full text-gray-500 dark:text-gray-400 transition-colors duration-200";

  if (asButton) {
    const hoverClasses = "hover:bg-gray-200 dark:hover:bg-gray-700";
    const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-amber-500";
    return (
      <button
        onClick={toggleTheme}
        className={`${commonClasses} ${hoverClasses} ${focusClasses}`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {icon}
      </button>
    );
  }

  // Render as a simple span for visual display within another clickable element
  return (
    <span className={commonClasses}>
      {icon}
    </span>
  );
};

export default ThemeSwitcher;

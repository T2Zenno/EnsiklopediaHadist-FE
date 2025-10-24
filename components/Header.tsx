import React from 'react';
import { StarIcon } from './IconComponents';
import { ProfileDropdown } from './ProfileDropdown';
import { type User } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    onHomeClick: () => void;
    onFavoritesClick: () => void;
    onLoginClick: () => void;
    onLogout: () => void;
    currentUser: User | null;
    onDashboardClick: () => void;
    theme?: 'light' | 'dark';
    onThemeToggle?: () => void;
}


export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onHomeClick, onFavoritesClick, onLoginClick, onLogout, currentUser, onDashboardClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 dark:bg-gray-900/80 dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button type="button" onClick={onHomeClick} className="text-xl font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
            Ensiklopedia Hadits AI
        </button>
        <div className="flex items-center gap-4">
            {currentUser && (
              <button
                  type="button"
                  onClick={onFavoritesClick}
                  className="flex items-center p-2 rounded-full text-white hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 sm:px-4 sm:py-2 sm:bg-amber-400 sm:text-white sm:font-semibold sm:hover:bg-amber-500 transition-colors"
                  aria-label="Lihat Favorit"
              >
                  <StarIcon filled={true} className="h-5 w-5 text-white" />
                  <span className="ml-2 hidden sm:inline">Favorit</span>
              </button>
            )}
            <ThemeSwitcher />
            {currentUser ? (
              <ProfileDropdown user={currentUser} onLogout={onLogout} onDashboardClick={onDashboardClick} />
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors text-sm"
              >
                Masuk
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

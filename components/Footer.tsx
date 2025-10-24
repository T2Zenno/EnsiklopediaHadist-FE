import React from 'react';

interface FooterProps {
  onAboutClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAboutClick }) => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-gray-500 dark:text-gray-400 gap-2">
        <p className="text-sm">&copy; {new Date().getFullYear()} Ensiklopedia Hadits AI. All rights reserved.</p>
        <button type="button" onClick={onAboutClick} className="text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Tentang Aplikasi
        </button>
      </div>
    </footer>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { type User } from '../types';

interface ProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onDashboardClick: () => void;
}

const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, onDashboardClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900"
      >
        <div className="h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {getInitials(user.username)}
        </div>
        <span className="hidden sm:inline font-semibold text-gray-700 dark:text-gray-300">{user.username}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 z-50">
           <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 sm:hidden">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.username}</p>
           </div>
           {user.role === 'admin' && (
              <button
                onClick={() => {
                  onDashboardClick();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Dashboard
              </button>
           )}
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
};
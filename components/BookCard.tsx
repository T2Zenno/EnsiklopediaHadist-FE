
import React from 'react';
import { type HadithBook } from '../types';
import { BookIcon } from './IconComponents';

interface BookCardProps {
  book: HadithBook;
  onSelect: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-500 cursor-pointer transition-all duration-300 transform hover:-trangray-y-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500"
    >
      <div className="flex items-center mb-3">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">
          <BookIcon />
        </div>
        <h3 className="ml-4 text-lg font-bold text-gray-800 dark:text-gray-100">{book.name}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Perawi: {book.narrator}</p>
      <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">{book.totalHadiths.toLocaleString('id-ID')} hadits</p>
    </div>
  );
};


import React from 'react';
import { type Hadith } from '../types';
import { ArrowLeftIcon, StarIcon } from './IconComponents';

interface FavoritesViewProps {
  hadiths: Hadith[];
  onSelectHadith: (hadith: Hadith) => void;
  onBack: () => void;
  favoriteHadithIds: string[];
  onToggleFavorite: (hadith: Hadith) => void;
  togglingFavorites: Set<string>;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  hadiths,
  onSelectHadith,
  onBack,
  favoriteHadithIds,
  onToggleFavorite,
  togglingFavorites,
}) => {
  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
        <ArrowLeftIcon />
        <span className="ml-2">Kembali</span>
      </button>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Hadits Favorit Anda</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Koleksi hadits yang telah Anda tandai.</p>
      </div>

      {hadiths.length > 0 ? (
        <div className="space-y-4">
          {hadiths.map(hadith => (
            <div 
              key={hadith.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group relative dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(hadith);
                }}
                disabled={togglingFavorites.has(hadith.id)}
                className={`absolute top-3 right-3 p-1 rounded-full transition-colors z-10 ${
                  togglingFavorites.has(hadith.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-amber-100 hover:text-amber-500 dark:hover:bg-gray-700'
                }`}
                aria-label={favoriteHadithIds.includes(hadith.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <StarIcon filled={favoriteHadithIds.includes(hadith.id)} />
              </button>
              <div onClick={() => onSelectHadith(hadith)} className="cursor-pointer">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{hadith.book} No. {hadith.number}</p>
                <p className="font-arabic text-xl text-right leading-relaxed text-gray-800 dark:text-gray-200 mt-2">{hadith.arabic}</p>
                <p className="mt-3 text-gray-600 dark:text-gray-400 italic">"{hadith.indonesian}"</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <StarIcon filled={false} className="h-12 w-12 text-amber-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Anda belum memiliki hadits favorit.</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Klik ikon bintang pada hadits untuk menyimpannya di sini.</p>
        </div>
      )}
    </div>
  );
};

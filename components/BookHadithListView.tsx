import React, { useState, useEffect } from 'react';
import { type Hadith, type HadithBook } from '../types';
import { ArrowLeftIcon, StarIcon } from './IconComponents';
import { SkeletonLoader } from './SkeletonLoader';
import { Pagination } from './Pagination';
import { SearchBar } from './SearchBar';

interface BookHadithListViewProps {
  book: HadithBook;
  onSelectHadith: (hadith: Hadith) => void;
  onBack: () => void;
  favoriteHadithIds: string[];
  onToggleFavorite: (hadith: Hadith) => void;
  onGlobalSearch: (term: string) => void;
  togglingFavorites: Set<string>;
}

const API_BASE_URL = 'https://api.hadith.gading.dev';
const HADITHS_PER_PAGE = 20;

export const BookHadithListView: React.FC<BookHadithListViewProps> = ({
  book,
  onSelectHadith,
  onBack,
  favoriteHadithIds,
  onToggleFavorite,
  onGlobalSearch,
  togglingFavorites,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.ceil(book.totalHadiths / HADITHS_PER_PAGE);

  useEffect(() => {
    const fetchHadiths = async () => {
      setIsLoading(true);
      try {
        const start = (currentPage - 1) * HADITHS_PER_PAGE + 1;
        const end = Math.min(start + HADITHS_PER_PAGE - 1, book.totalHadiths);
        const response = await fetch(`${API_BASE_URL}/books/${book.slug}?range=${start}-${end}`);
        if (!response.ok) throw new Error('Failed to fetch hadiths');
        const data = await response.json();
        const fetchedHadiths = data.data.hadiths.map((h: any) => ({
            id: `${book.slug}-${h.number}`,
            book: book.name,
            bookId: book.slug,
            number: h.number,
            arabic: h.arab,
            indonesian: h.id,
        }));
        setHadiths(fetchedHadiths);
      } catch (error) {
        console.error("Error fetching hadiths:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (book) {
      fetchHadiths();
      // Scroll to top when page changes
      window.scrollTo(0, 0);
    }
  }, [book, currentPage]);

  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
        <ArrowLeftIcon />
        <span className="ml-2">Kembali</span>
      </button>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{book.name}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Perawi: {book.narrator} &bull; {book.totalHadiths.toLocaleString('id-ID')} hadits</p>
      </div>

      <div className="mb-6">
        <SearchBar term={''} onSearch={onGlobalSearch} />
      </div>

      {totalPages > 1 && !isLoading && (
        <div className="mb-8">
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showGoToPage={false}
            />
        </div>
      )}

      {isLoading ? (
         <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <SkeletonLoader className="h-5 w-1/4 mb-4" />
                <SkeletonLoader className="h-5 w-full mt-2" />
                <SkeletonLoader className="h-4 w-full mt-4" />
                <SkeletonLoader className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
      ) : hadiths.length > 0 ? (
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
                <p className="font-bold text-gray-700 dark:text-gray-200">Hadits No. {hadith.number}</p>
                <p className="font-arabic text-xl text-right leading-relaxed text-gray-800 dark:text-gray-200 mt-2">{hadith.arabic}</p>
                <p className="mt-3 text-gray-600 dark:text-gray-400 italic">"{hadith.indonesian}"</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          Tidak ada hadits yang ditemukan untuk kitab ini.
        </p>
      )}

      {totalPages > 1 && !isLoading && (
        <div className="mt-8">
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
      )}
    </div>
  );
};
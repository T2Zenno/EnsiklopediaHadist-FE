import React, { useState } from 'react';
import { type Hadith } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowLeftIcon, BrainCircuitIcon, LinkIcon, StarIcon, ClipboardIcon, CheckIcon } from './IconComponents';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SkeletonLoader } from './SkeletonLoader';

interface HadithDetailViewProps {
  hadith: Hadith;
  aiExplanation: string;
  relatedHadiths: Hadith[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelectHadith: (hadith: Hadith) => void;
  isTogglingFavorite: boolean;
}

const AIContentSection: React.FC<{
    title: string;
    content: string;
    isLoading: boolean;
    error: string | null;
    icon: React.ReactNode;
}> = ({ title, content, isLoading, error, icon }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Gagal menyalin teks: ', err);
        });
    };

    return (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 relative group">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-3 dark:bg-emerald-900/50 dark:text-emerald-400">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">{title}</h3>
            </div>
            
            {!isLoading && !error && content && (
                <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                    aria-label="Salin ke papan klip"
                >
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                </button>
            )}

            {isLoading && (
                 <div className="space-y-3">
                    <SkeletonLoader className="h-4 w-3/4" />
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-5/6" />
                    <div className="flex items-center justify-center pt-4">
                      <LoadingSpinner />
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">AI sedang menganalisis...</span>
                    </div>
                </div>
            )}
            {error && <p className="text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
            {!isLoading && !error && content && (
                <MarkdownRenderer content={content} />
            )}
            {!isLoading && !error && !content && (
                 <div className="text-gray-500 dark:text-gray-400">Konten tidak tersedia.</div>
            )}
        </div>
    );
};

export const HadithDetailView: React.FC<HadithDetailViewProps> = ({
  hadith,
  aiExplanation,
  relatedHadiths,
  isLoading,
  error,
  onBack,
  isFavorite,
  onToggleFavorite,
  onSelectHadith,
  isTogglingFavorite,
}) => {
  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
        <ArrowLeftIcon />
        <span className="ml-2">Kembali</span>
      </button>

      <div className="p-6 md:p-8 bg-white border border-gray-200 rounded-lg shadow-sm relative dark:bg-gray-800 dark:border-gray-700">
        <button
            onClick={onToggleFavorite}
            disabled={isTogglingFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isTogglingFavorite
                ? 'opacity-50 cursor-not-allowed'
                : 'text-gray-400 hover:bg-amber-100 hover:text-amber-500 dark:hover:bg-gray-700'
            }`}
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
            <StarIcon filled={isFavorite} />
        </button>
        
        <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{hadith.book} No. {hadith.number}</h2>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:order-1">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Terjemahan</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">"{hadith.indonesian}"</p>
            </div>
            <div className="md:order-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-right">Matan (Teks Arab)</h3>
                <p className="font-arabic text-3xl text-right leading-loose text-gray-900 dark:text-gray-100">{hadith.arabic}</p>
            </div>
        </div>
      </div>

      <AIContentSection 
        title="Penjelasan dari AI"
        content={aiExplanation}
        isLoading={isLoading}
        error={error}
        icon={<BrainCircuitIcon />}
      />

      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mr-3 dark:bg-emerald-900/50 dark:text-emerald-400">
            <LinkIcon />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Hadits Terkait</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700/60">
                <SkeletonLoader className="h-5 w-1/3 mb-3" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-4/5 mt-2" />
              </div>
            ))}
          </div>
        ) : relatedHadiths.length > 0 ? (
          <div className="space-y-3">
            {relatedHadiths.map(relHadith => (
              <div 
                key={relHadith.id}
                onClick={() => onSelectHadith(relHadith)}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
              >
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">{relHadith.book} No. {relHadith.number}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                  "{relHadith.indonesian.substring(0, 120)}{relHadith.indonesian.length > 120 ? '...' : ''}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Tidak ada hadits terkait yang relevan ditemukan oleh AI.</p>
        )}
      </div>
    </div>
  );
};

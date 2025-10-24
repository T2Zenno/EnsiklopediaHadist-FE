import React from 'react';
import { SparklesIcon } from './IconComponents';

interface FooterBannerProps {
  onCTAClick: () => void;
}

export const FooterBanner: React.FC<FooterBannerProps> = ({ onCTAClick }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-emerald-600 px-6 py-16 text-center shadow-xl rounded-2xl sm:px-16">
          <div className="absolute -top-24 -left-12 transform-gpu blur-3xl" aria-hidden="true">
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-emerald-400 to-green-300 opacity-20"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <SparklesIcon className="mx-auto h-12 w-12 text-white/80" />
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Temukan Hikmah dalam Setiap Kata
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-emerald-100">
            Manfaatkan kekuatan AI untuk menggali lebih dalam makna hadits dan temukan panduan untuk kehidupan Anda.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6 relative z-10">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onCTAClick();
              }}
              className="rounded-md bg-white px-5 py-3 text-base font-semibold text-emerald-600 shadow-sm hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              Mulai Mencari
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

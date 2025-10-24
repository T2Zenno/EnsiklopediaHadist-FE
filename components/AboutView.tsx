import React from 'react';
import { ArrowLeftIcon } from './IconComponents';

export const AboutView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
        <ArrowLeftIcon />
        <span className="ml-2">Kembali</span>
      </button>

      <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Tentang Ensiklopedia Hadits AI</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                Ensiklopedia Hadits AI adalah sebuah platform modern yang dirancang untuk memudahkan umat Islam dalam mengakses, mempelajari, dan memahami hadits-hadits Nabi Muhammad SAW. Misi kami adalah menjembatani warisan ilmu hadits yang kaya dengan kemajuan teknologi, sehingga menjadikannya lebih mudah diakses dan relevan bagi generasi masa kini.
            </p>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Bagaimana Cara Kerjanya?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                Aplikasi ini menggabungkan database hadits dari kitab-kitab terpercaya dengan kekuatan kecerdasan buatan (AI) canggih dari Google. Saat Anda melihat detail sebuah hadits, kami menggunakan model AI Gemini untuk:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 pl-4 text-gray-600 dark:text-gray-400">
                <li>
                    <strong>Memberikan Penjelasan (Syarah):</strong> AI menganalisis teks hadits untuk memberikan penjelasan yang mendalam, mencakup konteks sejarah, pelajaran yang dapat dipetik, dan relevansinya dalam kehidupan sehari-hari.
                </li>
                <li>
                    <strong>Menemukan Hadits Terkait:</strong> AI mencari hadits lain dari berbagai kitab yang memiliki tema atau pesan serupa, membantu Anda melihat gambaran yang lebih utuh mengenai suatu topik.
                </li>
            </ul>
             <p className="mt-4 text-sm text-gray-500 dark:text-gray-500 italic">
                <strong>Penting:</strong> Konten yang dihasilkan oleh AI bertujuan sebagai alat bantu belajar dan pemahaman awal. Untuk pendalaman dan fatwa hukum, sangat dianjurkan untuk merujuk kepada para ulama dan ahli hadits yang kompeten.
            </p>
        </div>
        
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Kontak & Masukan</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                Kami sangat menghargai masukan, saran, atau laporan jika Anda menemukan masalah pada aplikasi ini. Jangan ragu untuk menghubungi kami melalui email.
            </p>
            <div className="mt-4">
                 <a href="mailto:feedback@ensiklopedia-hadits.ai" className="inline-block px-5 py-2 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-colors">
                    Kirim Umpan Balik
                </a>
            </div>
        </div>

      </div>
    </div>
  );
};
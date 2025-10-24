import React, { useState, useCallback, useEffect, useRef } from 'react';
import { type Hadith, type HadithBook, type HadithFigure, type User } from './types';
import { getHadithExplanation, findRelatedHadith } from './services/geminiService';
import { loginUser, registerUser, logoutUser, getCurrentUser, getFavorites, addFavorite, removeFavorite, setAuthToken, getAllUsers, createUser, updateUser, deleteUser } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { HadithDetailView } from './components/HadithDetailView';
import { ArrowLeftIcon, StarIcon, BookIcon, UsersIcon, SearchIcon, SparklesIcon, ArrowUpIcon } from './components/IconComponents';
import { BookHadithListView } from './components/BookHadithListView';
import { FavoritesView } from './components/FavoritesView';
import { Highlight } from './components/Highlight';
import { FooterBanner } from './components/FooterBanner';
import { AboutView } from './components/AboutView';
import { SkeletonLoader } from './components/SkeletonLoader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Pagination } from './components/Pagination';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';

// --- API Service Functions ---
const API_BASE_URL = 'https://api.hadith.gading.dev';

interface ApiBook {
  name: string;
  id: string;
  available: number;
}

interface ApiHadith {
  number: number;
  arab: string;
  id: string;
}

const fetchBooks = async (): Promise<ApiBook[]> => {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) throw new Error('Failed to fetch books');
    const data = await response.json();
    return data.data;
};

const fetchHadith = async (bookId: string, hadithNumber: number): Promise<Hadith | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/${hadithNumber}`);
        if (!response.ok) return null;
        const data = await response.json();
        const apiHadith = data.data.contents;
        return {
            id: `${data.data.id}-${apiHadith.number}`,
            book: data.data.name,
            bookId: data.data.id,
            number: apiHadith.number,
            arabic: apiHadith.arab,
            indonesian: apiHadith.id,
        };
    } catch (e) {
        console.error(e);
        return null;
    }
};

// --- AUTHENTICATION & USER DATA SERVICE (using backend API) ---

// Initialize user favorites from API
const loadUserFavorites = async (user: User): Promise<User> => {
    try {
        const favorites = await getFavorites();
        const favoriteHadiths: Hadith[] = [];

        for (const fav of favorites) {
            const hadith = await fetchHadith(fav.book_id, fav.hadith_number);
            if (hadith) {
                favoriteHadiths.push(hadith);
            }
        }

        return {
            ...user,
            favorites: favoriteHadiths.map(h => h.id),
            favoritesList: favoriteHadiths,
        };
    } catch (error) {
        console.error('Failed to load user favorites:', error);
        return {
            ...user,
            favorites: [],
            favoritesList: [],
        };
    }
};


// Static data that is not available from the API
const HADITH_BOOK_DESCRIPTIONS: Record<string, string> = {
  'bukhari': "Kitab hadits paling shahih yang disusun oleh Imam Al-Bukhari, berisi hadits-hadits pilihan yang diseleksi dari ratusan ribu hadits.",
  'muslim': "Kitab hadits shahih kedua setelah Shahih Bukhari, terkenal dengan sistematika penyusunan yang sangat baik dan ketat dalam seleksi sanad.",
  'tirmidzi': "Dikenal juga sebagai Jami' at-Tirmidzi, kitab ini tidak hanya memuat hadits tetapi juga pendapat para ulama fiqih mengenai hadits tersebut.",
  'nasai': "Sunan An-Nasa'i atau Al-Mujtaba, dikenal karena memiliki syarat perawi yang paling ketat di antara kitab-kitab Sunan lainnya.",
  'abu-daud': "Kitab Sunan yang fokus pada hadits-hadits hukum (fiqih), menjadi salah satu rujukan utama dalam istinbath hukum Islam.",
  'ibnu-majah': "Salah satu dari Kutubus Sittah yang memuat hadits-hadits yang tidak terdapat dalam lima kitab lainnya, meskipun juga memuat hadits dha'if.",
  'ahmad': "Musnad Ahmad, salah satu kitab hadits terbesar yang disusun berdasarkan nama sahabat yang meriwayatkan hadits.",
  'darimi': "Sunan ad-Darimi, sebuah kitab hadits yang juga dikenal dengan nama Musnad ad-Darimi.",
  'malik': "Al-Muwatta, karya Imam Malik yang merupakan salah satu kitab hadits tertua dan menggabungkan hadits dengan fiqih.",
};

const HADITH_FIGURES: HadithFigure[] = [
    {
        slug: 'imam-bukhari',
        name: 'Imam Al-Bukhari',
        title: 'Amirul Mukminin fil Hadits',
        birth_death: '194 H - 256 H',
        bio: "Nama lengkapnya Abu Abdillah Muhammad bin Ismail al-Bukhari. Lahir di Bukhara, Uzbekistan. Ia adalah seorang ahli hadits yang paling terkemuka, dikenal karena kecerdasan, kekuatan hafalan, dan ketelitiannya yang luar biasa dalam menyeleksi hadits. Kitabnya, Shahih al-Bukhari, dianggap sebagai kitab paling otentik setelah Al-Qur'an.",
        works: ['Shahih al-Bukhari', 'Al-Adab al-Mufrad', 'At-Tarikh al-Kabir', 'At-Tarikh as-Saghir']
    },
    {
        slug: 'imam-muslim',
        name: 'Imam Muslim',
        title: 'Ahli Hadits',
        birth_death: '204 H - 261 H',
        bio: 'Nama lengkapnya Abul Husain Muslim bin al-Hajjaj al-Qusyairi an-Naisaburi. Lahir di Naisabur, Iran. Ia adalah murid dari Imam al-Bukhari dan merupakan salah satu ahli hadits terbesar. Kitab Shahih Muslim karyanya menempati posisi kedua sebagai kitab hadits paling shahih.',
        works: ['Shahih Muslim', 'Al-Kuna wal Asma', 'At-Tamyiz']
    },
    {
        slug: 'imam-syafii',
        name: "Imam Asy-Syafi'i",
        title: "Pendiri Mazhab Syafi'i & Perintis Ushul Fiqih",
        birth_death: '150 H - 204 H',
        bio: "Nama lengkapnya Abu Abdillah Muhammad bin Idris asy-Syafi'i. Lahir di Gaza, Palestina, dan merupakan keturunan Quraisy. Ia adalah seorang ahli fiqih, ushul fiqih, dan hadits yang luar biasa. Ia adalah murid dari Imam Malik, sehingga ia menggabungkan pemahaman ahlu hadits (Madinah) dan ahlu ra'yi (Iraq). Karyanya 'Ar-Risalah' adalah kitab pertama yang membakukan ilmu Ushul Fiqih, meletakkan dasar metodologi untuk memahami sumber-sumber hukum Islam. Mazhab Syafi'i yang didirikannya menjadi salah satu mazhab fiqih terbesar di dunia.",
        works: ['Ar-Risalah', 'Al-Umm', "Musnad asy-Syafi'i"]
    },
    {
        slug: 'imam-abu-daud',
        name: 'Imam Abu Daud',
        title: 'Penyusun Hadits-hadits Hukum',
        birth_death: '202 H - 275 H',
        bio: "Nama lengkapnya Abu Daud Sulaiman bin al-Asy'ats as-Sijistani. Beliau adalah seorang ahli hadits terkemuka yang menyusun \"Sunan Abu Daud\". Kitabnya sangat dihormati karena fokus utamanya adalah mengumpulkan hadits-hadits yang menjadi landasan hukum fiqih (istinbath al-ahkam). Dikatakan bahwa seorang ahli fiqih cukup merujuk pada Al-Qur'an dan kitab Sunan Abu Daud ini.",
        works: ['Sunan Abu Daud', 'Kitab al-Marasil', 'Kitab al-Qadr']
    },
    {
        slug: 'imam-tirmidzi',
        name: 'Imam At-Tirmidzi',
        title: 'Ahli Hadits dan Fiqih',
        birth_death: '209 H - 279 H',
        bio: "Nama lengkapnya Abu Isa Muhammad bin Isa at-Tirmidzi. Dikenal karena karyanya Sunan at-Tirmidzi (Jami' at-Tirmidzi) yang tidak hanya memuat hadits, tetapi juga klasifikasi status hadits (shahih, hasan, dhaif) dan pandangan para fuqaha (ahli fiqih).",
        works: ["Jami' at-Tirmidzi", "Asy-Syama'il al-Muhammadiyyah"]
    },
    {
        slug: 'imam-nasai',
        name: "Imam An-Nasa'i",
        title: 'Ahli Hadits dengan Syarat Perawi Paling Ketat',
        birth_death: '215 H - 303 H',
        bio: "Nama lengkapnya Abu Abdurrahman Ahmad bin Syu'aib an-Nasa'i. Lahir di Nasa, Turkmenistan. Beliau dikenal karena kitabnya \"As-Sunan al-Kubra\" yang kemudian diringkas menjadi \"Al-Mujtaba\" atau \"Sunan an-Nasa'i\". Kitabnya dianggap memiliki syarat perawi yang paling ketat di antara kitab-kitab Sunan lainnya, bahkan lebih ketat dari Imam Muslim dalam beberapa aspek.",
        works: ["Sunan an-Nasa'i (Al-Mujtaba)", 'As-Sunan al-Kubra', "Fadha'il ash-Shahabah"]
    },
    {
        slug: 'imam-ibnu-majah',
        name: 'Imam Ibnu Majah',
        title: 'Ahli Hadits dan Mufassir',
        birth_death: '209 H - 273 H',
        bio: "Nama lengkapnya Abu Abdillah Muhammad bin Yazid al-Qazwini. Karyanya \"Sunan Ibnu Majah\" melengkapi koleksi Kutubus Sittah (enam kitab hadits utama). Meskipun kitabnya juga memuat beberapa hadits yang dinilai dha'if (lemah) oleh ulama lain, ia memiliki keistimewaan dalam sistematika bab dan memuat hadits-hadits yang tidak ditemukan di lima kitab lainnya.",
        works: ['Sunan Ibnu Majah', "Tafsir al-Qur'an", 'Tarikh Qazwin']
    },
    {
        slug: 'imam-ahmad',
        name: 'Imam Ahmad bin Hanbal',
        title: "Imam Ahlus Sunnah wal Jama'ah",
        birth_death: '164 H - 241 H',
        bio: "Nama lengkapnya Abu Abdillah Ahmad bin Muhammad bin Hanbal asy-Syaibani. Salah satu dari empat imam mazhab fiqih dan seorang ahli hadits yang gigih. Karyanya yang monumental, \"Musnad Ahmad\", adalah salah satu kitab hadits terbesar yang berisi lebih dari 27,000 hadits. Ia dikenal karena keteguhannya dalam mempertahankan aqidah Ahlus Sunnah dalam peristiwa \"Mihnah\" (ujian keyakinan Al-Qur'an sebagai makhluk).",
        works: ['Musnad Ahmad', 'Kitab as-Sunnah', "Kitab al-Wara'", 'Kitab az-Zuhd']
    },
    {
        slug: 'imam-malik',
        name: 'Imam Malik bin Anas',
        title: 'Imam Dar al-Hijrah (Imam Kota Madinah)',
        birth_death: '93 H - 179 H',
        bio: "Pendiri Mazhab Maliki, salah satu dari empat mazhab fiqih Sunni. Lahir dan wafat di Madinah, sehingga dijuluki Imam Dar al-Hijrah (Imam Kota Hijrah). Karyanya, 'Al-Muwatta', adalah salah satu kitab hadits paling awal dan sangat berpengaruh, menjadi rujukan bagi para ulama setelahnya, termasuk menjadi guru bagi Imam Asy-Syafi'i. Kitab ini unik karena menggabungkan hadits Nabi dengan perkataan sahabat, tabi'in, dan ijtihad fiqih. Imam Asy-Syafi'i pernah berkata, 'Tidak ada kitab di muka bumi setelah Kitabullah yang lebih shahih daripada Al-Muwatta' karya Malik.'",
        works: ["Al-Muwatta'", 'Al-Mudawwana al-Kubra (diriwayatkan oleh muridnya)']
    },
    {
        slug: 'abu-hurairah',
        name: 'Abu Hurairah',
        title: 'Sahabat Nabi & Perawi Hadits Terbanyak',
        birth_death: 'Wafat 57 H',
        bio: "Nama aslinya adalah Abdurrahman bin Shakhr ad-Dausi, dikenal dengan kunyah Abu Hurairah (Bapak Kucing Kecil) karena kecintaannya pada kucing. Ia adalah sahabat Nabi yang paling banyak meriwayatkan hadits, dengan lebih dari 5,000 riwayat. Meskipun hanya bersama Nabi selama sekitar 4 tahun, ia mendedikasikan seluruh waktunya untuk menyertai Rasulullah SAW dan menghafal sabda-sada beliau. Rasulullah pernah mendoakannya agar memiliki ingatan yang kuat. Setelah wafatnya Nabi, ia menjadi seorang guru dan rujukan utama bagi para tabi'in dalam ilmu hadits.",
        works: ['Meriwayatkan lebih dari 5,300 hadits']
    },
    {
        slug: 'abdullah-bin-umar',
        name: 'Abdullah bin Umar',
        title: 'Sahabat Nabi & Ahli Fiqih',
        birth_death: 'Wafat 73 H',
        bio: "Putra dari Khalifah kedua, Umar bin Khattab. Ia masuk Islam sejak kecil bersama ayahnya. Abdullah bin Umar dikenal karena ketakwaannya yang luar biasa dan semangatnya yang tinggi dalam mengikuti sunnah (ittiba') Nabi Muhammad SAW secara harfiah. Ia sangat berhati-hati dalam meriwayatkan hadits dan mengeluarkan fatwa, membuatnya menjadi salah satu rujukan utama dalam fiqih di kalangan sahabat.",
        works: ['Meriwayatkan sekitar 2,630 hadits']
    },
    {
        slug: 'aisyah-bint-abi-bakar',
        name: 'Aisyah bint Abi Bakar',
        title: "Ummul Mu'minin & Perawi Hadits Wanita Terkemuka",
        birth_death: 'Wafat 58 H',
        bio: "Salah satu istri Nabi Muhammad SAW dan putri dari sahabat Abu Bakar Ash-Shiddiq. Beliau adalah seorang wanita yang sangat cerdas, memiliki pemahaman mendalam tentang Al-Qur'an, hadits, dan fiqih. Aisyah meriwayatkan lebih dari 2,000 hadits, banyak di antaranya berkaitan dengan kehidupan pribadi Nabi dan hukum-hukum kewanitaan. Ia menjadi rujukan utama para sahabat setelah wafatnya Rasulullah.",
        works: ['Meriwayatkan sekitar 2,210 hadits']
    }
];

type Theme = 'light' | 'dark';
type View = 'home' | 'searchResults' | 'detail' | 'bookView' | 'favorites' | 'sources' | 'figures' | 'figureDetail' | 'about' | 'login' | 'register' | 'dashboard';


// --- Inlined Components for new features ---

const InfoCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-500 cursor-pointer transition-all duration-300 transform hover:-trangray-y-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500">
        <div className="flex items-center">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full dark:bg-emerald-900/50 dark:text-emerald-400">{icon}</div>
            <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </div>
    </div>
);

const SourcesView: React.FC<{ books: HadithBook[]; onSelectBook: (book: HadithBook) => void; onBack: () => void; }> = ({ books, onSelectBook, onBack }) => (
    <div>
        <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
            <ArrowLeftIcon />
            <span className="ml-2">Kembali</span>
        </button>
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sumber-sumber Hadits</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Jelajahi kitab-kitab hadits yang menjadi rujukan utama umat Islam.</p>
        </div>
        <div className="space-y-6">
            {books.map(book => (
                <div key={book.slug} onClick={() => onSelectBook(book)} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{book.name}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Perawi: {book.narrator}</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{book.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const FiguresView: React.FC<{ figures: HadithFigure[]; onSelectFigure: (figure: HadithFigure) => void; onBack: () => void; }> = ({ figures, onSelectFigure, onBack }) => (
    <div>
        <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
            <ArrowLeftIcon />
            <span className="ml-2">Kembali</span>
        </button>
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Tokoh-Tokoh Hadits</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Kenali biografi singkat para imam dan perawi hadits terkemuka.</p>
        </div>
        <div className="space-y-4">
            {figures.map(figure => (
                <div key={figure.slug} onClick={() => onSelectFigure(figure)} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{figure.name} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{figure.title}</span></h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{figure.birth_death}</p>
                </div>
            ))}
        </div>
    </div>
);

const FigureDetailView: React.FC<{ figure: HadithFigure; onBack: () => void; }> = ({ figure, onBack }) => (
    <div>
        <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
            <ArrowLeftIcon />
            <span className="ml-2">Kembali</span>
        </button>
        <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{figure.name}</h2>
            <p className="text-lg text-emerald-600 dark:text-emerald-400">{figure.title}</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{figure.birth_death}</p>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Biografi</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{figure.bio}</p>
            </div>
            {figure.works.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">Karya Terkenal</h3>
                    <ul className="list-disc list-inside space-y-2 pl-4 text-gray-600 dark:text-gray-300">
                        {figure.works.map((work, index) => <li key={index}>{work}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

// --- Dashboard Components (Inlined) ---

const UserFormModal: React.FC<{
    user: Partial<User> | null;
    onSave: (user: any) => void;
    onClose: () => void;
}> = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        passwordHash: '', // Always empty for security, only for setting new pass
        role: user?.role || 'user',
    });
    const isEditing = !!user?.email;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h3 className="text-xl font-bold">{isEditing ? 'Edit Pengguna' : 'Buat Pengguna'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Pengguna</label>
                            <input type="text" name="username" placeholder="cth. Budi Setiawan" value={formData.username} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input type="email" name="email" placeholder="cth. budi@email.com" value={formData.email} onChange={handleChange} required disabled={isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="passwordHash" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input type="password" name="passwordHash" placeholder={isEditing ? "Biarkan kosong untuk mempertahankan password saat ini" : "Wajib diisi"} value={formData.passwordHash} onChange={handleChange} required={!isEditing} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peran</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="user">Pengguna</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface DashboardViewProps {
    currentUserEmail: string;
    onBack: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ currentUserEmail, onBack }) => {
    const [userList, setUserList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [filterTerm, setFilterTerm] = useState('');

    const handleUpdateUser = async (updatedUser: User): Promise<{ success: boolean, message: string }> => {
        try {
            const result = await updateUser(updatedUser.id, {
                username: updatedUser.username,
                email: updatedUser.email,
                passwordHash: updatedUser.passwordHash,
                role: updatedUser.role,
            });
            if (result.success) {
                setUserList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }
            return result;
        } catch (error) {
            console.error('Failed to update user:', error);
            return { success: false, message: 'Failed to update user' };
        }
    };

    const handleDeleteUser = async (email: string): Promise<{ success: boolean, message: string }> => {
        try {
            const userToDelete = userList.find(u => u.email === email);
            if (!userToDelete) {
                return { success: false, message: 'User not found' };
            }
            const result = await deleteUser(userToDelete.id);
            if (result.success) {
                setUserList(prev => prev.filter(u => u.email !== email));
            }
            return result;
        } catch (error) {
            console.error('Failed to delete user:', error);
            return { success: false, message: 'Failed to delete user' };
        }
    };

    const handleCreateUser = async (newUser: Pick<User, 'username' | 'email' | 'passwordHash' | 'role'>): Promise<{ success: boolean; message: string; user?: User; }> => {
        try {
            const result = await createUser({
                username: newUser.username,
                email: newUser.email,
                passwordHash: newUser.passwordHash,
                role: newUser.role,
            });
            if (result.success && result.user) {
                setUserList(prev => [...prev, result.user!]);
            }
            return result;
        } catch (error) {
            console.error('Failed to create user:', error);
            return { success: false, message: 'Failed to create user' };
        }
    };

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                const users = await getAllUsers();
                setUserList(users);
            } catch (error) {
                console.error('Failed to load users:', error);
                setUserList([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, []);

    const formatDate = (isoString: string | undefined) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };
    
    const handleExportCSV = () => {
        const headers = ["Nama Pengguna", "Email", "Peran", "Tanggal Dibuat"];
        const csvRows = [
            headers.join(','), // header row
            ...userList.map(user => 
                [
                    `"${user.username.replace(/"/g, '""')}"`, // handle quotes in username
                    `"${user.email}"`,
                    `"${user.role}"`,
                    `"${formatDate(user.createdAt)}"`
                ].join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'pengguna_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const handleCreateClick = () => {
        setEditingUser({});
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (email: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${email}? Tindakan ini tidak dapat dibatalkan.`)) {
            const result = await handleDeleteUser(email);
            if(result.success) {
                alert(result.message);
                setUserList(prev => prev.filter(u => u.email !== email));
            } else {
                alert(result.message);
            }
        }
    };

    const handleSaveUser = async (formData: any) => {
        let result;
        if (editingUser?.email) { // Editing existing user
            const updatedData = { ...editingUser, ...formData };
            if (!formData.passwordHash) {
                // If password is blank, don't update it. Find existing hash.
                const existingUser = userList.find(u => u.email === editingUser.email);
                updatedData.passwordHash = existingUser!.passwordHash;
            }
            result = await handleUpdateUser(updatedData as User);
            if (result.success) {
                 setUserList(prev => prev.map(u => u.email === updatedData.email ? updatedData as User : u));
            }
        } else { // Creating new user
            result = await handleCreateUser(formData);
            if (result.success && result.user) {
                setUserList(prev => [...prev, result.user!]);
            }
        }

        if (result.success) {
            alert(result.message);
            setIsModalOpen(false);
            setEditingUser(null);
        } else {
            alert(result.message);
        }
    };
    
    const filteredUsers = (userList || []).filter(user =>
        user.username.toLowerCase().includes(filterTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filterTerm.toLowerCase())
    );


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div>
             {isModalOpen && <UserFormModal user={editingUser} onSave={handleSaveUser} onClose={() => setIsModalOpen(false)} />}
            <button onClick={onBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
                <ArrowLeftIcon />
                <span className="ml-2">Kembali</span>
            </button>
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manajemen Pengguna</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Buat, edit, dan kelola akun pengguna.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                        Ekspor CSV
                    </button>
                    <button onClick={handleCreateClick} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700">
                        Buat Pengguna
                    </button>
                </div>
            </div>

            <div className="my-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama pengguna atau email..."
                        value={filterTerm}
                        onChange={(e) => setFilterTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <SearchIcon />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Pengguna</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Peran</th>
                            <th scope="col" className="px-6 py-3">Tanggal Dibuat</th>
                            <th scope="col" className="px-6 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.email} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                        {user.role === 'admin' ? 'Admin' : 'Pengguna'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEditClick(user)} className="font-medium text-emerald-600 dark:text-emerald-500 hover:underline mr-4">Edit</button>
                                    <button
                                        onClick={() => handleDeleteClick(user.email)}
                                        disabled={user.email === currentUserEmail}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    Tidak ada pengguna yang cocok dengan pencarian Anda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-[99] p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-900 transition-all duration-300 ${isVisible ? 'opacity-100 trangray-y-0' : 'opacity-0 trangray-y-4 pointer-events-none'}`}
            aria-label="Kembali ke atas"
        >
            <ArrowUpIcon />
        </button>
    );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [view, setView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>(['home']);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHadiths, setFilteredHadiths] = useState<Hadith[]>([]);
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [selectedFigure, setSelectedFigure] = useState<HadithFigure | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [relatedHadiths, setRelatedHadiths] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hadithBooks, setHadithBooks] = useState<HadithBook[]>([]);
  const [recommendedHadiths, setRecommendedHadiths] = useState<Hadith[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const SEARCH_ITEMS_PER_PAGE = 20;
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [togglingFavorites, setTogglingFavorites] = useState<Set<string>>(new Set());

  const changeView = useCallback((newView: View, isBackAction = false) => {
    setView(prevView => {
        if (prevView === newView) return prevView;
        if (!isBackAction) {
          setHistory(prevHistory => [...prevHistory, newView]);
        }
        return newView;
    });
  }, []);

  const handleBack = useCallback(() => {
    if (isSearching) {
        abortControllerRef.current?.abort();
        setIsSearching(false);
        setSearchStatus('Pencarian dihentikan.');
    }
    setHistory(prevHistory => {
        if (prevHistory.length > 1) {
            const newHistory = prevHistory.slice(0, -1);
            const prevView = newHistory[newHistory.length - 1];
             if (['home', 'searchResults', 'sources', 'figures'].includes(prevView)) {
                setSelectedHadith(null);
                setSelectedBook(null);
                setSelectedFigure(null);
                setAiExplanation('');
                setRelatedHadiths([]);
            }
            changeView(prevView, true);
            return newHistory;
        }
        changeView('home', true);
        return ['home'];
    });
  }, [isSearching, changeView]);

  useEffect(() => {
    const loadBooks = async () => {
        try {
            const apiBooks = await fetchBooks();
            const transformedBooks: HadithBook[] = apiBooks.map(book => ({
                slug: book.id,
                name: book.name,
                narrator: `Imam ${book.name.replace('HR. ', '')}`,
                totalHadiths: book.available,
                description: HADITH_BOOK_DESCRIPTIONS[book.id] || "Deskripsi untuk kitab ini belum tersedia.",
            }));
            setHadithBooks(transformedBooks);
        } catch (error) {
            console.error("Failed to load hadith books:", error);
            setError("Gagal memuat daftar kitab hadits.");
        }
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (hadithBooks.length === 0) return;

      setIsRecommendationsLoading(true);
      const results: Hadith[] = [];
      const attempted = new Set<string>();
      let maxTries = 15; // Safeguard against infinite loops

      try {
        while (results.length < 6 && maxTries > 0) {
          const hadithsToFetch = 6 - results.length;
          const shuffledBooks = [...hadithBooks].sort(() => 0.5 - Math.random());
          const promises: Promise<Hadith | null>[] = [];

          for (let i = 0; i < hadithsToFetch; i++) {
            const book = shuffledBooks[i % shuffledBooks.length];
            const randomNumber = Math.floor(Math.random() * book.totalHadiths) + 1;
            const key = `${book.slug}-${randomNumber}`;

            if (!attempted.has(key)) {
              attempted.add(key);
              promises.push(fetchHadith(book.slug, randomNumber));
            }
          }
          
          if (promises.length > 0) {
              const newHadiths = (await Promise.all(promises)).filter(Boolean) as Hadith[];
              results.push(...newHadiths);
          }

          maxTries--;
        }
        setRecommendedHadiths(results);

      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [hadithBooks]);
  
  // Initialize auth on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        const mappedUser = {
          ...user,
          username: user.name || user.username || '',
          name: undefined,
        };
        const userWithFavorites = await loadUserFavorites(mappedUser);
        setCurrentUser(userWithFavorites);
        setView('home');
        setHistory(['home']);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setCurrentUser(null);
        setView('login');
        setHistory(['login']);
      } finally {
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);




  
  
  const handleRegister = async (username: string, email: string, password: string): Promise<{success: boolean; message: string}> => {
    try {
      const response = await registerUser(username, email, password, password);
      const mappedUser = {
        ...response.user,
        username: response.user.name || response.user.username || '',
        name: undefined,
      };
      setAuthToken(response.token);
      const userWithFavorites = await loadUserFavorites(mappedUser);
      setCurrentUser(userWithFavorites);
      changeView('home');
      setHistory(['home']);
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser(email, password);
      const mappedUser = {
        ...response.user,
        username: response.user.name || response.user.username || '',
        name: undefined,
      };
      setAuthToken(response.token);
      const userWithFavorites = await loadUserFavorites(mappedUser);
      setCurrentUser(userWithFavorites);
      changeView('home');
      setHistory(['home']);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      changeView('login');
      setHistory(['login']);
    }
  };

  const handleToggleFavorite = async (hadith: Hadith) => {
    if (!currentUser) return;

    const hadithId = hadith.id;
    if (togglingFavorites.has(hadithId)) return; // Prevent spam clicks

    setTogglingFavorites(prev => new Set(prev).add(hadithId));

    const isFavorite = currentUser.favorites.includes(hadithId);

    try {
      if (isFavorite) {
        await removeFavorite(hadithId);
      } else {
        await addFavorite(hadithId, hadith.bookId, hadith.number);
      }

      const newFavorites = isFavorite
          ? currentUser.favorites.filter(id => id !== hadithId)
          : [...currentUser.favorites, hadithId];

      const newFavoritesList = isFavorite
          ? currentUser.favoritesList.filter(h => h.id !== hadithId)
          : [...currentUser.favoritesList, hadith];

      const updatedUser: User = {
          ...currentUser,
          favorites: newFavorites,
          favoritesList: newFavoritesList,
      };

      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setTogglingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(hadithId);
        return newSet;
      });
    }
};


  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setFilteredHadiths([]);
      setSearchStatus('');
      return;
    }

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsSearching(true);
    setFilteredHadiths([]);
    setSearchCurrentPage(1);
    changeView('searchResults');
    setError(null);

    const lowerCaseQuery = query.toLowerCase();

    try {
        for (const book of hadithBooks) {
            if (signal.aborted) throw new DOMException('Search aborted by user', 'AbortError');
            setSearchStatus(`Memindai ${book.name}...`);
            const totalBatches = Math.ceil(book.totalHadiths / 300);

            for (let i = 0; i < totalBatches; i++) {
                if (signal.aborted) throw new DOMException('Search aborted by user', 'AbortError');
                const start = i * 300 + 1;
                const end = Math.min((i + 1) * 300, book.totalHadiths);
                
                await new Promise(resolve => setTimeout(resolve, 0));

                const response = await fetch(`${API_BASE_URL}/books/${book.slug}?range=${start}-${end}`, { signal });
                if (!response.ok) {
                    console.warn(`Gagal memuat batch untuk ${book.name}`);
                    continue; 
                }
                const data = await response.json();
                const hadithsInBatch: any[] = data.data.hadiths;

                const matches = hadithsInBatch.filter(h => 
                    h.arab.includes(lowerCaseQuery) || 
                    h.id.toLowerCase().includes(lowerCaseQuery)
                ).map((h: ApiHadith) => ({
                    id: `${book.slug}-${h.number}`,
                    book: book.name,
                    bookId: book.slug,
                    number: h.number,
                    arabic: h.arab,
                    indonesian: h.id,
                }));

                if (matches.length > 0) {
                    setFilteredHadiths(prev => [...prev, ...matches]);
                }
            }
        }
        setFilteredHadiths(currentHadiths => {
            setSearchStatus(`Pencarian selesai. Ditemukan ${currentHadiths.length} hasil.`);
            return currentHadiths;
        });
    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.log('Pencarian dibatalkan oleh pengguna.');
            setSearchStatus('Pencarian dihentikan.');
        } else {
            setError('Pencarian gagal, terjadi kesalahan jaringan.');
            console.error(e);
        }
    } finally {
        setIsSearching(false);
    }
  }, [hadithBooks, changeView]);
  

  const handleSelectHadithById = async (bookId: string, hadithNumber: number) => {
    setIsLoading(true);
    setAiExplanation('');
    setRelatedHadiths([]);
    setError(null);
    changeView('detail');

    try {
        const hadith = await fetchHadith(bookId, hadithNumber);
        if (hadith) {
            setSelectedHadith(hadith);
            
            const explanationPromise = getHadithExplanation(hadith.indonesian);
            const relatedPromise = findRelatedHadith(hadith.indonesian);

            const [explanation, relatedResults] = await Promise.all([explanationPromise, relatedPromise]);
            
            setAiExplanation(explanation);
            
            const relatedHadithPromises = relatedResults.map(res => {
                const book = hadithBooks.find(b => b.name === res.bookName);
                if (book) {
                    return fetchHadith(book.slug, res.hadithNumber);
                }
                return Promise.resolve(null);
            });
            
            const fetchedRelatedHadiths = (await Promise.all(relatedHadithPromises)).filter(Boolean) as Hadith[];
            setRelatedHadiths(fetchedRelatedHadiths);

        } else {
            setError("Hadits tidak ditemukan.");
            changeView('home');
        }
    } catch (e) {
        console.error(e);
        setError("Gagal memuat penjelasan dari AI. Periksa koneksi Anda atau coba lagi nanti.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectHadith = (hadith: Hadith) => {
    handleSelectHadithById(hadith.bookId, hadith.number);
  };
  
  const handleSelectBook = (book: HadithBook) => {
      setSelectedBook(book);
      changeView('bookView');
  };

  const handleSelectFigure = (figure: HadithFigure) => {
      setSelectedFigure(figure);
      changeView('figureDetail');
  };
  
  const handleHomeClick = () => {
      setSelectedHadith(null);
      setSelectedBook(null);
      setFilteredHadiths([]);
      setSearchTerm('');
      changeView('home');
      setHistory(['home']);
  };

  if (!authInitialized) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Memuat...</p>
          </div>
      );
  }

  if (!currentUser) {
      if (view === 'register') {
          return <RegisterView onRegister={handleRegister} onSwitchToLogin={() => changeView('login')} />;
      }
      return <LoginView onLogin={handleLogin} onSwitchToRegister={() => changeView('register')} />;
  }
  
  const paginatedSearchResults = filteredHadiths.slice(
      (searchCurrentPage - 1) * SEARCH_ITEMS_PER_PAGE,
      searchCurrentPage * SEARCH_ITEMS_PER_PAGE
  );

  const renderView = () => {
    const totalSearchPages = Math.ceil(filteredHadiths.length / SEARCH_ITEMS_PER_PAGE);

    switch (view) {
      case 'detail':
        return selectedHadith && (
          <HadithDetailView
            hadith={selectedHadith}
            aiExplanation={aiExplanation}
            relatedHadiths={relatedHadiths}
            isLoading={isLoading}
            error={error}
            onBack={handleBack}
            isFavorite={currentUser?.favorites.includes(selectedHadith.id) ?? false}
            onToggleFavorite={() => handleToggleFavorite(selectedHadith)}
            onSelectHadith={handleSelectHadith}
            isTogglingFavorite={togglingFavorites.has(selectedHadith.id)}
          />
        );
      case 'searchResults':
        return (
          <div>
             <button onClick={handleBack} className="mb-6 flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors font-medium">
                <ArrowLeftIcon />
                <span className="ml-2">Kembali</span>
            </button>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Hasil Pencarian</h2>
                {searchTerm && <p className="text-gray-600 dark:text-gray-400 mt-1">Menampilkan hasil untuk: "{searchTerm}"</p>}
            </div>

            <div ref={searchBarRef} className="sticky top-[81px] bg-transparent z-30 py-4 mb-4 -mx-4 sm:-mx-8 lg:-mx-16 px-4 sm:px-8 lg:px-16">
                 <SearchBar term={searchTerm} onSearch={handleSearch} />
            </div>
            
            <div className="my-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {isSearching && (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner />
                  <p>{searchStatus || 'Mencari...'}</p>
                </div>
              )}
              {!isSearching && filteredHadiths.length > 0 && <p>{searchStatus}</p>}
            </div>

            {filteredHadiths.length > 0 && totalSearchPages > 1 && (
              <div className="mb-8">
                  <Pagination 
                      currentPage={searchCurrentPage}
                      totalPages={totalSearchPages}
                      onPageChange={(page) => {
                          setSearchCurrentPage(page);
                          searchBarRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      showGoToPage={false}
                  />
              </div>
            )}

            <div className="space-y-4">
              {paginatedSearchResults.map(hadith => (
                <div 
                  key={hadith.id} 
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-emerald-500 transition-all group relative dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(hadith);
                    }}
                    disabled={togglingFavorites.has(hadith.id)}
                    className={`absolute top-3 right-3 p-1 rounded-full transition-colors z-10 ${
                      togglingFavorites.has(hadith.id)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'text-gray-400 hover:bg-amber-100 hover:text-amber-500 dark:hover:bg-gray-700'
                    }`}
                    aria-label={currentUser?.favorites.includes(hadith.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                  >
                    <StarIcon filled={currentUser?.favorites.includes(hadith.id) ?? false} />
                  </button>
                  <div onClick={() => handleSelectHadith(hadith)} className="cursor-pointer">
                    <p className="font-bold text-gray-700 dark:text-gray-200 pr-10">{hadith.book} No. {hadith.number}</p>
                    <p className="font-arabic text-xl text-right leading-relaxed text-gray-800 dark:text-gray-200 mt-2">
                        {hadith.arabic}
                    </p>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 italic">
                        "<Highlight text={hadith.indonesian} searchTerm={searchTerm} />"
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {!isSearching && filteredHadiths.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  {searchStatus ? 'Tidak ada hasil ditemukan' : 'Mulai Pencarian Anda'}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {searchStatus ? `Tidak ada hadits yang cocok dengan kata kunci "${searchTerm}".` : 'Gunakan bilah pencarian di atas untuk menemukan hadits.'}
                </p>
              </div>
            )}
            
            {filteredHadiths.length > 0 && totalSearchPages > 1 && (
              <div className="mt-8">
                  <Pagination 
                      currentPage={searchCurrentPage}
                      totalPages={totalSearchPages}
                      onPageChange={(page) => {
                          setSearchCurrentPage(page);
                          searchBarRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                  />
              </div>
            )}
          </div>
        );
      case 'bookView':
        return selectedBook && <BookHadithListView book={selectedBook} onSelectHadith={handleSelectHadith} onBack={handleBack} favoriteHadithIds={currentUser.favorites} onToggleFavorite={handleToggleFavorite} onGlobalSearch={handleSearch} togglingFavorites={togglingFavorites} />;
      case 'favorites':
        return <FavoritesView hadiths={currentUser.favoritesList} onSelectHadith={handleSelectHadith} onBack={handleBack} favoriteHadithIds={currentUser.favorites} onToggleFavorite={handleToggleFavorite} togglingFavorites={togglingFavorites} />;
      case 'sources':
        return <SourcesView books={hadithBooks} onSelectBook={handleSelectBook} onBack={handleBack} />;
      case 'figures':
        return <FiguresView figures={HADITH_FIGURES} onSelectFigure={handleSelectFigure} onBack={handleBack} />;
      case 'figureDetail':
        return selectedFigure && <FigureDetailView figure={selectedFigure} onBack={handleBack} />;
       case 'about':
        return <AboutView onBack={handleBack} />;
      case 'dashboard':
          if (currentUser?.role !== 'admin') {
              handleHomeClick();
              return null;
          }
          return (
              <DashboardView
                  currentUserEmail={currentUser.email}
                  onBack={handleBack}
              />
          );
      case 'home':
      default:
        return (
          <>
            <div className="relative text-center bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-xl dark:from-emerald-800 dark:to-teal-900 overflow-hidden py-16 px-6 sm:py-20">
                <div className="absolute top-0 left-0 -trangray-x-1/4 -trangray-y-1/4 w-96 h-96 bg-teal-500/30 dark:bg-teal-400/20 rounded-full filter blur-3xl opacity-50 animate-pulse" aria-hidden="true"></div>
                <div className="absolute bottom-0 right-0 trangray-x-1/4 trangray-y-1/4 w-96 h-96 bg-emerald-400/30 dark:bg-emerald-300/20 rounded-full filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} aria-hidden="true"></div>

                <div className="relative container mx-auto">
                    <SparklesIcon className="mx-auto h-12 w-12 text-white/80 mb-4" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-lg">Temukan Kedalaman Hadits dengan AI</h1>
                    <p className="mt-4 text-lg text-emerald-100 max-w-2xl mx-auto">Cari, pelajari, dan dapatkan penjelasan mendalam tentang hadits-hadits Nabi Muhammad SAW.</p>
                    <div className="mt-8 max-w-2xl mx-auto">
                        <SearchBar term={searchTerm} onSearch={handleSearch} variant="hero" />
                    </div>
                </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Rekomendasi Hadits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isRecommendationsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className={`${i >= 3 ? 'hidden md:block' : ''} bg-white p-6 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700`}>
                      <SkeletonLoader className="h-5 w-1/2 mb-4" />
                      <SkeletonLoader className="h-4 w-full" />
                      <SkeletonLoader className="h-4 w-full mt-2" />
                      <SkeletonLoader className="h-4 w-5/6 mt-2" />
                    </div>
                  ))
                ) : (
                  recommendedHadiths.map((hadith, index) => (
                    <div
                      key={hadith.id}
                      onClick={() => handleSelectHadith(hadith)}
                      className={`${index >= 3 ? 'hidden md:block' : ''} bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-500 cursor-pointer transition-all duration-300 transform hover:-trangray-y-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500`}
                    >
                      <h3 className="font-bold text-emerald-700 dark:text-emerald-400">{hadith.book} No. {hadith.number}</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 italic">"{hadith.indonesian.substring(0, 120)}..."</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-16">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Jelajahi Lebih Lanjut</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard 
                        title="Jelajahi Sumber Hadits"
                        description="Lihat semua kitab hadits yang tersedia."
                        icon={<BookIcon />}
                        onClick={() => changeView('sources')}
                    />
                     <InfoCard 
                        title="Kenali Tokoh-Tokoh Hadits"
                        description="Biografi para imam dan perawi terkemuka."
                        icon={<UsersIcon />}
                        onClick={() => changeView('figures')}
                    />
                </div>
            </div>

            <FooterBanner onCTAClick={() => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                searchInput?.focus();
            }} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-300">
      <Header
          onHomeClick={handleHomeClick}
          onFavoritesClick={() => changeView('favorites')}
          onLoginClick={() => changeView('login')}
          onLogout={handleLogout}
          currentUser={currentUser}
          onDashboardClick={() => changeView('dashboard')}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-8 lg:px-16 py-8">
        {renderView()}
      </main>
      <Footer onAboutClick={() => changeView('about')} />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
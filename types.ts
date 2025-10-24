
export interface Hadith {
  id: string; // e.g., 'bukhari-1'
  book: string; // e.g., 'HR. Bukhari'
  bookId: string; // e.g., 'bukhari'
  number: number;
  arabic: string;
  indonesian: string;
}

export interface HadithBook {
  slug: string;
  name: string;
  narrator: string;
  totalHadiths: number;
  description: string;
}

export interface HadithFigure {
  slug: string;
  name: string;
  title: string;
  birth_death: string;
  bio: string;
  works: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  favorites: string[]; // array of hadith IDs
  favoritesList: Hadith[]; // array of full hadith objects
  role: 'admin' | 'user';
  createdAt: string; // ISO string date
}

import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';

interface RegisterViewProps {
  onRegister: (username: string, email: string, password: string) => Promise<{success: boolean, message: string}>;
  onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setError('');
    setIsLoading(true);
    const result = await onRegister(username, email, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-500">Buat Akun Baru</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Bergabunglah untuk menyimpan hadits favorit Anda.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="p-3 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300 text-sm">{error}</p>}
            <div>
              <label htmlFor="username"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Pengguna
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nama Anda"
                required
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Konfirmasi Password
              </label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {isLoading ? 'Mendaftarkan...' : 'Daftar'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

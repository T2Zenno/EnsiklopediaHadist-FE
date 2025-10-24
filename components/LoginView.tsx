import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSwitchToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(email, password);
    setIsLoading(false);
    if (!success) {
      setError('Email atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-500">Ensiklopedia Hadits AI</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="p-3 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300 text-sm">{error}</p>}
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
                autoComplete="current-password"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?{' '}
            <button onClick={onSwitchToRegister} className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
              Daftar di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

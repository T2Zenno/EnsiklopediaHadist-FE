import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './IconComponents';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ id, value, onChange, placeholder, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500 transition-colors"
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

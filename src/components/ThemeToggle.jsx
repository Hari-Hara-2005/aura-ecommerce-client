import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer border ${
        isDark
          ? 'bg-slate-900/80 border-slate-700/80 text-amber-300 hover:text-amber-200 hover:bg-slate-800 shadow-sm'
          : 'bg-white border-slate-200 text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 shadow-xs'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-300" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:-rotate-12 text-indigo-600" />
        )}
      </div>
    </button>
  );
}

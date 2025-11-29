import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun size={20} className="text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
};

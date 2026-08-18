import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSelector: React.FC<{ variant?: 'footer' | 'compact' | 'modal' | 'button' }> = ({ variant = 'footer' }) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        id="theme-toggle-compact"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-300/80 dark:border-stone-700 transition-colors cursor-pointer"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Light</span>
          </>
        )}
      </button>
    );
  }

  // Footer / standard single toggle button
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900/60 dark:bg-stone-900/90 border border-stone-800 text-[#FAF8F5]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </div>
        <div>
          <span className="text-xs font-bold text-white block">
            {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
          </span>
          <span className="text-[11px] text-stone-400 block">
            {isDark ? 'Switch to warm daylight canvas' : 'Switch to night mode'}
          </span>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        id="footer-single-theme-toggle"
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Enable Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span>Enable Dark Mode</span>
          </>
        )}
      </button>
    </div>
  );
};

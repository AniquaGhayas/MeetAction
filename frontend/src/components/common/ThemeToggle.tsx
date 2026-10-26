import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'icon' | 'segmented' | 'sidebar';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  className = '',
  showLabel = true,
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-surface-container-high border border-surface-container-highest/60 gap-1 ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
            !isDark
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">light_mode</span>
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
            isDark
              ? 'bg-surface-container-highest text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dark_mode</span>
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-space-md py-space-xs rounded-lg transition-colors cursor-pointer text-left font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="material-symbols-outlined text-[20px] text-primary">
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="truncate">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high font-label-sm text-label-sm font-medium text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </div>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to toggle.`}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer relative ${className}`}
      >
        <span
          className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
            isDark ? 'rotate-0 text-secondary' : 'rotate-180 text-primary'
          }`}
        >
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </button>
    );
  }

  // Default 'button' variant: Sleek pill toggle button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-surface-container-highest/60 hover:bg-surface-container-high text-on-surface transition-all cursor-pointer group shadow-sm ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 text-primary ${
            isDark ? 'rotate-0' : 'rotate-180'
          }`}
        >
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
      {showLabel && (
        <span className="font-label-md text-label-md font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

import React from 'react';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNotificationsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  onNotificationsClick,
}) => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 border-b border-surface-variant/40">
      <div className="h-16 w-full px-space-xl flex items-center justify-between gap-space-md">
        {/* Brand & Sync indicator */}
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/50 flex items-center justify-center shadow-xs">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
              Meet<span className="text-primary font-bold">Action</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-secondary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Sync active</span>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="flex-1 max-w-md mx-space-md hidden sm:block">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none select-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search agendas, decisions, transcripts..."
              className="w-full pl-9 pr-space-md py-1.5 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm rounded-lg outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/30 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all"
            />
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>

          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-xs"
            title="Alex Rivera"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';

export const BrandHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      {/* MeetAction Brand Glyph */}
      <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 flex items-center justify-center mb-3 shadow-sm group transition-transform hover:scale-105 duration-200">
        <svg
          className="w-7 h-7 text-primary"
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

      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
          Meet<span className="text-primary font-bold">Action</span>
        </span>
        <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-primary-fixed/60 text-on-primary-fixed-variant">
          Enterprise
        </span>
      </div>

      <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mb-1">
        Sign in to MeetAction
      </h1>

      <p className="font-body-sm text-body-sm text-secondary max-w-xs">
        Convert meeting transcripts into tracked Jira &amp; Trello tasks instantly.
      </p>
    </div>
  );
};

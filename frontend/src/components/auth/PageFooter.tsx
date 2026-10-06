import React from 'react';

export const PageFooter: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 mt-6 text-center">
      <div className="flex items-center gap-4 text-secondary font-label-sm text-[11px]">
        <a href="#privacy" className="hover:text-on-surface transition-colors">
          Privacy Policy
        </a>
        <span className="w-1 h-1 rounded-full bg-secondary/40" />
        <a href="#terms" className="hover:text-on-surface transition-colors">
          Terms of Service
        </a>
        <span className="w-1 h-1 rounded-full bg-secondary/40" />
        <a href="#status" className="hover:text-on-surface transition-colors flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Systems Operational
        </a>
      </div>
      <span className="text-secondary/60 font-label-sm text-[11px]">
        &copy; {new Date().getFullYear()} MeetAction Inc. All rights reserved.
      </span>
    </div>
  );
};

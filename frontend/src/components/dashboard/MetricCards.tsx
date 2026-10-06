import React from 'react';

export const MetricCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {/* Card 1: Total Meetings */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-variant/30">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-secondary-container/30 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
            Total Meetings
          </span>
          <div className="w-9 h-9 rounded-lg bg-secondary-container/60 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-display text-on-surface leading-none font-bold">148</span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">recorded</span>
        </div>
        <div className="mt-3 pt-3 flex items-center justify-between text-secondary border-t border-surface-variant/30">
          <span className="font-body-sm text-body-sm">All recorded sessions</span>
          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>+12% this mo
          </span>
        </div>
      </div>

      {/* Card 2: Action Items Extracted */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-variant/30">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-primary-fixed/20 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
            Action Items Extracted
          </span>
          <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-display text-on-surface leading-none font-bold">412</span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">insights</span>
        </div>
        <div className="mt-3 pt-3 flex items-center justify-between text-secondary border-t border-surface-variant/30">
          <span className="font-body-sm text-body-sm">Detected by AI engine</span>
          <div className="flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
            <span>2.78 avg / meet</span>
          </div>
        </div>
      </div>

      {/* Card 3: Tickets Created */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-variant/30">
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-secondary-container/40 pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
            Tickets Created
          </span>
          <div className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-display text-on-surface leading-none font-bold">389</span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">synced</span>
        </div>
        <div className="mt-3 pt-3 flex items-center justify-between border-t border-surface-variant/30">
          <span className="font-body-sm text-body-sm text-secondary">across Jira &amp; Trello</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 98% dispatch rate
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const DispatchWidgets: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
      {/* Auto-Dispatch Card */}
      <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-variant/30">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Auto-Dispatch Active
            </span>
            <span className="font-body-sm text-body-sm text-secondary">
              Identified tickets are assigned with priority tags based on speaker sentiment and deadlines.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
            Integrations
          </span>
          <div className="flex items-center -space-x-2">
            <span
              className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-label-sm text-label-sm font-bold shadow-sm"
              title="Jira Cloud"
            >
              J
            </span>
            <span
              className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed font-label-sm text-label-sm font-bold shadow-sm"
              title="Trello"
            >
              T
            </span>
            <span
              className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm text-label-sm font-bold shadow-sm"
              title="Notion"
            >
              N
            </span>
          </div>
        </div>
      </div>

      {/* Sync Engine Health */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex items-center justify-between border border-surface-variant/30">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
            Sync Engine Health
          </span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">
            100% Operational
          </span>
          <span className="font-body-sm text-body-sm text-secondary mt-0.5">
            Last sync 4 mins ago
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary shadow-xs">
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
        </div>
      </div>
    </div>
  );
};

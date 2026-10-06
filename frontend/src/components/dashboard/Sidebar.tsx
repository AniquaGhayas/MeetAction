import React from 'react';

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab = 'dashboard',
  onTabChange,
  onSignOut,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'capture-and-ingest', label: 'Capture & Ingest', icon: 'mic' },
    { id: 'transcript-review', label: 'Transcript Review', icon: 'description', badge: 3 },
    { id: 'integrations-and-settings', label: 'Integrations & Settings', icon: 'tune' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Workspace Switcher */}
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-lowest border-b border-surface-variant/40">
          <button
            type="button"
            className="w-full flex items-center justify-between px-space-sm py-space-xs rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-7 h-7 rounded bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm font-semibold shrink-0">
                A
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Acme Corp Eng
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                  Executive Workspace
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              unfold_more
            </span>
          </button>
        </div>

        {/* Navigation */}
        <div className="px-space-md py-space-sm">
          <nav className="flex flex-col gap-space-xs">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange?.(item.id)}
                  className={`w-full flex items-center justify-between px-space-md py-space-xs rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-primary text-on-primary font-medium shadow-sm'
                      : 'font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-space-xs py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                        isActive
                          ? 'bg-on-primary/20 text-on-primary'
                          : 'bg-secondary-container text-on-secondary-fixed'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info / Sign Out */}
      <div className="p-space-md bg-surface-container-low border-t border-surface-variant/40">
        <div className="flex items-center justify-between p-space-xs rounded-lg bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-label-md text-label-md text-on-secondary-fixed font-semibold shrink-0">
              AR
            </div>
            <div className="flex flex-col truncate">
              <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                Alex Rivera
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                alex@acme.corp
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container transition-colors cursor-pointer"
            title="Sign out of MeetAction"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

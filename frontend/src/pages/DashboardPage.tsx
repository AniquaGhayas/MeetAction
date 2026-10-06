import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { MetricCards } from '../components/dashboard/MetricCards';
import { MeetingsTable } from '../components/dashboard/MeetingsTable';
import { DispatchWidgets } from '../components/dashboard/DispatchWidgets';

interface DashboardPageProps {
  onSignOut?: () => void;
  onNewMeeting?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSignOut,
  onNewMeeting,
}) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleReviewMeeting = (meetingId: string) => {
    console.log('Navigating to review meeting:', meetingId);
  };

  const handleViewSummary = (meetingId: string) => {
    console.log('Viewing summary for meeting:', meetingId);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onSignOut={onSignOut}
      />

      <div className="pl-64">
        {/* Fixed Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNotificationsClick={() => console.log('Notifications opened')}
        />

        {/* Main Content Area */}
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="max-w-[1440px] w-full mx-auto px-margin py-space-xl flex flex-col gap-space-xl">
              {/* Top Bar: Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                    <span>Workspace Console</span>
                    <span>/</span>
                    <span className="text-primary font-semibold">Archives &amp; Intelligence</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                    Meeting Archives &amp; Activity
                  </h1>
                  <p className="font-body-md text-body-md text-secondary">
                    Automated transcript parsing, action items, and task sync history.
                  </p>
                </div>

                <div className="flex items-center gap-space-sm self-start sm:self-auto">
                  <button
                    type="button"
                    className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-variant/40"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      calendar_today
                    </span>
                    <span>Filter by Date</span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      expand_more
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onNewMeeting}
                    className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>New Meeting</span>
                  </button>
                </div>
              </div>

              {/* 3 KPI Overview Cards */}
              <MetricCards />

              {/* Recorded Meetings Table with Search & Status Filters */}
              <MeetingsTable
                onReviewMeeting={handleReviewMeeting}
                onViewSummary={handleViewSummary}
              />

              {/* Quick Dispatch Summary & Health Widgets */}
              <DispatchWidgets />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

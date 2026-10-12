import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { MetricCards } from '../components/dashboard/MetricCards';
import { MeetingsTable } from '../components/dashboard/MeetingsTable';
import { DispatchWidgets } from '../components/dashboard/DispatchWidgets';
import { CaptureIngestView } from '../components/dashboard/CaptureIngestView';
import { TranscriptReviewView } from '../components/dashboard/TranscriptReviewView';
import { IntegrationsSettingsView } from '../components/dashboard/IntegrationsSettingsView';

interface DashboardPageProps {
  onSignOut?: () => void;
  onNewMeeting?: () => void;
}

const meetingMetadata: Record<string, { title: string; date: string }> = {
  '1': { title: 'Sprint 42 Backlog Grooming', date: 'Oct 24, 2024 · 10:00 AM' },
  '2': { title: 'Q4 Product Roadmap Sync', date: 'Oct 24, 2024 · 02:00 PM' },
  '3': { title: 'Client Onboarding - FinTech Core', date: 'Oct 24, 2024 · 03:30 PM' },
  '4': { title: 'Architecture: Vector DB Migration', date: 'Oct 23, 2024 · 11:00 AM' },
  '5': { title: 'Weekly B2B Sales & GTM Pipeline', date: 'Oct 23, 2024 · 04:00 PM' },
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSignOut,
  onNewMeeting,
}) => {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['dashboard', 'capture-and-ingest', 'transcript-review', 'integrations-and-settings'].includes(hash)) {
      return hash;
    }
    return 'dashboard';
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<{
    id: string;
    title: string;
    date: string;
  } | null>(null);

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['dashboard', 'capture-and-ingest', 'transcript-review', 'integrations-and-settings'].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  const handleReviewMeeting = (meetingId: string) => {
    const meta = meetingMetadata[meetingId];
    setSelectedMeeting(
      meta
        ? { id: meetingId, ...meta }
        : { id: meetingId, title: `Meeting #${meetingId}`, date: 'Oct 24, 2024 · 10:00 AM' },
    );
    handleTabChange('transcript-review');
  };

  const handleViewSummary = (meetingId: string) => {
    handleReviewMeeting(meetingId);
  };

  const handleNewMeeting = () => {
    handleTabChange('capture-and-ingest');
    onNewMeeting?.();
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
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
          {currentTab === 'capture-and-ingest' ? (
            <CaptureIngestView
              onBackToDashboard={() => handleTabChange('dashboard')}
              onExtractionComplete={(data) => {
                console.log('Action extraction completed:', data);
                setSelectedMeeting({
                  id: 'extracted-session',
                  title: data.title,
                  date: `${new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })} · Extracted`,
                });
                handleTabChange('transcript-review');
              }}
            />
          ) : currentTab === 'transcript-review' ? (
            <TranscriptReviewView
              meetingTitle={selectedMeeting?.title}
              meetingDate={selectedMeeting?.date}
              onBackToDashboard={() => handleTabChange('dashboard')}
              onPushItems={(items) => {
                console.log('Action items pushed:', items);
              }}
            />
          ) : currentTab === 'integrations-and-settings' ? (
            <IntegrationsSettingsView
              onBackToDashboard={() => handleTabChange('dashboard')}
            />
          ) : (
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
                      onClick={handleNewMeeting}
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
                <DispatchWidgets
                  onOpenIntegrations={() => handleTabChange('integrations-and-settings')}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

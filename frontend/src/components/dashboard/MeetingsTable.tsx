import React, { useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  source: string;
  icon: string;
  date: string;
  duration: string;
  actionItemsCount: number;
  tickets?: string[];
  status: 'Synced' | 'Needs Review';
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Sprint 42 Backlog Grooming',
    source: 'Google Meet',
    icon: 'videocam',
    date: 'Oct 24, 2024',
    duration: '45 min',
    actionItemsCount: 7,
    tickets: ['JIRA-104', 'JIRA-105'],
    status: 'Synced',
  },
  {
    id: '2',
    title: 'Q4 Product Roadmap Sync',
    source: 'Zoom Video',
    icon: 'radio_button_checked',
    date: 'Oct 24, 2024',
    duration: '58 min',
    actionItemsCount: 4,
    status: 'Needs Review',
  },
  {
    id: '3',
    title: 'Client Onboarding - FinTech Core',
    source: 'Microsoft Teams',
    icon: 'groups',
    date: 'Oct 24, 2024',
    duration: '30 min',
    actionItemsCount: 3,
    status: 'Needs Review',
  },
  {
    id: '4',
    title: 'Architecture: Vector DB Migration',
    source: 'Zoom Video',
    icon: 'terminal',
    date: 'Oct 23, 2024',
    duration: '62 min',
    actionItemsCount: 9,
    tickets: ['JIRA-98', 'Trello #42'],
    status: 'Synced',
  },
  {
    id: '5',
    title: 'Weekly B2B Sales & GTM Pipeline',
    source: 'Google Meet',
    icon: 'query_stats',
    date: 'Oct 23, 2024',
    duration: '40 min',
    actionItemsCount: 5,
    tickets: ['Trello #39'],
    status: 'Synced',
  },
];

interface MeetingsTableProps {
  onReviewMeeting?: (meetingId: string) => void;
  onViewSummary?: (meetingId: string) => void;
}

export const MeetingsTable: React.FC<MeetingsTableProps> = ({
  onReviewMeeting,
  onViewSummary,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Synced' | 'Needs Review'>('All');
  const [tableSearch, setTableSearch] = useState('');

  const filteredMeetings = mockMeetings.filter((meeting) => {
    const matchesFilter = filterStatus === 'All' || meeting.status === filterStatus;
    const matchesSearch =
      meeting.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
      meeting.source.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-space-md">
      {/* Search, Filter & View Controls */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border border-surface-variant/30">
        {/* Left: Search & Date Range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1 max-w-3xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search meetings, speakers, or transcripts..."
              className="w-full pl-9 pr-space-md py-2 bg-surface-container-low text-on-surface placeholder:text-secondary font-body-sm text-body-sm rounded-lg outline-none focus:bg-surface-container-lowest shadow-sm transition-all"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-between gap-2 px-space-md py-2 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">date_range</span>
            <span>All Dates</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">arrow_drop_down</span>
          </button>
        </div>

        {/* Right: Status Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('All')}
            className={`px-space-md py-1.5 rounded-md font-label-md text-label-md font-semibold transition-all cursor-pointer ${
              filterStatus === 'All'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Synced')}
            className={`px-space-md py-1.5 rounded-md font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'Synced'
                ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Synced</span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim" />
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Needs Review')}
            className={`px-space-md py-1.5 rounded-md font-label-md text-label-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'Needs Review'
                ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span>Needs Review</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Recent Meetings Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-variant/30">
        {/* Table Header Bar */}
        <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-variant/40">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Recorded Meetings
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm font-semibold">
              {filteredMeetings.length} of 148
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
              title="Export CSV"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
              title="Reload Table"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60 text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-lg">Meeting Title &amp; Source</th>
                <th className="py-3 px-space-md">Date &amp; Duration</th>
                <th className="py-3 px-space-md text-center">Action Items</th>
                <th className="py-3 px-space-md">Synced Tickets</th>
                <th className="py-3 px-space-md">Status</th>
                <th className="py-3 px-space-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y divide-surface-variant/20">
              {filteredMeetings.map((meeting) => {
                const isNeedsReview = meeting.status === 'Needs Review';
                return (
                  <tr
                    key={meeting.id}
                    className={`transition-colors group ${
                      isNeedsReview
                        ? 'bg-primary-fixed/5 hover:bg-primary-fixed/10'
                        : 'hover:bg-surface-container-low/40'
                    }`}
                  >
                    {/* Title & Platform */}
                    <td className="py-space-md px-space-lg">
                      <div className="flex items-center gap-space-sm min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isNeedsReview
                              ? 'bg-primary-fixed text-primary'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {meeting.icon}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                            {meeting.title}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isNeedsReview ? 'bg-primary' : 'bg-secondary'
                              }`}
                            />{' '}
                            {meeting.source}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date & Duration */}
                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">
                          {meeting.date}
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary">
                          {meeting.duration}
                        </span>
                      </div>
                    </td>

                    {/* Action Items Count */}
                    <td className="py-space-md px-space-md text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-label-sm text-label-sm ${
                          isNeedsReview
                            ? 'bg-primary-fixed text-primary font-bold'
                            : 'bg-surface-container-high text-on-surface font-semibold'
                        }`}
                      >
                        {meeting.actionItemsCount}
                      </span>
                    </td>

                    {/* Synced Tickets */}
                    <td className="py-space-md px-space-md">
                      {meeting.tickets && meeting.tickets.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {meeting.tickets.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-variant transition-colors cursor-pointer"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-label-sm text-label-sm text-on-surface-variant italic">
                          Pending approval
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-space-md px-space-md">
                      {isNeedsReview ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{' '}
                          Needs Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-secondary font-label-sm text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container" /> Synced
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-space-md px-space-lg text-right">
                      {isNeedsReview ? (
                        <button
                          type="button"
                          onClick={() => onReviewMeeting?.(meeting.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
                        >
                          <span>Review Items</span>
                          <span className="material-symbols-outlined text-[16px]">
                            arrow_forward
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onViewSummary?.(meeting.id)}
                          className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary transition-colors font-medium px-2 py-1 rounded hover:bg-surface-container cursor-pointer"
                        >
                          <span>View Summary</span>
                          <span className="material-symbols-outlined text-[16px]">
                            chevron_right
                          </span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-space-lg py-space-md bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm border-t border-surface-variant/30">
          <div className="font-body-sm text-body-sm text-secondary">
            Showing <span className="font-semibold text-on-surface">1</span> to{' '}
            <span className="font-semibold text-on-surface">{filteredMeetings.length}</span> of{' '}
            <span className="font-semibold text-on-surface">148</span> meetings
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg text-secondary hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg text-secondary hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              3
            </button>
            <span className="w-6 text-center text-secondary font-label-md text-label-md">...</span>
            <button
              type="button"
              className="w-8 h-8 rounded-lg text-secondary hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              30
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

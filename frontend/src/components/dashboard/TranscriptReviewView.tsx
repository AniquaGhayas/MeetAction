import React, { useState, useMemo } from 'react';

interface ActionItem {
  id: number;
  timestamp: string;
  title: string;
  context?: string;
  assignee: { initials: string; name: string; colorClass: string };
  dueDate: string;
  destination: { icon: string; label: string; colorClass: string };
  confidence: number;
  included: boolean;
  excluded: boolean;
}

interface TranscriptTurn {
  id: number;
  speaker: { initials: string; name: string; colorClass: string };
  timestamp: string;
  text: string;
  actionItem?: {
    number: number;
    confidence: number;
    quote: string;
  };
}

interface IntermediaryDialogue {
  afterTurnId: number;
  timestamp: string;
  speaker: string;
  text: string;
}

interface TranscriptReviewViewProps {
  onBackToDashboard?: () => void;
  onPushItems?: (items: ActionItem[]) => void;
  meetingTitle?: string;
  meetingDate?: string;
}

// ----- Sample Data -----
const sampleTranscriptTurns: TranscriptTurn[] = [
  {
    id: 1,
    speaker: { initials: 'AM', name: 'Alex Mercer', colorClass: 'bg-secondary text-on-secondary' },
    timestamp: '04:12',
    text: "Looking at our p99 latency spikes during yesterday's stress test, our session store started thrashing memory limits.",
    actionItem: {
      number: 1,
      confidence: 98,
      quote: '\u201CWe definitely need to fix the Redis cache eviction policy before Thursday\u2019s load test.\u201D',
    },
  },
  {
    id: 2,
    speaker: { initials: 'ER', name: 'Elena Rostova', colorClass: 'bg-surface-container-highest text-on-surface' },
    timestamp: '05:45',
    text: 'That should resolve the timeout issues in the user profile gateway.',
    actionItem: {
      number: 2,
      confidence: 94,
      quote: '\u201CAlso Sarah, make sure to update the API docs by Friday 5 PM so the mobile team isn\u2019t blocked.\u201D',
    },
  },
  {
    id: 3,
    speaker: { initials: 'MV', name: 'Marcus Vance', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
    timestamp: '08:20',
    text: '',
    actionItem: {
      number: 3,
      confidence: 99,
      quote: '\u201CI will spin up the staging Kafka cluster tomorrow morning.\u201D',
    },
  },
];

const sampleIntermediaryDialogue: IntermediaryDialogue[] = [
  {
    afterTurnId: 1,
    timestamp: '05:01',
    speaker: 'Sarah Chen',
    text: 'Agreed, I can coordinate with the platform infrastructure team.',
  },
];

const initialActionItems: ActionItem[] = [
  {
    id: 1,
    timestamp: '04:12',
    title: 'Fix Redis cache eviction policy before load testing',
    context:
      "Session store experiencing memory spikes during yesterday's stress testing. Must resolve eviction settings ahead of Thursday.",
    assignee: { initials: 'AM', name: 'Alex Mercer', colorClass: 'bg-secondary text-on-secondary' },
    dueDate: 'Oct 24, 2024',
    destination: { icon: 'bug_report', label: 'Jira: Backend / Bug', colorClass: 'bg-secondary-container text-on-secondary-fixed' },
    confidence: 98,
    included: true,
    excluded: false,
  },
  {
    id: 2,
    timestamp: '05:45',
    title: 'Update REST API documentation for mobile client payload',
    context: undefined,
    assignee: { initials: 'SC', name: 'Sarah Chen', colorClass: 'bg-primary-container text-on-primary' },
    dueDate: 'Oct 25, 2024 \u00B7 5 PM',
    destination: { icon: 'dashboard', label: 'Trello: Mobile / To Do', colorClass: 'bg-surface-container-high text-on-surface' },
    confidence: 94,
    included: true,
    excluded: false,
  },
  {
    id: 3,
    timestamp: '08:20',
    title: 'Spin up staging Kafka cluster and notify backend channel',
    context: undefined,
    assignee: { initials: 'MV', name: 'Marcus Vance', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
    dueDate: 'Tomorrow 10 AM',
    destination: { icon: 'task', label: 'Jira / Task', colorClass: 'bg-secondary-container text-on-secondary-fixed' },
    confidence: 99,
    included: true,
    excluded: false,
  },
];

// ----- Waveform Bars Data -----
const waveformBars = [
  { h: 'h-2', opacity: 'bg-secondary/30' },
  { h: 'h-3', opacity: 'bg-secondary/30' },
  { h: 'h-4', opacity: 'bg-secondary/30' },
  { h: 'h-2', opacity: 'bg-secondary/40' },
  { h: 'h-5', opacity: 'bg-secondary/30' },
  { h: 'h-6', opacity: 'bg-primary', ring: true },
  { h: 'h-3', opacity: 'bg-secondary/40' },
  { h: 'h-4', opacity: 'bg-secondary/30' },
  { h: 'h-2', opacity: 'bg-secondary/30' },
  { h: 'h-3', opacity: 'bg-secondary/40' },
  { h: 'h-5', opacity: 'bg-primary' },
  { h: 'h-2', opacity: 'bg-secondary/30' },
  { h: 'h-4', opacity: 'bg-secondary/30' },
  { h: 'h-3', opacity: 'bg-secondary/40' },
  { h: 'h-6', opacity: 'bg-primary' },
  { h: 'h-2', opacity: 'bg-secondary/30' },
  { h: 'h-4', opacity: 'bg-secondary/30' },
  { h: 'h-3', opacity: 'bg-secondary/30' },
  { h: 'h-1', opacity: 'bg-secondary/20' },
  { h: 'h-3', opacity: 'bg-secondary/30' },
  { h: 'h-2', opacity: 'bg-secondary/30' },
  { h: 'h-4', opacity: 'bg-secondary/30' },
  { h: 'h-2', opacity: 'bg-secondary/20' },
  { h: 'h-1', opacity: 'bg-secondary/20' },
];

// ----- Component -----
export const TranscriptReviewView: React.FC<TranscriptReviewViewProps> = ({
  onBackToDashboard,
  onPushItems,
  meetingTitle,
  meetingDate,
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'done'>('idle');

  const approvedCount = useMemo(
    () => actionItems.filter((item) => item.included && !item.excluded).length,
    [actionItems],
  );

  const totalCount = actionItems.length;

  const filteredTurns = useMemo(() => {
    if (!searchQuery.trim()) return sampleTranscriptTurns;
    const q = searchQuery.toLowerCase();
    return sampleTranscriptTurns.filter(
      (turn) =>
        turn.speaker.name.toLowerCase().includes(q) ||
        turn.text.toLowerCase().includes(q) ||
        (turn.actionItem?.quote.toLowerCase().includes(q) ?? false),
    );
  }, [searchQuery]);

  const handleToggleItem = (itemId: number) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, included: !item.included } : item,
      ),
    );
  };

  const handleExcludeItem = (itemId: number) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, excluded: true, included: false } : item,
      ),
    );
  };

  const handleSelectAll = () => {
    setActionItems((prev) =>
      prev.map((item) => ({ ...item, included: true, excluded: false })),
    );
  };

  const handleTitleChange = (itemId: number, newTitle: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, title: newTitle } : item,
      ),
    );
  };

  const handleReset = () => {
    setActionItems(initialActionItems);
    setPushStatus('idle');
  };

  const handlePush = () => {
    const approved = actionItems.filter((i) => i.included && !i.excluded);
    if (approved.length === 0) return;
    setPushStatus('pushing');
    setTimeout(() => {
      setPushStatus('done');
      onPushItems?.(approved);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1520px] mx-auto px-gutter sm:px-margin py-space-lg flex flex-col gap-space-lg">
        {/* Top Metadata & Action Banner */}
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs min-w-0">
            <div className="flex items-center gap-space-sm flex-wrap">
              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors cursor-pointer mr-space-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back</span>
                </button>
              )}
              <span className="px-space-sm py-0.5 rounded-full bg-secondary-container font-label-sm text-label-sm text-on-secondary-fixed uppercase tracking-wider">
                Sprint Review
              </span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                Synced with Zoom Audio Cloud
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">
              {meetingTitle || 'Sprint 42 Planning & Architecture Alignment'}
            </h1>
            <div className="flex items-center gap-space-md flex-wrap font-body-sm text-body-sm text-on-surface-variant mt-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                {meetingDate || 'Oct 24, 2024 · 10:00 AM'}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                42m 18s
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                {totalCount} Action Items Found
              </span>
              <span className="inline-flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]">group</span>
                6 Participants
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 w-full lg:w-auto justify-end">
            <button
              className="px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-on-surface transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              Export Summary
            </button>
            <button
              className={`px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer ${
                approvedCount === 0 ? 'opacity-50 pointer-events-none' : ''
              }`}
              type="button"
              onClick={handlePush}
            >
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              Push Approved Items ({approvedCount})
            </button>
          </div>
        </div>

        {/* 2-Column Split Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-24">
          {/* Left Column: Transcript Review */}
          <section className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-space-sm pb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Transcript</h2>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {totalCount} detected action moments highlighted
                    </p>
                  </div>
                </div>
                <span className="px-space-sm py-1 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface font-medium">
                  99.4% Transcription Accuracy
                </span>
              </div>

              {/* Transcript Search & Audio Scrub Pill */}
              <div className="flex items-center gap-space-sm">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    className="w-full pl-9 pr-space-md py-2 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm rounded-lg outline-none focus:bg-surface-container-lowest shadow-sm transition-all"
                    placeholder="Filter transcript text or speaker..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="h-9 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Speakers
                </button>
              </div>

              {/* Audio Waveform Visualization Bar */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                    04:12 / 42:18
                  </span>
                  <span className="text-secondary font-mono text-[11px]">
                    Markers: 04:12 • 05:45 • 08:20
                  </span>
                </div>
                <div className="h-6 w-full flex items-end gap-0.5 pt-1 overflow-hidden">
                  {waveformBars.map((bar, i) => (
                    <span
                      key={i}
                      className={`w-1 ${bar.opacity} ${bar.h} rounded-full ${bar.ring ? 'ring-2 ring-primary-fixed' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* Transcript Scroll Track */}
              <div className="flex flex-col gap-space-md pt-space-xs">
                {filteredTurns.map((turn) => (
                  <React.Fragment key={turn.id}>
                    {/* Transcript Turn */}
                    <div className="transcript-turn group p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col gap-space-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                          <div
                            className={`w-7 h-7 rounded-full ${turn.speaker.colorClass} font-label-sm text-label-sm flex items-center justify-center font-bold`}
                          >
                            {turn.speaker.initials}
                          </div>
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {turn.speaker.name}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                            {turn.timestamp}
                          </span>
                        </div>
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title={`Play audio from ${turn.timestamp}`}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        </button>
                      </div>
                      {turn.text && (
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                          {turn.text}
                        </p>
                      )}
                      {/* Detected Action Highlight Box */}
                      {turn.actionItem && (
                        <div className="mt-space-xs p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
                              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                              Action item #{turn.actionItem.number} detected
                            </span>
                            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container px-space-xs rounded font-mono">
                              Confidence: {turn.actionItem.confidence}%
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface font-medium italic">
                            {turn.actionItem.quote}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Intermediary Dialogue */}
                    {sampleIntermediaryDialogue
                      .filter((d) => d.afterTurnId === turn.id)
                      .map((dialogue, dIdx) => (
                        <div
                          key={`dialogue-${turn.id}-${dIdx}`}
                          className="px-space-md py-space-xs flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant"
                        >
                          <span className="font-label-sm text-label-sm font-semibold text-secondary font-mono">
                            {dialogue.timestamp}
                          </span>
                          <span>
                            <strong>{dialogue.speaker}:</strong> {dialogue.text}
                          </span>
                        </div>
                      ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Action Items Review */}
          <section className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-sm px-1">
              <div>
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Action Items Review
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">
                    {totalCount} Detected
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Review, enrich metadata, and route to target issue trackers.
                </p>
              </div>
              <div className="flex items-center gap-space-xs">
                <button
                  className="text-primary hover:text-primary-container font-label-sm text-label-sm font-semibold px-2 py-1 rounded cursor-pointer"
                  type="button"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Action Item Cards */}
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={`action-card bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md ${
                  item.excluded ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-space-sm pb-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={item.included && !item.excluded}
                        onChange={() => handleToggleItem(item.id)}
                      />
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center shadow-sm transition-colors ${
                          item.included && !item.excluded
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-high text-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </span>
                      <span className="ml-2 font-label-md text-label-md font-semibold text-on-surface">
                        Include in push
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                      Item #{item.id} • {item.timestamp}
                    </span>
                    <button
                      className="w-7 h-7 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit prompt parsing"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      className="w-7 h-7 rounded hover:bg-error-container text-on-surface-variant hover:text-on-error-container flex items-center justify-center transition-colors cursor-pointer"
                      title="Exclude item"
                      type="button"
                      onClick={() => handleExcludeItem(item.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                {/* Task Title Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
                    Task Title
                  </label>
                  <input
                    className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface font-medium outline-none focus:bg-surface-container-lowest shadow-sm transition-all"
                    type="text"
                    value={item.title}
                    onChange={(e) => handleTitleChange(item.id, e.target.value)}
                  />
                </div>

                {/* Task Details & Context */}
                {item.context && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
                      Extracted Context &amp; Details
                    </label>
                    <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-sm rounded-lg">
                      {item.context}
                    </p>
                  </div>
                )}

                {/* Metadata Grid: Assignee, Due, Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Assignee
                    </label>
                    <div className="flex items-center gap-2 px-space-sm py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                      <div
                        className={`w-5 h-5 rounded-full ${item.assignee.colorClass} font-label-sm text-label-sm flex items-center justify-center font-bold text-[10px]`}
                      >
                        {item.assignee.initials}
                      </div>
                      <span className="truncate">{item.assignee.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Due Date
                    </label>
                    <div className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                      <span>{item.dueDate}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Destination
                    </label>
                    <div
                      className={`flex items-center justify-between px-space-sm py-1.5 rounded-lg ${item.destination.colorClass} font-label-sm text-label-sm font-semibold`}
                    >
                      <span className="inline-flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[15px]">
                          {item.destination.icon}
                        </span>
                        {item.destination.label}
                      </span>
                      <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Manual Action Item Button */}
            <button
              className="w-full py-3 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Add Manual Action Item
            </button>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Floating Approval Bar */}
      <div className="fixed bottom-4 left-64 right-0 z-40 px-margin flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-surface-container-lowest/95 backdrop-blur-xl px-space-xl py-space-md rounded-2xl shadow-xl flex items-center gap-space-xl max-w-2xl w-full justify-between">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">checklist</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {pushStatus === 'done'
                  ? `${approvedCount} items synced to Jira & Trello`
                  : `${approvedCount} of ${totalCount} items approved`}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Target integrations: Jira Cloud (2), Trello Workspace (1)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              className="px-space-md py-2 rounded-lg hover:bg-surface-container-low font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className={`px-space-xl py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer ${
                approvedCount === 0 ? 'opacity-50 pointer-events-none' : ''
              }`}
              type="button"
              onClick={handlePush}
            >
              {pushStatus === 'pushing' ? (
                <span>Exporting {approvedCount} Tasks...</span>
              ) : pushStatus === 'done' ? (
                <>
                  <span>Successfully Pushed!</span>
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                </>
              ) : (
                <>
                  <span>Push to Jira &amp; Trello</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

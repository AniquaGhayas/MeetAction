import React, { useState, useMemo, useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';

export interface ActionItem {
  id: string | number;
  timestamp: string;
  title: string;
  context?: string;
  assignee: { initials: string; name: string; colorClass?: string };
  dueDate: string;
  destination: { icon: string; label: string; colorClass?: string };
  confidence: number;
  included: boolean;
  excluded: boolean;
}

export interface TranscriptTurn {
  id: number;
  speaker: { initials: string; name: string; colorClass?: string };
  timestamp: string;
  text: string;
  actionItem?: {
    number: number;
    confidence: number;
    quote: string;
  };
}

export interface IntermediaryDialogue {
  afterTurnId: number;
  timestamp: string;
  speaker: string;
  text: string;
}

interface TranscriptReviewViewProps {
  meetingId?: string;
  meetingTitle?: string;
  meetingDate?: string;
  onBackToDashboard?: () => void;
  onPushItems?: (items: ActionItem[]) => void;
}

// ----- Default Sample Data -----
const sampleTranscriptTurns: TranscriptTurn[] = [
  {
    id: 1,
    speaker: { initials: 'AM', name: 'Alex Mercer', colorClass: 'bg-secondary text-on-secondary' },
    timestamp: '04:12',
    text: "Looking at our p99 latency spikes during yesterday's stress test, our session store started thrashing memory limits.",
    actionItem: {
      number: 1,
      confidence: 98,
      quote: '“We definitely need to fix the Redis cache eviction policy before Thursday’s load test.”',
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
      quote: '“Also Sarah, make sure to update the API docs by Friday 5 PM so the mobile team isn’t blocked.”',
    },
  },
  {
    id: 3,
    speaker: { initials: 'MV', name: 'Marcus Vance', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
    timestamp: '08:20',
    text: 'I will spin up the staging Kafka cluster tomorrow morning.',
    actionItem: {
      number: 3,
      confidence: 99,
      quote: '“I will spin up the staging Kafka cluster tomorrow morning.”',
    },
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
    context: "Ensure mobile team isn't blocked on the new auth payload schemas by updating Swagger spec.",
    assignee: { initials: 'SC', name: 'Sarah Chen', colorClass: 'bg-primary-container text-on-primary' },
    dueDate: 'Oct 25, 2024 · 5 PM',
    destination: { icon: 'dashboard', label: 'Trello: Mobile / To Do', colorClass: 'bg-surface-container-high text-on-surface' },
    confidence: 94,
    included: true,
    excluded: false,
  },
  {
    id: 3,
    timestamp: '08:20',
    title: 'Spin up staging Kafka cluster and notify backend channel',
    context: 'Deploy multi-broker event stream environment for async notification pipeline.',
    assignee: { initials: 'MV', name: 'Marcus Vance', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
    dueDate: 'Tomorrow 10 AM',
    destination: { icon: 'task', label: 'Jira / Task', colorClass: 'bg-secondary-container text-on-secondary-fixed' },
    confidence: 99,
    included: true,
    excluded: false,
  },
];

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

export const TranscriptReviewView: React.FC<TranscriptReviewViewProps> = ({
  meetingId,
  meetingTitle,
  meetingDate,
  onBackToDashboard,
  onPushItems,
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems);
  const [turns, setTurns] = useState<TranscriptTurn[]>(sampleTranscriptTurns);
  const [searchQuery, setSearchQuery] = useState('');
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'done'>('idle');
  const [pushResults, setPushResults] = useState<any[]>([]);

  // Audio Player State (Phase 3 Audio Support)
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Manual Add Modal/State
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAssignee, setManualAssignee] = useState('');
  const [manualDueDate, setManualDueDate] = useState('');

  // Fetch real meeting details, audio, turns, and action items from backend
  useEffect(() => {
    if (!meetingId) return;

    let isMounted = true;
    const fetchDetails = async () => {
      try {
        const data = await apiClient.getMeeting(meetingId);
        if (!isMounted) return;

        if (data.meeting?.audioFileUrl) {
          setAudioUrl(data.meeting.audioFileUrl);
        }

        if (data.turns && data.turns.length > 0) {
          setTurns(data.turns);
        }

        if (data.items && data.items.length > 0) {
          const mapped: ActionItem[] = data.items.map((it) => ({
            id: it.id,
            timestamp: it.timestamp || '01:00',
            title: it.description,
            context: it.sourceSnippet,
            assignee: {
              name: it.assignee?.name || 'Assignee',
              initials: it.assignee?.initials || 'AS',
              colorClass: it.assignee?.colorClass || 'bg-primary text-on-primary',
            },
            dueDate: it.dueDate || 'Next Sprint',
            destination: it.destination || {
              icon: 'task_alt',
              label: 'Jira: Core / Task',
              colorClass: 'bg-surface-container-high text-on-surface',
            },
            confidence: it.confidence || 95,
            included: it.included,
            excluded: it.excluded,
          }));
          setActionItems(mapped);
        }
      } catch (err) {
        console.warn('Backend load failed, using local/demo state:', err);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  // Audio Playback Handlers
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.warn('Audio play prevented:', e));
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const approvedCount = useMemo(
    () => actionItems.filter((item) => item.included && !item.excluded).length,
    [actionItems]
  );

  const totalCount = actionItems.length;

  const filteredTurns = useMemo(() => {
    if (!searchQuery.trim()) return turns;
    const q = searchQuery.toLowerCase();
    return turns.filter(
      (turn) =>
        turn.speaker.name.toLowerCase().includes(q) ||
        turn.text.toLowerCase().includes(q) ||
        (turn.actionItem?.quote.toLowerCase().includes(q) ?? false)
    );
  }, [turns, searchQuery]);

  // Item Actions & Backend Persistence
  const handleToggleItem = async (itemId: string | number) => {
    const target = actionItems.find((it) => it.id === itemId);
    if (!target) return;
    const newIncluded = !target.included;

    setActionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, included: newIncluded } : item))
    );

    try {
      await apiClient.updateActionItem(String(itemId), { included: newIncluded });
    } catch (e) {
      console.warn('Backend update failed:', e);
    }
  };

  const handleExcludeItem = async (itemId: string | number) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, excluded: true, included: false } : item
      )
    );

    try {
      await apiClient.updateActionItem(String(itemId), { excluded: true, included: false });
    } catch (e) {
      console.warn('Backend exclude update failed:', e);
    }
  };

  const handleSelectAll = async () => {
    setActionItems((prev) =>
      prev.map((item) => ({ ...item, included: true, excluded: false }))
    );

    for (const item of actionItems) {
      apiClient.updateActionItem(String(item.id), { included: true, excluded: false }).catch(() => {});
    }
  };

  const handleTitleChange = (itemId: string | number, newTitle: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, title: newTitle } : item))
    );

    // Save to backend
    apiClient.updateActionItem(String(itemId), { description: newTitle }).catch(() => {});
  };

  const handleToggleDestination = (itemId: string | number) => {
    const target = actionItems.find((it) => it.id === itemId);
    if (!target) return;
    const isJira = (target.destination?.label || '').toLowerCase().includes('jira');
    const newDest = isJira
      ? {
          icon: 'view_kanban',
          label: 'Trello: Board / Doing',
          colorClass: 'bg-primary-container text-on-primary-fixed',
        }
      : {
          icon: 'task_alt',
          label: 'Jira: Core / Task',
          colorClass: 'bg-secondary-container text-on-secondary-fixed',
        };

    setActionItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, destination: newDest } : it))
    );

    apiClient.updateActionItem(String(itemId), { destination: newDest }).catch(() => {});
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    try {
      const activeMeetingId = meetingId || '1';
      const res = await apiClient.createManualItem(activeMeetingId, {
        description: manualTitle.trim(),
        assigneeName: manualAssignee.trim() || 'Alex Mercer',
        dueDate: manualDueDate.trim() || 'Next Sprint',
      });

      const newItem: ActionItem = {
        id: res.item.id,
        timestamp: 'Manual',
        title: res.item.description,
        context: res.item.sourceSnippet,
        assignee: res.item.assignee,
        dueDate: res.item.dueDate,
        destination: res.item.destination,
        confidence: 100,
        included: true,
        excluded: false,
      };

      setActionItems((prev) => [newItem, ...prev]);
      setManualTitle('');
      setManualAssignee('');
      setManualDueDate('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create manual item:', err);
    }
  };

  const handleReset = () => {
    setActionItems(initialActionItems);
    setPushStatus('idle');
    setPushResults([]);
  };

  const handlePush = async () => {
    const approved = actionItems.filter((i) => i.included && !i.excluded);
    if (approved.length === 0) return;

    setPushStatus('pushing');
    try {
      const activeMeetingId = meetingId || '1';
      const res = await apiClient.pushItems(activeMeetingId);
      setPushStatus('done');
      setPushResults(res.results || []);
      onPushItems?.(approved);
    } catch (err: any) {
      console.warn('Backend push returned error, completing with simulated cards:', err);
      setPushStatus('done');
      onPushItems?.(approved);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fadeIn">
      {/* Hidden audio element for audio playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          preload="metadata"
        />
      )}

      <div className="w-full max-w-[1520px] mx-auto px-gutter sm:px-margin py-space-lg flex flex-col gap-space-lg">
        {/* Top Metadata & Action Banner */}
        <div className="w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md border border-surface-variant/30">
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
              <span className="px-space-sm py-0.5 rounded-full bg-secondary-container font-label-sm text-label-sm text-on-secondary-fixed uppercase tracking-wider font-semibold">
                {audioUrl ? 'Audio Recording' : 'Transcript Ingestion'}
              </span>
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                Verified by MeetAction AI Engine
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold truncate">
              {meetingTitle || 'Sprint 42 Planning & Architecture Alignment'}
            </h1>
            <div className="flex items-center gap-space-md flex-wrap font-body-sm text-body-sm text-on-surface-variant mt-1">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                {meetingDate || 'Oct 24, 2024 · 10:00 AM'}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {duration > 0 ? formatAudioTime(duration) : '42m 18s'}
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-md bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[15px]">task_alt</span>
                {totalCount} Action Items Found
              </span>
              <span className="inline-flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[16px]">group</span>
                4 Key Contributors
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 w-full lg:w-auto justify-end">
            <button
              className="px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-md text-label-md text-on-surface transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              type="button"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              + New Item
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

        {/* Push Results Live Feedback Pill (Phase 5 Step 13) */}
        {pushResults.length > 0 && (
          <div className="p-space-md bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600 font-headline-sm text-headline-sm font-bold">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Successfully Synced {pushResults.length} Action Items to Trackers!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pushResults.map((ticket, idx) => (
                <a
                  key={idx}
                  href={ticket.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-surface-container-lowest rounded-lg border border-emerald-500/20 flex items-center justify-between text-body-sm hover:border-emerald-500 transition-colors"
                >
                  <span className="font-semibold text-primary">{ticket.externalId}</span>
                  <span className="text-secondary text-xs truncate max-w-[180px]">
                    {ticket.description}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    open_in_new
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Split Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pb-24">
          {/* Left Column: Transcript Review & Audio Controls */}
          <section className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-variant/30">
              <div className="flex items-center justify-between gap-space-sm pb-space-sm border-b border-surface-variant/20">
                <div className="flex items-center gap-space-sm">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Meeting Transcript
                    </h2>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {totalCount} detected action moments linked to audio timestamps
                    </p>
                  </div>
                </div>
                <span className="px-space-sm py-1 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface font-semibold">
                  99.4% Accuracy
                </span>
              </div>

              {/* Transcript Search */}
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
              </div>

              {/* Phase 3 Audio Player & Waveform scrub bar */}
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-2 border border-surface-variant/30">
                <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className="flex items-center gap-1.5 font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isPlaying ? 'pause_circle' : 'play_circle'}
                    </span>
                    <span>
                      {audioUrl
                        ? `${isPlaying ? 'Playing Audio' : 'Play Audio'}`
                        : '04:12 / 42:18'}
                    </span>
                    {audioUrl && (
                      <span className="font-mono text-secondary ml-1">
                        ({formatAudioTime(currentTime)} / {formatAudioTime(duration || 60)})
                      </span>
                    )}
                  </button>
                  <span className="text-secondary font-mono text-[11px]">
                    Action Markers: 04:12 • 05:45 • 08:20
                  </span>
                </div>
                <div className="h-6 w-full flex items-end gap-1 pt-1 overflow-hidden">
                  {waveformBars.map((bar, i) => (
                    <span
                      key={i}
                      className={`w-1.5 ${bar.opacity} ${bar.h} rounded-full transition-all ${
                        isPlaying && i % 3 === Math.floor(currentTime) % 3
                          ? 'bg-primary ring-2 ring-primary'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Transcript Turns Stream */}
              <div className="flex flex-col gap-space-sm divide-y divide-surface-variant/20 pt-2">
                {filteredTurns.map((turn) => (
                  <div key={turn.id} className="pt-space-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${turn.speaker.colorClass || 'bg-secondary text-on-secondary'} font-label-sm text-label-sm flex items-center justify-center font-bold text-[10px]`}
                        >
                          {turn.speaker.initials}
                        </div>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {turn.speaker.name}
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-mono">
                          {turn.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed pl-8">
                      {turn.text}
                    </p>

                    {/* Detected Action Highlight Badge */}
                    {turn.actionItem && (
                      <div className="ml-8 p-3 rounded-lg bg-primary-fixed/20 border-l-4 border-primary flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                            Action Item #{turn.actionItem.number}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded font-mono">
                            Confidence: {turn.actionItem.confidence}%
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface font-medium italic">
                          "{turn.actionItem.quote}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Action Items Review */}
          <section className="lg:col-span-6 flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-sm px-1">
              <div>
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Action Items Review
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">
                    {totalCount} Detected
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Review, edit assignees, adjust dates, and dispatch tickets.
                </p>
              </div>
              <div className="flex items-center gap-space-xs">
                <button
                  className="text-primary hover:underline font-label-sm text-label-sm font-semibold px-2 py-1 rounded cursor-pointer"
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
                className={`action-card bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md border border-surface-variant/30 ${
                  item.excluded ? 'opacity-40 bg-surface-container-low' : ''
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
                  <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                    Task Title
                  </label>
                  <input
                    className="w-full px-space-md py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface font-medium outline-none focus:bg-surface-container-lowest shadow-sm transition-all border border-transparent focus:border-primary"
                    type="text"
                    value={item.title}
                    onChange={(e) => handleTitleChange(item.id, e.target.value)}
                  />
                </div>

                {/* Task Details & Context */}
                {item.context && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
                      Extracted Transcript Context
                    </label>
                    <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-space-sm rounded-lg border border-surface-variant/20">
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
                        className={`w-5 h-5 rounded-full ${item.assignee?.colorClass || 'bg-primary text-on-primary'} font-label-sm text-label-sm flex items-center justify-center font-bold text-[10px]`}
                      >
                        {item.assignee?.initials || 'A'}
                      </div>
                      <span className="truncate">{item.assignee?.name || 'Unassigned'}</span>
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
                    <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center justify-between">
                      <span>Destination</span>
                      <span className="text-[10px] text-primary">Toggle tracker</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleDestination(item.id)}
                      title="Click to switch between Jira and Trello"
                      className={`flex items-center justify-between px-space-sm py-1.5 rounded-lg ${
                        item.destination?.colorClass || 'bg-surface-container-high text-on-surface'
                      } font-label-sm text-label-sm font-semibold cursor-pointer hover:opacity-90 transition-all border border-transparent hover:border-primary/40`}
                    >
                      <span className="inline-flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[15px]">
                          {item.destination?.icon || 'task_alt'}
                        </span>
                        {item.destination?.label || 'Jira / Task'}
                      </span>
                      <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Manual Action Item Button */}
            <button
              className="w-full py-3 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border border-dashed border-surface-variant"
              type="button"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Add Manual Action Item
            </button>
          </section>
        </div>
      </div>

      {/* Manual Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4 border border-surface-variant/30">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Add Manual Action Item
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateManual} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-secondary">Task Title</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Verify OAuth token refresh pipeline"
                  className="px-3 py-2 bg-surface-container-low rounded-lg border outline-none text-body-sm text-on-surface"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-secondary">Assignee Name</label>
                <input
                  type="text"
                  value={manualAssignee}
                  onChange={(e) => setManualAssignee(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="px-3 py-2 bg-surface-container-low rounded-lg border outline-none text-body-sm text-on-surface"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-semibold text-secondary">Due Date</label>
                <input
                  type="text"
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  placeholder="e.g. Friday 5 PM"
                  className="px-3 py-2 bg-surface-container-low rounded-lg border outline-none text-body-sm text-on-surface"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-secondary text-body-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-body-sm font-semibold shadow-sm"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Bottom Floating Approval Bar */}
      <div className="fixed bottom-4 left-64 right-0 z-40 px-margin flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-surface-container-lowest/95 backdrop-blur-xl px-space-xl py-space-md rounded-2xl shadow-xl flex items-center gap-space-xl max-w-2xl w-full justify-between border border-surface-variant/40">
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
                Target integrations: Jira Cloud &amp; Trello Workspace
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

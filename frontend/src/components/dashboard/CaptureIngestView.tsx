import React, { useState, useEffect, useRef } from 'react';

interface CaptureIngestViewProps {
  onBackToDashboard?: () => void;
  onExtractionComplete?: (data: { title: string; destination: string; count: number }) => void;
}

type IngestMode = 'paste' | 'upload' | 'record';

export const CaptureIngestView: React.FC<CaptureIngestViewProps> = ({
  onBackToDashboard,
  onExtractionComplete,
}) => {
  const [activeMode, setActiveMode] = useState<IngestMode>('paste');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [destination, setDestination] = useState('jira');
  const [requireAssignee, setRequireAssignee] = useState(true);
  const [autoEstimate, setAutoEstimate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveSttText, setLiveSttText] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([
    15, 30, 45, 60, 75, 40, 55, 70, 85, 60, 50, 65, 80, 92, 65, 45, 50, 35, 70, 60, 75, 90, 55, 65,
  ]);

  const sampleTranscripts = {
    standard: `Alex Rivera: Let's finalize the rollout schedule for the v2.4 billing engine rewrite.
Sarah Chen: We finished load tests on the payment retry service. It handled 12,000 req/sec comfortably. But we need to patch the webhook idempotency key handling before going live.
Alex Rivera: Agreed. Sarah, can you own that Jira ticket and make sure PR is reviewed by Thursday at 2 PM?
Sarah Chen: Yes, putting that on my sprint board right now.
David Miller: I'll coordinate the status page update and communicate downtime notice to top 20 enterprise accounts by Wednesday noon.
Alex Rivera: Perfect. Also David, verify with customer success that the audit log exporter is documented in the knowledge base.
David Miller: Will do. Expect a draft by Friday EOD.
Alex Rivera: Meeting adjourned, let's ship this!`,
    vtt: `WEBVTT

00:00:01.000 --> 00:00:04.500
Alex Rivera: Thanks everyone for joining the Q3 Enterprise Architecture Sync.

00:00:05.100 --> 00:00:10.000
Elena Rostova: We must configure the OAuth2 SSO provider before next Tuesday or customer onboarding will halt.

00:00:10.500 --> 00:00:16.000
Marcus Vance: I'll provision the replica cluster in us-east-2 and configure Redis caching by tomorrow 3 PM.`,
  };

  // Timer & visualizer tick when recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
        // Animate visualizer bars
        setAudioLevels((prev) => prev.map(() => Math.floor(Math.random() * 80) + 15));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Simulated live STT stream during recording
  useEffect(() => {
    if (isRecording) {
      const snippets = [
        '...locking in the staging microservices and verifying cross-cluster ingress certificates...',
        '...Dave will coordinate database migrations with the infrastructure leads before Thursday...',
        '...Sarah confirming payment gateway payload encryption and reviewing open PR #412...',
      ];
      const index = Math.floor(recordSeconds / 3) % snippets.length;
      setLiveSttText(snippets[index]);
    }
  }, [isRecording, recordSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (!meetingTitle) {
        setMeetingTitle('Live Audio Session ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } else {
      setIsRecording(true);
      setRecordSeconds(0);
      setLiveSttText('Listening... Stream audio buffer active.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'Media/Text',
      });
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'Media/Text',
      });
      if (!meetingTitle) {
        setMeetingTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleLoadSample = (type: 'standard' | 'vtt') => {
    const text = sampleTranscripts[type];
    setTranscript(text);
    if (!meetingTitle) {
      setMeetingTitle(
        type === 'standard' ? 'Billing Engine v2.4 Rollout Sync' : 'Q3 Enterprise Architecture Sync'
      );
    }
  };

  const handleGenerate = () => {
    setIsProcessing(true);
    setProcessingStatus('Synthesizing Decisions & Action Items...');

    setTimeout(() => {
      setProcessingStatus('Extracting assignees, deadlines & dispatch tickets...');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('Extraction complete! 8 tasks generated.');

        const finalTitle = meetingTitle.trim() || 'Sprint Planning & Architecture Sync';
        onExtractionComplete?.({
          title: finalTitle,
          destination,
          count: 8,
        });

        // Reset status feedback after delay
        setTimeout(() => {
          setProcessingStatus(null);
        }, 3000);
      }, 1500);
    }, 1800);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const hasContent =
    (activeMode === 'paste' && transcript.trim().length > 0) ||
    (activeMode === 'upload' && uploadedFile !== null) ||
    (activeMode === 'record' && recordSeconds > 0);

  return (
    <div className="max-w-5xl mx-auto w-full px-space-md sm:px-space-xl py-space-xl flex flex-col gap-space-lg animate-fadeIn">
      {/* Top Context & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="hover:underline flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Workspace Console</span>
            </button>
            <span className="text-outline-variant">/</span>
            <span className="flex items-center gap-1 font-semibold text-primary">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Intelligent Ingestion</span>
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Capture &amp; Ingest Meeting
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Feed your live meeting audio, binary recordings, or raw transcripts to automatically extract structured action items and push tickets to your trackers.
          </p>
        </div>

        {/* Quick Pipeline Status Badge */}
        <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm border border-outline-variant/30 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-secondary font-medium">Model Ready</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Whisper v3 + Claude 3.5</span>
          </div>
        </div>
      </div>

      {/* Main Unified Container Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 flex flex-col overflow-hidden">
        {/* Top Segmented Navigation Tabs */}
        <div className="px-space-md sm:px-space-lg pt-space-md pb-0 bg-surface-container-lowest border-b border-surface-container">
          <div className="flex items-center gap-space-xs sm:gap-space-sm overflow-x-auto" role="tablist">
            {/* Tab 1: Paste Transcript */}
            <button
              type="button"
              onClick={() => setActiveMode('paste')}
              className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-t-lg font-label-md text-label-md font-semibold transition-all border-b-2 cursor-pointer ${
                activeMode === 'paste'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">content_paste</span>
              <span>Paste Transcript</span>
            </button>

            {/* Tab 2: Upload File */}
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-t-lg font-label-md text-label-md font-medium transition-all border-b-2 cursor-pointer ${
                activeMode === 'upload'
                  ? 'border-primary text-primary bg-primary/5 font-semibold'
                  : 'border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload File</span>
              <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-secondary">
                MP3, WAV, VTT
              </span>
            </button>

            {/* Tab 3: Record Audio */}
            <button
              type="button"
              onClick={() => setActiveMode('record')}
              className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-t-lg font-label-md text-label-md font-medium transition-all border-b-2 cursor-pointer ${
                activeMode === 'record'
                  ? 'border-primary text-primary bg-primary/5 font-semibold'
                  : 'border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Record Audio</span>
              {isRecording && <span className="w-2 h-2 rounded-full bg-error animate-ping" />}
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg">
          {/* PANEL 1: PASTE TRANSCRIPT */}
          {activeMode === 'paste' && (
            <div className="flex flex-col gap-space-md animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label htmlFor="transcript-input" className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                  <span>Paste formatted or raw meeting transcript notes</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('standard')}
                    className="text-primary hover:text-primary-container font-label-md text-label-md font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
                    <span>Fill with sample transcript</span>
                  </button>
                </div>
              </div>

              {/* Textarea Section */}
              <div className="relative rounded-lg overflow-hidden border border-outline-variant/40 bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <textarea
                  id="transcript-input"
                  rows={9}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="e.g. Alex: Let's ship the webhook retry logic by Friday EOD. Sarah can you verify the payload schemas?&#10;Sarah: Sure, I'll review API contracts today and notify Marcus once staging passes.&#10;Marcus: Sounds solid. I'll deploy the schema updates before noon tomorrow..."
                  className="w-full p-space-md bg-surface text-on-surface font-body-md text-body-md placeholder:text-secondary/60 resize-none outline-none leading-relaxed"
                />

                {/* Bottom utility / counter strip */}
                <div className="flex items-center justify-between px-space-md py-2 bg-surface-container-lowest/80 border-t border-surface-container/60 flex-wrap gap-2">
                  <div className="flex items-center gap-space-sm text-secondary font-label-sm text-label-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">translate</span>
                      Auto-detect (English, Spanish, German, +34)
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[14px]">shield</span>
                      Zero-data retention verified
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    {transcript && (
                      <button
                        type="button"
                        onClick={() => setTranscript('')}
                        className="text-secondary hover:text-error font-label-sm text-label-sm transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                    <span className="text-outline-variant">|</span>
                    <span
                      className={`font-label-sm text-label-sm px-2 py-0.5 rounded font-mono font-medium ${
                        wordCount > 0 ? 'text-primary bg-primary/10' : 'text-secondary bg-surface-container'
                      }`}
                    >
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: UPLOAD FILE */}
          {activeMode === 'upload' && (
            <div className="flex flex-col gap-space-md animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Upload recording or exported transcript file
                </span>
                <span className="font-label-sm text-label-sm text-secondary">Max size: 100MB</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".mp3,.wav,.m4a,.webm,.txt,.vtt,.srt,.json"
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-space-xl border-2 border-dashed rounded-xl transition-all cursor-pointer text-center group ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/60 bg-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-space-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[30px]">cloud_upload</span>
                </div>
                <p className="font-label-md text-label-md font-semibold text-on-surface mb-1">
                  Click to browse or drag &amp; drop audio / transcript
                </p>
                <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                  Audio recordings (.mp3, .m4a, .wav, .webm) or plain text/vtt transcripts from Zoom, Google Meet, or Teams.
                </p>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/40">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[22px]">description</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">
                        {uploadedFile.name}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        {uploadedFile.size} • {uploadedFile.type}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="text-secondary hover:text-error p-1 rounded transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )}

              {/* Sample benchmark quick loader */}
              <div className="flex items-center justify-between p-space-sm bg-surface rounded-lg border border-outline-variant/30 flex-wrap gap-2">
                <span className="font-label-sm text-label-sm text-secondary">Quick test benchmarks:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile({ name: 'q3-enterprise-sync.vtt', size: '1.4 MB', type: 'text/vtt' });
                      setTranscript(sampleTranscripts.vtt);
                      if (!meetingTitle) setMeetingTitle('Q3 Enterprise Architecture Sync');
                    }}
                    className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-colors cursor-pointer"
                  >
                    Load Sample .VTT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile({ name: 'billing-engine-retro.txt', size: '2.1 MB', type: 'text/plain' });
                      setTranscript(sampleTranscripts.standard);
                      if (!meetingTitle) setMeetingTitle('Billing Engine v2.4 Rollout Sync');
                    }}
                    className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-secondary font-label-sm text-label-sm transition-colors cursor-pointer"
                  >
                    Load Sample .TXT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 3: RECORD AUDIO */}
          {activeMode === 'record' && (
            <div className="flex flex-col gap-space-md animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Realtime Hardware Microphone Stream
                </span>
                <span className="font-label-sm text-label-sm flex items-center gap-1 font-medium">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRecording ? 'bg-error animate-ping' : 'bg-primary'
                    }`}
                  />
                  <span className={isRecording ? 'text-error font-bold' : 'text-primary'}>
                    {isRecording ? 'Recording Live...' : 'Mic Standby'}
                  </span>
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-space-xl border border-outline-variant/40 rounded-xl bg-surface text-center gap-space-md">
                {/* Timer Display */}
                <div className="flex flex-col items-center">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-mono">
                    SESSION DURATION
                  </span>
                  <span className="font-display text-display font-mono text-on-surface tracking-wider leading-none mt-1">
                    {formatTimer(recordSeconds)}
                  </span>
                </div>

                {/* Animated Audio Equalizer Visualizer */}
                <div className="h-16 w-full max-w-md bg-surface-container flex items-end justify-between p-2 gap-1 rounded-lg overflow-hidden">
                  {audioLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      style={{ height: isRecording ? `${lvl}%` : '8%' }}
                      className={`w-full rounded-xs transition-all duration-100 ${
                        isRecording ? 'bg-primary' : 'bg-secondary/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Main Toggle Recording Button */}
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`px-6 py-3 rounded-full font-headline-sm text-headline-sm font-semibold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95 ${
                    isRecording
                      ? 'bg-error text-on-error hover:bg-error-container'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isRecording ? 'stop_circle' : 'mic'}
                  </span>
                  <span>{isRecording ? 'Stop & Commit Audio' : 'Start Live Recording'}</span>
                </button>

                {/* Live STT Preview Box */}
                {isRecording && (
                  <div className="w-full max-w-lg p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/40 font-mono text-body-sm text-on-surface-variant text-left flex items-start gap-2 animate-fadeIn">
                    <span className="text-primary font-bold">&gt;&gt;</span>
                    <span className="italic">{liveSttText}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
            {/* Meeting Title Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="meeting-title" className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
                <span>
                  Meeting Title <span className="font-label-sm text-secondary font-normal">(optional)</span>
                </span>
                <span className="font-label-sm text-secondary">Auto-detects if empty</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
                  calendar_today
                </span>
                <input
                  id="meeting-title"
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Sprint 42 Planning & Architecture Review"
                  className="w-full h-[38px] pl-10 pr-space-md bg-surface-container-lowest text-on-surface placeholder:text-secondary/60 font-body-sm text-body-sm rounded-lg border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Push Destination Selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="destination-select" className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
                <span>Push Destination</span>
                <span className="font-label-sm text-primary flex items-center gap-0.5 font-medium">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Connected
                </span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-5 h-5 rounded flex items-center justify-center bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[15px]">task_alt</span>
                </div>
                <select
                  id="destination-select"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-[38px] pl-10 pr-9 bg-surface-container-lowest text-on-surface font-body-sm text-body-sm rounded-lg border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="jira">Jira — Core Eng (PROJ-ACME)</option>
                  <option value="linear">Linear — Engineering / Cycle 18</option>
                  <option value="github">GitHub Issues — acme/infrastructure</option>
                  <option value="notion">Notion — Product Decisions &amp; Tasks</option>
                  <option value="slack">Slack — #proj-executive-briefing</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 text-secondary pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Extraction Rules & Granularity Settings */}
          <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border border-outline-variant/20">
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Task Synthesis Strictness
                </span>
                <span className="font-label-sm text-label-sm text-secondary">
                  Only create action items when explicit owner and deadline are established
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer font-label-md text-label-md text-on-surface">
                <input
                  type="checkbox"
                  checked={requireAssignee}
                  onChange={(e) => setRequireAssignee(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <span>Require Assignee</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-label-md text-label-md text-on-surface ml-2">
                <input
                  type="checkbox"
                  checked={autoEstimate}
                  onChange={(e) => setAutoEstimate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <span>Auto-estimate story points</span>
              </label>
            </div>
          </div>

          {/* Processing Status Banner (if active) */}
          {processingStatus && (
            <div className="flex items-center gap-space-sm p-space-sm bg-primary/10 rounded-lg text-primary font-label-md text-label-md animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              <span>{processingStatus}</span>
            </div>
          )}

          {/* Large Full-width Primary CTA Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isProcessing || !hasContent}
            className={`w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] ${
              isProcessing || !hasContent ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">
              auto_awesome
            </span>
            <span>{isProcessing ? 'Synthesizing Action Items...' : 'Generate Action Items (~15s)'}</span>
            <span className="material-symbols-outlined text-[18px] opacity-80 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* Supplementary Informational Grid / Context cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant/30 flex items-start gap-space-sm shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">SOC2 Compliant Parsing</span>
            <span className="font-body-sm text-body-sm text-secondary">
              Audio &amp; notes are decrypted in memory and expunged post extraction.
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant/30 flex items-start gap-space-sm shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Bilateral Sync</span>
            <span className="font-body-sm text-body-sm text-secondary">
              Issues map sprint milestones, parent epics, and auto-tag attendees.
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant/30 flex items-start gap-space-sm shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">Decision Log Created</span>
            <span className="font-body-sm text-body-sm text-secondary">
              Extracts executive rationale alongside tactical team deliverables.
            </span>
          </div>
        </div>
      </div>

      {/* Recent Session Ingest History Preview */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Recent Meeting Extractions
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="font-label-md text-label-md text-primary hover:underline font-medium cursor-pointer"
          >
            View all transcripts
          </button>
        </div>

        <div className="divide-y divide-surface-container">
          {/* Item 1 */}
          <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-low px-2 rounded-lg transition-colors">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Q3 Architecture Review &amp; Database Migration
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Yesterday, 4:30 PM • 48 min • 8 Jira tickets generated
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm font-medium">
                Jira: CORE-842..850
              </span>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-secondary hover:text-on-surface text-[18px] material-symbols-outlined cursor-pointer"
              >
                chevron_right
              </button>
            </div>
          </div>

          {/* Item 2 */}
          <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-low px-2 rounded-lg transition-colors">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Design System Alignment - Mobile Navigation
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  May 24, 11:00 AM • 22 min • 4 Linear tasks pushed
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm font-medium">
                Linear: ENG-194
              </span>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-secondary hover:text-on-surface text-[18px] material-symbols-outlined cursor-pointer"
              >
                chevron_right
              </button>
            </div>
          </div>

          {/* Item 3 */}
          <div className="py-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm hover:bg-surface-container-low px-2 rounded-lg transition-colors">
            <div className="flex items-center gap-space-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">
                  Weekly Executive Operations Sync
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  May 23, 9:00 AM • 55 min • 11 Jira tickets + Decision Brief
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm font-medium">
                Jira: EXEC-209
              </span>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-secondary hover:text-on-surface text-[18px] material-symbols-outlined cursor-pointer"
              >
                chevron_right
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

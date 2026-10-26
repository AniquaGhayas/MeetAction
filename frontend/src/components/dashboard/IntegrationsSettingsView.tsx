import React, { useState } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';

interface IntegrationsSettingsViewProps {
  onBackToDashboard?: () => void;
}

export const IntegrationsSettingsView: React.FC<IntegrationsSettingsViewProps> = ({
  onBackToDashboard,
}) => {
  // Jira State
  const [jiraConnected, setJiraConnected] = useState(true);
  const [jiraProject, setJiraProject] = useState('Core Engineering (CORE)');
  const [jiraIssueType, setJiraIssueType] = useState('Task');
  const [jiraTesting, setJiraTesting] = useState(false);
  const [jiraTestMessage, setJiraTestMessage] = useState<string | null>(null);

  // Trello State
  const [trelloConnected, setTrelloConnected] = useState(true);
  const [trelloBoard, setTrelloBoard] = useState('Q4 Sprint Board');
  const [trelloList, setTrelloList] = useState('Backlog / Incoming Tasks');
  const [trelloReauthing, setTrelloReauthing] = useState(false);
  const [trelloMessage, setTrelloMessage] = useState<string | null>(null);

  // Slack State
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [slackChannel, setSlackChannel] = useState('# eng-announcements');
  const [slackPinging, setSlackPinging] = useState(false);
  const [slackPingSuccess, setSlackPingSuccess] = useState(false);

  // General AI Preferences
  const [prefAssignees, setPrefAssignees] = useState(true);
  const [prefDeadlines, setPrefDeadlines] = useState(true);
  const [prefApproval, setPrefApproval] = useState(true);

  // Save State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleTestJira = () => {
    setJiraTesting(true);
    setJiraTestMessage(null);
    setTimeout(() => {
      setJiraTesting(false);
      setJiraTestMessage('Webhook verified (HTTP 200)');
      setTimeout(() => setJiraTestMessage(null), 3000);
    }, 800);
  };

  const handleReauthTrello = () => {
    setTrelloReauthing(true);
    setTimeout(() => {
      setTrelloReauthing(false);
      setTrelloMessage('Token refreshed (+90 days)');
      setTimeout(() => setTrelloMessage(null), 3000);
    }, 800);
  };

  const handlePingSlack = () => {
    setSlackPinging(true);
    setSlackPingSuccess(false);
    setTimeout(() => {
      setSlackPinging(false);
      setSlackPingSuccess(true);
      setTimeout(() => setSlackPingSuccess(false), 3000);
    }, 700);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 600);
  };

  const handleDiscard = () => {
    setJiraConnected(true);
    setJiraProject('Core Engineering (CORE)');
    setJiraIssueType('Task');
    setTrelloConnected(true);
    setTrelloBoard('Q4 Sprint Board');
    setTrelloList('Backlog / Incoming Tasks');
    setSlackEnabled(true);
    setSlackChannel('# eng-announcements');
    setPrefAssignees(true);
    setPrefDeadlines(true);
    setPrefApproval(true);
    setSaveStatus('idle');
  };

  return (
    <div className="flex flex-col w-full animate-fadeIn">
      <div className="max-w-7xl mx-auto w-full px-space-md sm:px-space-xl py-space-xl flex flex-col gap-space-xl pb-28">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer mr-2"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Dashboard</span>
                </button>
              )}
              <span>Workspace Preferences</span>
              <span className="inline-block w-1 h-1 rounded-full bg-outline-variant" />
              <span className="text-primary font-semibold">PRD Compliant Configuration</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              Integrations &amp; Settings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Manage OAuth connections to external issue trackers and configure automated action-item handling.
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <ThemeToggle variant="button" />
            <div className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md shadow-sm border border-surface-container-highest/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-on-surface">OAuth 2.0 Enabled</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant ml-0.5">
                verified_user
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Issue Trackers & Delivery */}
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Issue Trackers &amp; Delivery
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Secured with OAuth 2.0 enterprise tokens and scoped write-permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm self-start sm:self-auto">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Zero-storage credentials</span>
            </div>
          </div>

          {/* Grid of Tracker Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {/* Card 1: Atlassian Jira */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden border border-surface-variant/30">
              <div className="p-space-lg flex flex-col gap-space-lg">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-space-sm pb-space-md bg-surface-container-lowest">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container shadow-sm">
                      <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2.8C2.36 6.35 2 6.7 2 7.15v4.32c0 .44.36.8.8.8h4.33c4.86 0 8.8-3.9 8.8-8.73V2h-4.4zm.94 5.92c0 2.4-1.97 4.35-4.4 4.35H3.74c-.44 0-.8.36-.8.8v4.32c0 .44.36.8.8.8h4.33c4.86 0 8.8-3.9 8.8-8.73V7.92h-4.4zm.94 5.92c0 2.4-1.97 4.35-4.4 4.35H4.68c-.44 0-.8.36-.8.8V21.3c0 .44.36.8.8.8h4.33c4.86 0 8.8-3.9 8.8-8.73v-0.53h-4.4z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        Atlassian Jira
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            jiraConnected ? 'bg-emerald-500' : 'bg-secondary/40'
                          }`}
                        />
                        {jiraConnected ? 'acme-corp.atlassian.net' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  {jiraConnected ? (
                    <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>OAuth 2.0 Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setJiraConnected(true)}
                      className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Configuration Fields */}
                <div className={`flex flex-col gap-space-md pt-2 ${!jiraConnected ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between"
                      htmlFor="jira-project"
                    >
                      <span>Default Target Project</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                        Auto-selected for new tickets
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        id="jira-project"
                        value={jiraProject}
                        onChange={(e) => setJiraProject(e.target.value)}
                        className="w-full h-10 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:bg-surface-container-lowest shadow-sm transition-all cursor-pointer border border-transparent focus:border-primary/40"
                      >
                        <option>Core Engineering (CORE)</option>
                        <option>Product Experience (PX)</option>
                        <option>Platform Infrastructure (INFRA)</option>
                        <option>Security &amp; Governance (SEC)</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between"
                      htmlFor="jira-issue-type"
                    >
                      <span>Default Issue Type</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                        Synthesized item default
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        id="jira-issue-type"
                        value={jiraIssueType}
                        onChange={(e) => setJiraIssueType(e.target.value)}
                        className="w-full h-10 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:bg-surface-container-lowest shadow-sm transition-all cursor-pointer border border-transparent focus:border-primary/40"
                      >
                        <option>Task</option>
                        <option>Action Item</option>
                        <option>Story</option>
                        <option>Bug Spike</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sync Meta Sparkline info */}
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {jiraTestMessage ? (
                        <strong className="text-emerald-700">{jiraTestMessage}</strong>
                      ) : (
                        <>
                          Last webhook handshake: <strong>2m ago</strong>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestJira}
                    disabled={!jiraConnected || jiraTesting}
                    className="font-label-sm text-label-sm text-primary font-medium cursor-pointer hover:underline disabled:opacity-50"
                  >
                    {jiraTesting ? 'Testing...' : 'Test Payload'}
                  </button>
                </div>
              </div>

              {/* Footer Area */}
              <div className="px-space-lg py-3 bg-surface-container-low/70 flex items-center justify-between border-t border-surface-variant/20">
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-secondary">cloud_done</span>
                  Authorized via Atlassian Cloud
                </span>
                {jiraConnected && (
                  <button
                    type="button"
                    onClick={() => setJiraConnected(false)}
                    className="text-error hover:text-on-error-container font-label-md text-label-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">link_off</span>
                    <span>Disconnect</span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Trello */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden border border-surface-variant/30">
              <div className="p-space-lg flex flex-col gap-space-lg">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-space-sm pb-space-md bg-surface-container-lowest">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container shadow-sm">
                      <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.5 2h-15A2.5 2.5 0 002 4.5v15A2.5 2.5 0 004.5 22h15a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0019.5 2zM10 16.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1v-11a1 1 0 011-1H9a1 1 0 011 1v11zm9.5-5a1 1 0 01-1 1H14a1 1 0 01-1-1v-6a1 1 0 011-1h4.5a1 1 0 011 1v6z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Trello</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            trelloConnected ? 'bg-emerald-500' : 'bg-secondary/40'
                          }`}
                        />
                        {trelloConnected ? 'Connected as @alexrivera' : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  {trelloConnected ? (
                    <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>OAuth 2.0 Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTrelloConnected(true)}
                      className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Configuration Fields */}
                <div className={`flex flex-col gap-space-md pt-2 ${!trelloConnected ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between"
                      htmlFor="trello-board"
                    >
                      <span>Default Board</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                        Active team board
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        id="trello-board"
                        value={trelloBoard}
                        onChange={(e) => setTrelloBoard(e.target.value)}
                        className="w-full h-10 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:bg-surface-container-lowest shadow-sm transition-all cursor-pointer border border-transparent focus:border-primary/40"
                      >
                        <option>Q4 Sprint Board</option>
                        <option>Cross-Team Product Roadmap</option>
                        <option>Executive Engineering Review</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md font-medium text-on-surface flex items-center justify-between"
                      htmlFor="trello-list"
                    >
                      <span>Default List</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                        Landing destination
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        id="trello-list"
                        value={trelloList}
                        onChange={(e) => setTrelloList(e.target.value)}
                        className="w-full h-10 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:bg-surface-container-lowest shadow-sm transition-all cursor-pointer border border-transparent focus:border-primary/40"
                      >
                        <option>Backlog / Incoming Tasks</option>
                        <option>Triage Next</option>
                        <option>This Week's Sprints</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sync Meta Sparkline info */}
                <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[18px]">token</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {trelloMessage ? (
                        <strong className="text-emerald-700">{trelloMessage}</strong>
                      ) : (
                        <>
                          Token expires in: <strong>89 days</strong>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReauthTrello}
                    disabled={!trelloConnected || trelloReauthing}
                    className="font-label-sm text-label-sm text-primary font-medium cursor-pointer hover:underline disabled:opacity-50"
                  >
                    {trelloReauthing ? 'Refreshing...' : 'Re-authenticate'}
                  </button>
                </div>
              </div>

              {/* Footer Area */}
              <div className="px-space-lg py-3 bg-surface-container-low/70 flex items-center justify-between border-t border-surface-variant/20">
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
                  Authorized via Trello OAuth
                </span>
                {trelloConnected && (
                  <button
                    type="button"
                    onClick={() => setTrelloConnected(false)}
                    className="text-error hover:text-on-error-container font-label-md text-label-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">link_off</span>
                    <span>Disconnect</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Slack Notifications */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Slack Notifications
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Real-time meeting synthesis dispatches and action item alerts.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg border border-surface-variant/30">
            <div className="flex items-start gap-space-md max-w-xl">
              <div className="w-12 h-12 rounded-lg bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Broadcast Channel Dispatch
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold cursor-pointer ${
                      slackEnabled
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-surface-container text-secondary'
                    }`}
                    onClick={() => setSlackEnabled(!slackEnabled)}
                  >
                    {slackEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Post instant notifications and created ticket links directly into a team channel upon meeting finalization.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full md:w-auto shrink-0">
              <div className="flex flex-col gap-1 min-w-[240px]">
                <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">
                  Target Slack Channel
                </span>
                <div className="relative">
                  <select
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    disabled={!slackEnabled}
                    className="w-full h-10 pl-8 pr-9 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm appearance-none outline-none focus:bg-surface-container-lowest shadow-sm cursor-pointer border border-transparent focus:border-primary/40 disabled:opacity-50"
                  >
                    <option># eng-announcements</option>
                    <option># product-leads</option>
                    <option># meeting-digests</option>
                    <option># executive-ops</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-2.5 text-on-surface-variant text-[16px]">
                    tag
                  </span>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={handlePingSlack}
                  disabled={!slackEnabled || slackPinging}
                  className="px-space-md h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {slackPinging ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Pinging...</span>
                    </>
                  ) : slackPingSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">done</span>
                      <span className="text-emerald-700">Ping Sent!</span>
                    </>
                  ) : (
                    <span>Send Test Ping</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: General Preferences (Automation Rules) */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                General Preferences &amp; AI Extraction
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Refine how language models extract tasks, assignees, and target timelines.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-variant/30">
            {/* Toggle Item 1 */}
            <label className="p-space-lg flex items-start justify-between gap-space-md cursor-pointer hover:bg-surface-container-low/40 transition-colors">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">person_search</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                    Auto-suggest assignees from transcript
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Matches verbal commitments (e.g., "Alex will follow up with DevOps") to registered team member handles across Jira and Trello.
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefAssignees}
                  onChange={(e) => setPrefAssignees(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
              </div>
            </label>

            {/* Divider line */}
            <div className="h-[1px] w-full bg-surface-container-low" />

            {/* Toggle Item 2 */}
            <label className="p-space-lg flex items-start justify-between gap-space-md cursor-pointer hover:bg-surface-container-low/40 transition-colors">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">event_available</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                    Extract implicit deadlines
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Converts phrases like "by end of day next Thursday" or "before release cut off" into precise ISO timestamp due dates.
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefDeadlines}
                  onChange={(e) => setPrefDeadlines(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
              </div>
            </label>

            {/* Divider line */}
            <div className="h-[1px] w-full bg-surface-container-low" />

            {/* Toggle Item 3 */}
            <label className="p-space-lg flex items-start justify-between gap-space-md cursor-pointer hover:bg-surface-container-low/40 transition-colors">
              <div className="flex items-start gap-space-md">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                      Require manual approval before ticket creation
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-medium">
                      Recommended
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Presents a quick review drawer so team managers can confirm summary text and project assignments before outbound API dispatch.
                  </p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={prefApproval}
                  onChange={(e) => setPrefApproval(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Workspace Appearance & Theme */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">palette</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Workspace Appearance &amp; Color Theme
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Toggle between Light Mode and Stitch Dark Mode theme across all console views.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-surface-container-highest/60">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">contrast</span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                  Interface Theme Mode
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Select your preferred workspace aesthetic. Syncs automatically to your local browser storage.
                </span>
              </div>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-30 border-t border-surface-variant/40">
        <div className="max-w-7xl mx-auto px-space-md sm:px-space-xl py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">cloud_sync</span>
            <span>
              Configurations synchronized <span className="hidden sm:inline">• Settings apply workspace-wide</span>
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
            >
              {saveStatus === 'saving' ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

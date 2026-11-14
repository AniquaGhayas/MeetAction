export type SourceType = 'text' | 'file' | 'audio';

export type MeetingStatus =
  | 'queued'
  | 'transcribing'
  | 'extracting'
  | 'ready_for_review'
  | 'synced'
  | 'failed';

export type ItemStatus = 'pending' | 'approved' | 'excluded' | 'pushed';

export interface AssigneeInfo {
  name: string;
  initials: string;
  colorClass?: string;
  email?: string;
}

export interface DestinationInfo {
  icon: string;
  label: string;
  colorClass?: string;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  assigneeRaw?: string;
  assigneeResolvedId?: string;
  assignee: AssigneeInfo;
  dueDate: string;
  sourceSnippet?: string;
  timestamp?: string;
  status: ItemStatus;
  included: boolean;
  excluded: boolean;
  confidence: number;
  destination: DestinationInfo;
  pushedTo?: 'jira' | 'trello' | null;
  externalId?: string;
  externalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptTurn {
  id: number;
  meetingId: string;
  speaker: {
    name: string;
    initials: string;
    colorClass?: string;
  };
  timestamp: string;
  text: string;
  actionItem?: {
    number: number;
    confidence: number;
    quote: string;
  };
}

export interface Meeting {
  id: string;
  userId: string;
  title: string;
  sourceType: SourceType;
  rawTranscript: string;
  audioFileUrl?: string;
  status: MeetingStatus;
  destination?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
  tickets?: string[];
  actionItemsCount?: number;
}

export interface Integration {
  id: string;
  userId: string;
  provider: 'jira' | 'trello';
  connected: boolean;
  instanceUrl?: string;
  apiKey?: string;
  connectedAt?: string;
}

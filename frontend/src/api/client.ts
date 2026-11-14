export interface ApiMeeting {
  id: string;
  userId: string;
  title: string;
  sourceType: 'text' | 'file' | 'audio';
  rawTranscript: string;
  audioFileUrl?: string;
  status: 'queued' | 'transcribing' | 'extracting' | 'ready_for_review' | 'synced' | 'failed';
  destination?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
  tickets?: string[];
  actionItemsCount?: number;
}

export interface ApiActionItem {
  id: string;
  meetingId: string;
  description: string;
  assigneeRaw?: string;
  assignee: {
    name: string;
    initials: string;
    colorClass?: string;
    email?: string;
  };
  dueDate: string;
  sourceSnippet?: string;
  timestamp?: string;
  status: 'pending' | 'approved' | 'excluded' | 'pushed';
  included: boolean;
  excluded: boolean;
  confidence: number;
  destination: {
    icon: string;
    label: string;
    colorClass?: string;
  };
  pushedTo?: 'jira' | 'trello' | null;
  externalId?: string;
  externalUrl?: string;
}

export interface ApiTranscriptTurn {
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

export interface ApiMeetingDetailResponse {
  success: boolean;
  meeting: ApiMeeting;
  turns: ApiTranscriptTurn[];
  items: ApiActionItem[];
}

const API_BASE = '/api';

export const apiClient = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Meetings
  async getMeetings(): Promise<ApiMeeting[]> {
    const res = await fetch(`${API_BASE}/meetings`);
    if (!res.ok) throw new Error('Failed to fetch meetings');
    const data = await res.json();
    return data.meetings || [];
  },

  async getMeeting(id: string): Promise<ApiMeetingDetailResponse> {
    const res = await fetch(`${API_BASE}/meetings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch meeting details');
    return res.json();
  },

  async createMeetingFromAudio(
    audioFile: File | Blob,
    title: string,
    destination: string = 'jira'
  ): Promise<{ meeting: ApiMeeting }> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('destination', destination);

    const filename =
      audioFile instanceof File ? audioFile.name : `audio-recording-${Date.now()}.webm`;
    formData.append('file', audioFile, filename);

    const res = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.details || 'Failed to upload audio meeting');
    }
    return res.json();
  },

  async createMeetingFromText(
    title: string,
    transcript: string,
    destination: string = 'jira'
  ): Promise<{ meeting: ApiMeeting }> {
    const res = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        transcript,
        destination,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.details || 'Failed to create meeting from transcript');
    }
    return res.json();
  },

  // Action Items
  async updateActionItem(
    itemId: string,
    updates: Partial<ApiActionItem>
  ): Promise<{ item: ApiActionItem }> {
    const res = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error('Failed to update action item');
    return res.json();
  },

  async createManualItem(
    meetingId: string,
    item: {
      description: string;
      assigneeName?: string;
      dueDate?: string;
      destination?: any;
    }
  ): Promise<{ item: ApiActionItem }> {
    const res = await fetch(`${API_BASE}/meetings/${meetingId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (!res.ok) throw new Error('Failed to add manual action item');
    return res.json();
  },

  async deleteActionItem(itemId: string) {
    const res = await fetch(`${API_BASE}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  // Push to Jira/Trello (Phase 5 Step 13)
  async pushItems(
    meetingId: string,
    options?: {
      targetProject?: string;
      targetIssueType?: string;
      targetBoard?: string;
      targetList?: string;
      itemIds?: string[];
    }
  ): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      itemId: string;
      description: string;
      destination: string;
      externalId: string;
      externalUrl: string;
      status: string;
      error?: string;
    }>;
    summary?: {
      total: number;
      succeeded: number;
      failed: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/meetings/${meetingId}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to push action items');
    }
    return res.json();
  },

  // Stats
  async getStats(): Promise<{
    totalMeetings: number;
    totalActionItems: number;
    totalTicketsCreated: number;
  }> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    const data = await res.json();
    return data.stats;
  },

  // Integrations & OAuth (Phase 5 Step 11 & Step 12)
  async getIntegrations(userId?: string) {
    const url = userId ? `${API_BASE}/integrations?userId=${userId}` : `${API_BASE}/integrations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch integrations');
    return res.json();
  },

  async updateIntegration(data: {
    provider: 'jira' | 'trello';
    connected: boolean;
    instanceUrl?: string;
    apiKey?: string;
    userId?: string;
  }) {
    const res = await fetch(`${API_BASE}/integrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update integration');
    return res.json();
  },

  // Jira API Adapters (Step 11)
  async getJiraProjects(userId?: string): Promise<Array<{ id: string; key: string; name: string }>> {
    const url = userId ? `${API_BASE}/integrations/jira/projects?userId=${userId}` : `${API_BASE}/integrations/jira/projects`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  },

  async getJiraIssueTypes(userId?: string, projectId?: string): Promise<Array<{ id: string; name: string; description: string }>> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (projectId) params.set('projectId', projectId);
    const res = await fetch(`${API_BASE}/integrations/jira/issuetypes?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.issueTypes || [];
  },

  async testJiraConnection(userId?: string): Promise<{ success: boolean; message: string; instance: string }> {
    const res = await fetch(`${API_BASE}/integrations/jira/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId || 'default_user' }),
    });
    if (!res.ok) throw new Error('Jira connection test failed');
    return res.json();
  },

  // Trello API Adapters (Step 12)
  async getTrelloBoards(userId?: string): Promise<Array<{ id: string; name: string; desc?: string }>> {
    const url = userId ? `${API_BASE}/integrations/trello/boards?userId=${userId}` : `${API_BASE}/integrations/trello/boards`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.boards || [];
  },

  async getTrelloLists(boardId?: string, userId?: string): Promise<Array<{ id: string; name: string; idBoard: string }>> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (boardId) params.set('boardId', boardId);
    const res = await fetch(`${API_BASE}/integrations/trello/lists?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.lists || [];
  },

  async testTrelloConnection(userId?: string): Promise<{ success: boolean; message: string; user: string }> {
    const res = await fetch(`${API_BASE}/integrations/trello/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId || 'default_user' }),
    });
    if (!res.ok) throw new Error('Trello connection test failed');
    return res.json();
  },

  // OAuth Start Endpoints
  async getJiraAuthUrl(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/jira`);
    const data = await res.json();
    return data.authUrl || '';
  },

  async getTrelloAuthUrl(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/trello`);
    const data = await res.json();
    return data.authUrl || '';
  },
};

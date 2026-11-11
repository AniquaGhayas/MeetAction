/**
 * API Client for MeetAction Backend
 * Handles Authentication (Phase 1) and Meetings & Action Items (Phase 2)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface BackendActionItem {
  id: string;
  meetingId: string;
  description: string;
  assigneeRaw: string | null;
  assigneeResolvedId?: string | null;
  dueDate: string | null;
  sourceSnippet: string | null;
  status: 'pending' | 'approved' | 'excluded' | 'pushed';
  pushedTo: string | null;
  externalId: string | null;
  externalUrl: string | null;
  createdAt: string;
}

export interface BackendMeeting {
  id: string;
  userId: string;
  title: string;
  sourceType: 'text' | 'file' | 'audio';
  rawTranscript: string | null;
  audioFileUrl?: string | null;
  status: 'processing' | 'ready_for_review' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  actionItems?: BackendActionItem[];
  _count?: {
    actionItems: number;
  };
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || data.message || `Request failed (${response.status})`, response.status);
  }

  return data as T;
}

export const api = {
  // ==========================================
  // Auth (Phase 1)
  // ==========================================
  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // ==========================================
  // Meetings & Extraction (Phase 2)
  // ==========================================
  async createMeeting(params: {
    title?: string;
    transcript: string;
    sourceType?: 'text' | 'file';
  }): Promise<{ meetingId: string; status: string; title: string; message: string }> {
    return request<{ meetingId: string; status: string; title: string; message: string }>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: params.title,
        transcript: params.transcript,
        sourceType: params.sourceType || 'text',
      }),
    });
  },

  async getMeetings(): Promise<{ meetings: BackendMeeting[] }> {
    return request<{ meetings: BackendMeeting[] }>('/api/meetings');
  },

  async getMeeting(id: string): Promise<{ meeting: BackendMeeting }> {
    return request<{ meeting: BackendMeeting }>(`/api/meetings/${id}`);
  },

  async getMeetingItems(meetingId: string): Promise<{ meetingId: string; status: string; items: BackendActionItem[] }> {
    return request<{ meetingId: string; status: string; items: BackendActionItem[] }>(`/api/meetings/${meetingId}/items`);
  },

  async updateActionItem(
    meetingId: string,
    itemId: string,
    updates: Partial<{
      description: string;
      assigneeRaw: string | null;
      dueDate: string | null;
      status: 'pending' | 'approved' | 'excluded' | 'pushed';
      pushedTo: string | null;
    }>
  ): Promise<{ item: BackendActionItem }> {
    return request<{ item: BackendActionItem }>(`/api/meetings/${meetingId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async addManualActionItem(
    meetingId: string,
    item: {
      description: string;
      assigneeRaw?: string | null;
      dueDate?: string | null;
      sourceSnippet?: string;
    }
  ): Promise<{ item: BackendActionItem }> {
    return request<{ item: BackendActionItem }>(`/api/meetings/${meetingId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async deleteActionItem(meetingId: string, itemId: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/meetings/${meetingId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async reExtractMeeting(meetingId: string, transcript?: string): Promise<{ message: string; status: string }> {
    return request<{ message: string; status: string }>(`/api/meetings/${meetingId}/re-extract`, {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  },
};

export default api;


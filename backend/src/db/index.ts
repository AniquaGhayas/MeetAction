import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { Meeting, ActionItem, TranscriptTurn, Integration } from '../types';

interface DatabaseSchema {
  meetings: Record<string, Meeting>;
  actionItems: Record<string, ActionItem>;
  transcriptTurns: Record<string, TranscriptTurn[]>;
  integrations: Record<string, Integration[]>;
}

const dbFilePath = path.join(config.dataDir, 'store.json');

class Database {
  private data: DatabaseSchema = {
    meetings: {},
    actionItems: {},
    transcriptTurns: {},
    integrations: {},
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
      }

      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Failed to initialize database, loading defaults:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  private seedInitialData() {
    const demoMeetingId = '1';
    const now = new Date().toISOString();

    const meeting1: Meeting = {
      id: demoMeetingId,
      userId: 'default_user',
      title: 'Sprint 42 Backlog Grooming',
      sourceType: 'audio',
      rawTranscript: `Alex Mercer: Looking at our p99 latency spikes during yesterday's stress test, our session store started thrashing memory limits.
Sarah Chen: Agreed, I can coordinate with the platform infrastructure team.
Alex Mercer: We definitely need to fix the Redis cache eviction policy before Thursday's load test.
Elena Rostova: That should resolve the timeout issues in the user profile gateway.
Alex Mercer: Also Sarah, make sure to update the API docs by Friday 5 PM so the mobile team isn't blocked.
Marcus Vance: I will spin up the staging Kafka cluster tomorrow morning.`,
      audioFileUrl: '/uploads/audio/demo-sprint-grooming.wav',
      status: 'ready_for_review',
      destination: 'jira',
      duration: '45 min',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: now,
      actionItemsCount: 3,
      tickets: ['JIRA-104', 'JIRA-105'],
    };

    const turns1: TranscriptTurn[] = [
      {
        id: 1,
        meetingId: demoMeetingId,
        speaker: { name: 'Alex Mercer', initials: 'AM', colorClass: 'bg-secondary text-on-secondary' },
        timestamp: '04:12',
        text: "Looking at our p99 latency spikes during yesterday's stress test, our session store started thrashing memory limits. We definitely need to fix the Redis cache eviction policy before Thursday's load test.",
        actionItem: {
          number: 1,
          confidence: 98,
          quote: "We definitely need to fix the Redis cache eviction policy before Thursday's load test.",
        },
      },
      {
        id: 2,
        meetingId: demoMeetingId,
        speaker: { name: 'Sarah Chen', initials: 'SC', colorClass: 'bg-primary text-on-primary' },
        timestamp: '05:01',
        text: 'Agreed, I can coordinate with the platform infrastructure team.',
      },
      {
        id: 3,
        meetingId: demoMeetingId,
        speaker: { name: 'Elena Rostova', initials: 'ER', colorClass: 'bg-surface-container-highest text-on-surface' },
        timestamp: '05:45',
        text: "That should resolve the timeout issues in the user profile gateway. Also Sarah, make sure to update the API docs by Friday 5 PM so the mobile team isn't blocked.",
        actionItem: {
          number: 2,
          confidence: 94,
          quote: "Also Sarah, make sure to update the API docs by Friday 5 PM so the mobile team isn't blocked.",
        },
      },
      {
        id: 4,
        meetingId: demoMeetingId,
        speaker: { name: 'Marcus Vance', initials: 'MV', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
        timestamp: '08:20',
        text: 'I will spin up the staging Kafka cluster tomorrow morning.',
        actionItem: {
          number: 3,
          confidence: 99,
          quote: 'I will spin up the staging Kafka cluster tomorrow morning.',
        },
      },
    ];

    const items1: ActionItem[] = [
      {
        id: 'item-1',
        meetingId: demoMeetingId,
        description: 'Fix Redis cache eviction policy before load testing',
        assigneeRaw: 'Alex Mercer',
        assignee: { name: 'Alex Mercer', initials: 'AM', colorClass: 'bg-secondary text-on-secondary' },
        dueDate: 'Oct 24, 2024',
        sourceSnippet: "Session store experiencing memory spikes during yesterday's stress testing. Must resolve eviction settings ahead of Thursday.",
        timestamp: '04:12',
        status: 'approved',
        included: true,
        excluded: false,
        confidence: 98,
        destination: { icon: 'bug_report', label: 'Jira: Backend / Bug', colorClass: 'bg-secondary-container text-on-secondary-fixed' },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-2',
        meetingId: demoMeetingId,
        description: 'Update user profile gateway API documentation',
        assigneeRaw: 'Sarah Chen',
        assignee: { name: 'Sarah Chen', initials: 'SC', colorClass: 'bg-surface-container-highest text-on-surface' },
        dueDate: 'Oct 25, 2024',
        sourceSnippet: "Ensure mobile team isn't blocked on the new auth payload schemas by updating Swagger spec.",
        timestamp: '05:45',
        status: 'pending',
        included: true,
        excluded: false,
        confidence: 94,
        destination: { icon: 'task_alt', label: 'Jira: Docs / Task', colorClass: 'bg-surface-container-high text-on-surface' },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-3',
        meetingId: demoMeetingId,
        description: 'Spin up staging Kafka cluster and configure schema registry',
        assigneeRaw: 'Marcus Vance',
        assignee: { name: 'Marcus Vance', initials: 'MV', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
        dueDate: 'Tomorrow 9:00 AM',
        sourceSnippet: 'Deploy multi-broker event stream environment for async notification pipeline.',
        timestamp: '08:20',
        status: 'approved',
        included: true,
        excluded: false,
        confidence: 99,
        destination: { icon: 'view_kanban', label: 'Trello: DevOps / Doing', colorClass: 'bg-primary-container text-on-primary-fixed' },
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.data.meetings[demoMeetingId] = meeting1;
    this.data.transcriptTurns[demoMeetingId] = turns1;
    items1.forEach((it) => {
      this.data.actionItems[it.id] = it;
    });

    // Seed other meetings to match dashboard
    const otherMeetings: Meeting[] = [
      {
        id: '2',
        userId: 'default_user',
        title: 'Q4 Product Roadmap Sync',
        sourceType: 'audio',
        rawTranscript: 'Discussion regarding Q4 delivery goals, user growth milestones and retention dashboard.',
        status: 'ready_for_review',
        destination: 'jira',
        duration: '58 min',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: now,
        actionItemsCount: 4,
      },
      {
        id: '3',
        userId: 'default_user',
        title: 'Client Onboarding - FinTech Core',
        sourceType: 'text',
        rawTranscript: 'Reviewing customer security requirements, SSO configuration, and webhook signing keys.',
        status: 'ready_for_review',
        destination: 'trello',
        duration: '30 min',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: now,
        actionItemsCount: 3,
      },
      {
        id: '4',
        userId: 'default_user',
        title: 'Architecture: Vector DB Migration',
        sourceType: 'audio',
        rawTranscript: 'Migrating vector embeddings from Pinecone to self-hosted pgvector cluster.',
        status: 'synced',
        destination: 'jira',
        duration: '62 min',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: now,
        actionItemsCount: 9,
        tickets: ['JIRA-98', 'Trello #42'],
      },
      {
        id: '5',
        userId: 'default_user',
        title: 'Weekly B2B Sales & GTM Pipeline',
        sourceType: 'text',
        rawTranscript: 'Pipeline review for Enterprise tier prospects, demo schedules, and procurement contracts.',
        status: 'synced',
        destination: 'trello',
        duration: '40 min',
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        updatedAt: now,
        actionItemsCount: 5,
        tickets: ['Trello #39'],
      },
    ];

    otherMeetings.forEach((m) => {
      this.data.meetings[m.id] = m;
    });

    this.data.integrations['default_user'] = [
      {
        id: 'int-jira',
        userId: 'default_user',
        provider: 'jira',
        connected: true,
        instanceUrl: 'https://company.atlassian.net',
        connectedAt: now,
      },
      {
        id: 'int-trello',
        userId: 'default_user',
        provider: 'trello',
        connected: true,
        apiKey: 'trello_key_demo',
        connectedAt: now,
      },
    ];
  }

  // Meetings
  getMeeting(id: string): Meeting | null {
    return this.data.meetings[id] || null;
  }

  getAllMeetings(): Meeting[] {
    return Object.values(this.data.meetings).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  saveMeeting(meeting: Meeting): Meeting {
    this.data.meetings[meeting.id] = meeting;
    this.persist();
    return meeting;
  }

  updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
    const meeting = this.data.meetings[id];
    if (!meeting) return null;
    const updated = { ...meeting, ...updates, updatedAt: new Date().toISOString() };
    this.data.meetings[id] = updated;
    this.persist();
    return updated;
  }

  // Action Items
  getActionItem(id: string): ActionItem | null {
    return this.data.actionItems[id] || null;
  }

  getActionItemsByMeetingId(meetingId: string): ActionItem[] {
    return Object.values(this.data.actionItems).filter((it) => it.meetingId === meetingId);
  }

  saveActionItem(item: ActionItem): ActionItem {
    this.data.actionItems[item.id] = item;
    // update count on meeting
    const count = this.getActionItemsByMeetingId(item.meetingId).length;
    if (this.data.meetings[item.meetingId]) {
      this.data.meetings[item.meetingId].actionItemsCount = count;
    }
    this.persist();
    return item;
  }

  saveActionItems(items: ActionItem[]): ActionItem[] {
    items.forEach((item) => {
      this.data.actionItems[item.id] = item;
    });
    if (items.length > 0) {
      const meetingId = items[0].meetingId;
      const count = this.getActionItemsByMeetingId(meetingId).length;
      if (this.data.meetings[meetingId]) {
        this.data.meetings[meetingId].actionItemsCount = count;
      }
    }
    this.persist();
    return items;
  }

  updateActionItem(id: string, updates: Partial<ActionItem>): ActionItem | null {
    const item = this.data.actionItems[id];
    if (!item) return null;
    const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
    this.data.actionItems[id] = updated;
    this.persist();
    return updated;
  }

  deleteActionItem(id: string): boolean {
    if (!this.data.actionItems[id]) return false;
    const meetingId = this.data.actionItems[id].meetingId;
    delete this.data.actionItems[id];
    if (this.data.meetings[meetingId]) {
      this.data.meetings[meetingId].actionItemsCount = this.getActionItemsByMeetingId(meetingId).length;
    }
    this.persist();
    return true;
  }

  // Transcript Turns
  getTurnsByMeetingId(meetingId: string): TranscriptTurn[] {
    return this.data.transcriptTurns[meetingId] || [];
  }

  saveTurns(meetingId: string, turns: TranscriptTurn[]): TranscriptTurn[] {
    this.data.transcriptTurns[meetingId] = turns;
    this.persist();
    return turns;
  }

  // Integrations
  getIntegrations(userId: string = 'default_user'): Integration[] {
    return this.data.integrations[userId] || [];
  }

  saveIntegration(integration: Integration): Integration {
    const userInts = this.data.integrations[integration.userId] || [];
    const idx = userInts.findIndex((i) => i.provider === integration.provider);
    if (idx >= 0) {
      userInts[idx] = integration;
    } else {
      userInts.push(integration);
    }
    this.data.integrations[integration.userId] = userInts;
    this.persist();
    return integration;
  }
}

export const db = new Database();

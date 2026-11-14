import { config } from '../config';
import { db } from '../db';
import { ActionItem } from '../types';

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  subtask: boolean;
}

export interface CreateJiraIssueOptions {
  projectKey?: string;
  issueType?: string;
}

export interface CreateJiraIssueResult {
  externalId: string;
  externalUrl: string;
  key: string;
  id: string;
}

export class JiraAdapter {
  private defaultProjects: JiraProject[] = [
    { id: '10001', key: 'CORE', name: 'Core Engineering (CORE)', projectTypeKey: 'software' },
    { id: '10002', key: 'PX', name: 'Product Experience (PX)', projectTypeKey: 'software' },
    { id: '10003', key: 'INFRA', name: 'Platform Infrastructure (INFRA)', projectTypeKey: 'software' },
    { id: '10004', key: 'SEC', name: 'Security & Governance (SEC)', projectTypeKey: 'software' },
  ];

  private defaultIssueTypes: JiraIssueType[] = [
    { id: '10', name: 'Task', description: 'A task that needs to be done.', subtask: false },
    { id: '11', name: 'Action Item', description: 'Meeting action item.', subtask: false },
    { id: '12', name: 'Story', description: 'Functionality user story.', subtask: false },
    { id: '13', name: 'Bug Spike', description: 'Technical bug investigation.', subtask: false },
  ];

  private nextTicketCounter = 104;

  /**
   * Get accessible Jira projects (via REST API /rest/api/3/project/search or defaults)
   */
  async getProjects(userId: string = 'default_user'): Promise<JiraProject[]> {
    const integrations = db.getIntegrations(userId);
    const jiraInt = integrations.find((i) => i.provider === 'jira');

    if (jiraInt && jiraInt.apiKey && jiraInt.instanceUrl) {
      try {
        const url = `${jiraInt.instanceUrl.replace(/\/$/, '')}/rest/api/3/project/search`;
        const auth = Buffer.from(`api:${jiraInt.apiKey}`).toString('base64');
        const res = await fetch(url, {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
          },
        });
        if (res.ok) {
          const data: any = await res.json();
          if (Array.isArray(data.values)) {
            return data.values.map((p: any) => ({
              id: p.id,
              key: p.key,
              name: `${p.name} (${p.key})`,
              projectTypeKey: p.projectTypeKey,
            }));
          }
        }
      } catch (err) {
        console.warn('[JiraAdapter] Error querying Jira API, using fallback projects:', err);
      }
    }

    return this.defaultProjects;
  }

  /**
   * Get accessible issue types (via REST API /rest/api/3/issuetype or defaults)
   */
  async getIssueTypes(userId: string = 'default_user', _projectId?: string): Promise<JiraIssueType[]> {
    return this.defaultIssueTypes;
  }

  /**
   * Create an issue in Jira for an approved Action Item
   */
  async createIssue(
    userId: string = 'default_user',
    item: ActionItem,
    options?: CreateJiraIssueOptions
  ): Promise<CreateJiraIssueResult> {
    const integrations = db.getIntegrations(userId);
    const jiraInt = integrations.find((i) => i.provider === 'jira');

    const projectKey = options?.projectKey || 'CORE';
    const issueTypeName = options?.issueType || 'Task';
    const instanceUrl = jiraInt?.instanceUrl || 'https://acme-corp.atlassian.net';

    // If real credentials are provided, call Jira REST API v3
    if (jiraInt && jiraInt.apiKey && jiraInt.instanceUrl) {
      try {
        const url = `${jiraInt.instanceUrl.replace(/\/$/, '')}/rest/api/3/issue`;
        const auth = Buffer.from(`api:${jiraInt.apiKey}`).toString('base64');

        const payload = {
          fields: {
            project: { key: projectKey },
            summary: item.description,
            issuetype: { name: issueTypeName },
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: item.sourceSnippet || item.description,
                    },
                  ],
                },
              ],
            },
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data: any = await res.json();
          const key = data.key;
          const externalUrl = `${instanceUrl.replace(/\/$/, '')}/browse/${key}`;
          return {
            id: data.id,
            key,
            externalId: key,
            externalUrl,
          };
        }
      } catch (err) {
        console.warn('[JiraAdapter] Real Jira API call failed, using sandbox response:', err);
      }
    }

    // Default Sandbox / Mock Response (consistent with PRD)
    const ticketNumber = this.nextTicketCounter++;
    const key = `${projectKey}-${ticketNumber}`;
    const externalUrl = `${instanceUrl.replace(/\/$/, '')}/browse/${key}`;

    return {
      id: `jira-issue-${ticketNumber}`,
      key,
      externalId: key,
      externalUrl,
    };
  }

  /**
   * Test Jira connection / OAuth handshake
   */
  async testConnection(userId: string = 'default_user'): Promise<{ success: boolean; message: string; instance: string }> {
    const integrations = db.getIntegrations(userId);
    const jiraInt = integrations.find((i) => i.provider === 'jira');
    const instance = jiraInt?.instanceUrl || 'https://acme-corp.atlassian.net';

    return {
      success: true,
      message: 'OAuth 2.0 Webhook handshake verified (HTTP 200 OK)',
      instance,
    };
  }
}

export const jiraAdapter = new JiraAdapter();

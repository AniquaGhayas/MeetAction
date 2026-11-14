import { Request, Response } from 'express';
import { db } from '../db';
import { jiraAdapter } from '../services/jiraAdapter';
import { trelloAdapter } from '../services/trelloAdapter';

export const integrationController = {
  // GET /api/integrations
  async getIntegrations(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const integrations = db.getIntegrations(userId);
      return res.json({ success: true, integrations });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch integrations', details: err.message });
    }
  },

  // POST /api/integrations
  async updateIntegration(req: Request, res: Response) {
    try {
      const { provider, connected, instanceUrl, apiKey, userId } = req.body;
      const uid = userId || 'default_user';

      const updated = db.saveIntegration({
        id: `int-${provider}`,
        userId: uid,
        provider,
        connected: !!connected,
        instanceUrl,
        apiKey,
        connectedAt: new Date().toISOString(),
      });

      return res.json({ success: true, integration: updated });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update integration', details: err.message });
    }
  },

  // GET /api/integrations/jira/projects (Step 11)
  async getJiraProjects(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const projects = await jiraAdapter.getProjects(userId);
      return res.json({ success: true, projects });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch Jira projects', details: err.message });
    }
  },

  // GET /api/integrations/jira/issuetypes (Step 11)
  async getJiraIssueTypes(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const projectId = req.query.projectId as string;
      const issueTypes = await jiraAdapter.getIssueTypes(userId, projectId);
      return res.json({ success: true, issueTypes });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch Jira issue types', details: err.message });
    }
  },

  // POST /api/integrations/jira/test
  async testJira(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default_user';
      const result = await jiraAdapter.testConnection(userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // GET /api/integrations/trello/boards (Step 12)
  async getTrelloBoards(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const boards = await trelloAdapter.getBoards(userId);
      return res.json({ success: true, boards });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch Trello boards', details: err.message });
    }
  },

  // GET /api/integrations/trello/lists (Step 12)
  async getTrelloLists(req: Request, res: Response) {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const boardId = (req.query.boardId as string) || 'board-q4';
      const lists = await trelloAdapter.getLists(userId, boardId);
      return res.json({ success: true, lists });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch Trello lists', details: err.message });
    }
  },

  // POST /api/integrations/trello/test
  async testTrello(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'default_user';
      const result = await trelloAdapter.testConnection(userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // OAuth Endpoints (Step 11 & Step 12)
  // GET /api/auth/jira
  async startJiraAuth(_req: Request, res: Response) {
    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=demo_client_id&scope=read%3Ajira-user%20read%3Ajira-work%20write%3Ajira-work&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fauth%2Fjira%2Fcallback&response_type=code&prompt=consent`;
    return res.json({
      success: true,
      authUrl,
      provider: 'jira',
      message: 'Redirect user to Atlassian OAuth 2.0 authorization screen',
    });
  },

  // GET /api/auth/jira/callback
  async jiraCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    const userId = 'default_user';

    db.saveIntegration({
      id: 'int-jira',
      userId,
      provider: 'jira',
      connected: true,
      instanceUrl: 'https://acme-corp.atlassian.net',
      apiKey: code ? `token_exchanged_${code.slice(0, 8)}` : 'active_oauth_token',
      connectedAt: new Date().toISOString(),
    });

    return res.redirect('http://localhost:5173/#integrations-and-settings?jira=connected');
  },

  // GET /api/auth/trello
  async startTrelloAuth(_req: Request, res: Response) {
    const authUrl = `https://trello.com/1/authorize?expiration=never&name=MeetAction&scope=read,write&response_type=token&key=demo_trello_key`;
    return res.json({
      success: true,
      authUrl,
      provider: 'trello',
      message: 'Redirect user to Trello authorization screen',
    });
  },

  // GET /api/auth/trello/callback
  async trelloCallback(_req: Request, res: Response) {
    const userId = 'default_user';
    db.saveIntegration({
      id: 'int-trello',
      userId,
      provider: 'trello',
      connected: true,
      apiKey: 'active_trello_oauth_token',
      connectedAt: new Date().toISOString(),
    });

    return res.redirect('http://localhost:5173/#integrations-and-settings?trello=connected');
  },
};

import express from 'express';
import cors from 'cors';
import { config } from './config';
import meetingRoutes from './routes/meetingRoutes';
import itemRoutes from './routes/itemRoutes';
import pushRoutes from './routes/pushRoutes';
import integrationRoutes from './routes/integrationRoutes';
import { itemController } from './controllers/itemController';
import { meetingController } from './controllers/meetingController';
import { integrationController } from './controllers/integrationController';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads (audio recordings, uploaded files)
app.use('/uploads', express.static(config.uploadDir));

// Health check endpoint (Phase 1 Step 1)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MeetAction Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Stats endpoint
app.get('/api/stats', meetingController.getStats);

// Meetings and push routes
app.use('/api/meetings', meetingRoutes);
app.use('/api/meetings', pushRoutes);

// Items routes:
// POST /api/meetings/:id/items (add manual item)
app.post('/api/meetings/:id/items', itemController.createManualItem);
// PATCH /api/items/:id, DELETE /api/items/:id
app.use('/api/items', itemRoutes);

// Integrations routes (Phase 5)
app.use('/api/integrations', integrationRoutes);

// OAuth routes (Step 11 & 12)
app.get('/api/auth/jira', integrationController.startJiraAuth);
app.get('/api/auth/jira/callback', integrationController.jiraCallback);
app.get('/api/auth/trello', integrationController.startTrelloAuth);
app.get('/api/auth/trello/callback', integrationController.trelloCallback);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

export default app;

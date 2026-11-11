import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import meetingRoutes from './routes/meetingRoutes';
import { enqueueProcessingJob } from './queues/processingQueue';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Health check route (Phase 1 Step 1 requirement)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'MeetAction Backend API',
    nodeEnv: config.nodeEnv,
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'MeetAction Backend API',
  });
});

// 2. Authentication routes (Phase 1 Step 4 requirement)
app.use('/api/auth', authRoutes);

// 3. Meeting & Action Items routes (Phase 2 Step 5 & 7 requirement)
app.use('/api/meetings', meetingRoutes);

// 3. Queue verification test route (Phase 1 Step 3 requirement)
app.post('/api/test/queue', async (req: Request, res: Response) => {
  try {
    const job = await enqueueProcessingJob({
      meetingId: req.body.meetingId || `test-${Date.now()}`,
      sourceType: req.body.sourceType || 'text',
      transcriptText: req.body.content || req.body.transcript || 'Test transcript payload for queue verification',
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: 'Job enqueued successfully',
      jobId: job.id,
      jobName: job.name,
    });
  } catch (error: any) {
    console.error('Queue test error:', error);
    res.status(500).json({ error: 'Failed to enqueue test job', details: error.message });
  }
});

// Global 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start Express server
const server = app.listen(config.port, () => {
  console.log(`🚀 MeetAction API running at http://localhost:${config.port}`);
  console.log(`📡 Health check available at http://localhost:${config.port}/health`);
});

export default app;


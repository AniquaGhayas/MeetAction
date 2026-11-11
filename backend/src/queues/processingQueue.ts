import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import prisma from '../db/prisma';
import { extractActionItemsFromTranscript } from '../services/llmExtraction';

// Upstash Redis connection options
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: config.redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
};

export const redisConnection = new IORedis(config.redisUrl, redisOptions);

redisConnection.on('connect', () => {
  console.log('✅ Connected to Upstash Redis for BullMQ');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export const QUEUE_NAME = 'meeting-processing';

// Processing Queue
export const processingQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});

export interface ProcessingJobData {
  meetingId: string;
  sourceType: 'text' | 'file' | 'audio';
  transcriptText?: string;
  audioFileUrl?: string;
  timestamp: string;
}

// Processing Worker (Phase 2: Extracts action items via LLM & updates DB)
export const processingWorker = new Worker<ProcessingJobData>(
  QUEUE_NAME,
  async (job: Job<ProcessingJobData>) => {
    const { meetingId, sourceType } = job.data;
    console.log(`📥 [Worker] Starting job ${job.id} for meeting ${meetingId} (source: ${sourceType})`);

    try {
      await job.updateProgress(10);

      // 1. Fetch meeting record
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting) {
        throw new Error(`Meeting not found for ID: ${meetingId}`);
      }

      const transcript = meeting.rawTranscript || job.data.transcriptText || '';
      if (!transcript.trim()) {
        console.log(`ℹ️ [Worker] Meeting ${meetingId} has empty transcript`);
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'ready_for_review' },
        });
        await job.updateProgress(100);
        return { success: true, count: 0 };
      }

      await job.updateProgress(30);

      // 2. Call LLM extraction adapter
      console.log(`🤖 [Worker] Calling LLM extraction for meeting ${meetingId}...`);
      const extractedItems = await extractActionItemsFromTranscript(transcript);
      console.log(`✨ [Worker] Extracted ${extractedItems.length} action items`);

      await job.updateProgress(70);

      // 3. Save extracted action items to Supabase in a transaction
      await prisma.$transaction(async (tx) => {
        // Clear any old items if re-extracting
        await tx.actionItem.deleteMany({
          where: { meetingId },
        });

        // Insert new items
        for (const item of extractedItems) {
          let parsedDueDate: Date | null = null;
          if (item.due_date) {
            const d = new Date(item.due_date);
            if (!isNaN(d.getTime())) {
              parsedDueDate = d;
            }
          }

          await tx.actionItem.create({
            data: {
              meetingId,
              description: item.description,
              assigneeRaw: item.assignee || null,
              dueDate: parsedDueDate,
              sourceSnippet: item.source_snippet,
              status: 'pending',
            },
          });
        }

        // Set Meeting status to ready_for_review
        await tx.meeting.update({
          where: { id: meetingId },
          data: { status: 'ready_for_review' },
        });
      });

      await job.updateProgress(100);
      console.log(`✅ [Worker] Meeting ${meetingId} status updated to 'ready_for_review'`);

      return {
        success: true,
        extractedCount: extractedItems.length,
      };
    } catch (error: any) {
      console.error(`💥 [Worker] Processing failed for meeting ${meetingId}:`, error.message);

      // Mark meeting as failed so the frontend does not hang
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'failed' },
      }).catch((dbErr) => console.error('Failed to update meeting status to failed:', dbErr.message));

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

processingWorker.on('completed', (job: Job) => {
  console.log(`🎉 [Worker] Job ${job.id} finished successfully!`);
});

processingWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`💥 [Worker] Job ${job?.id} failed with error:`, err.message);
});

/**
 * Helper to enqueue a processing job for a meeting
 */
export async function enqueueProcessingJob(data: ProcessingJobData) {
  return processingQueue.add('process-meeting', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

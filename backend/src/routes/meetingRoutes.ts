import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import prisma from '../db/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { enqueueProcessingJob } from '../queues/processingQueue';

const router = Router();

// In-memory multer storage for uploaded transcript files (.txt, .docx, .pdf)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// All meeting routes require authentication
router.use(authenticateToken);

// Validation schema for text transcript submission
const createMeetingSchema = z.object({
  title: z.string().optional(),
  transcript: z.string().min(5, 'Transcript text must be at least 5 characters long'),
  sourceType: z.enum(['text', 'file', 'audio']).default('text'),
});

/**
 * POST /api/meetings
 * Step 5: Accepts pasted text or uploaded file, creates Meeting (status: processing),
 * enqueues extraction job, and returns meeting.id immediately.
 */
router.post(
  '/',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      let rawTranscript = '';
      let title = req.body.title;
      let sourceType: 'text' | 'file' | 'audio' = req.body.sourceType || 'text';

      // Check if file was uploaded
      if (req.file) {
        sourceType = 'file';
        if (!title) {
          title = req.file.originalname.replace(/\.[^/.]+$/, '');
        }

        const mime = req.file.mimetype;
        if (mime.includes('text') || req.file.originalname.endsWith('.txt')) {
          rawTranscript = req.file.buffer.toString('utf-8');
        } else {
          // For binary formats (.pdf, .docx), simple text extraction or fallback
          rawTranscript = req.file.buffer.toString('utf-8');
        }
      } else {
        // Handle JSON body
        const parsed = createMeetingSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: parsed.error.errors[0].message });
          return;
        }
        rawTranscript = parsed.data.transcript;
        if (!title) {
          title = parsed.data.title;
        }
      }

      if (!rawTranscript.trim()) {
        res.status(400).json({ error: 'Transcript content is required' });
        return;
      }

      const defaultTitle = title || `Meeting - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

      // 1. Create Meeting row with status: "processing"
      const meeting = await prisma.meeting.create({
        data: {
          userId,
          title: defaultTitle,
          sourceType,
          rawTranscript,
          status: 'processing',
        },
      });

      // 2. Enqueue extraction job in BullMQ
      await enqueueProcessingJob({
        meetingId: meeting.id,
        sourceType,
        transcriptText: rawTranscript,
        timestamp: new Date().toISOString(),
      });

      // 3. Return meeting ID immediately
      res.status(201).json({
        meetingId: meeting.id,
        status: meeting.status,
        title: meeting.title,
        message: 'Meeting created and extraction job enqueued successfully',
      });
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ error: 'Failed to process meeting input', details: error.message });
    }
  }
);

/**
 * GET /api/meetings
 * Lists past meetings for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const meetings = await prisma.meeting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { actionItems: true },
        },
      },
    });

    res.json({ meetings });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

/**
 * GET /api/meetings/:id
 * Step 7: Returns meeting metadata and current status
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
      include: {
        actionItems: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    res.json({ meeting });
  } catch (error: any) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

/**
 * GET /api/meetings/:id/items
 * Step 7: Returns extracted action items for a meeting
 */
router.get('/:id/items', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Verify ownership
    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
      select: { id: true, status: true },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const items = await prisma.actionItem.findMany({
      where: { meetingId: id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      meetingId: id,
      status: meeting.status,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching action items:', error);
    res.status(500).json({ error: 'Failed to fetch action items' });
  }
});

/**
 * PATCH /api/meetings/:id/items/:itemId
 * Update an action item (e.g., change status, edit text, reassign, adjust date)
 */
router.patch('/:id/items/:itemId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id, itemId } = req.params;

    // Verify ownership
    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const { description, assigneeRaw, dueDate, status, pushedTo } = req.body;

    const updated = await prisma.actionItem.update({
      where: { id: itemId },
      data: {
        ...(description !== undefined && { description }),
        ...(assigneeRaw !== undefined && { assigneeRaw }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status }),
        ...(pushedTo !== undefined && { pushedTo }),
      },
    });

    res.json({ item: updated });
  } catch (error: any) {
    console.error('Error updating action item:', error);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

/**
 * POST /api/meetings/:id/items
 * Manually add an action item missed by the AI (PRD FR12)
 */
router.post('/:id/items', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const { description, assigneeRaw, dueDate, sourceSnippet } = req.body;
    if (!description) {
      res.status(400).json({ error: 'Description is required' });
      return;
    }

    const item = await prisma.actionItem.create({
      data: {
        meetingId: id,
        description,
        assigneeRaw: assigneeRaw || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        sourceSnippet: sourceSnippet || 'Manually added by user',
        status: 'approved',
      },
    });

    res.status(201).json({ item });
  } catch (error: any) {
    console.error('Error adding manual action item:', error);
    res.status(500).json({ error: 'Failed to add action item' });
  }
});

/**
 * DELETE /api/meetings/:id/items/:itemId
 * Delete an action item (PRD FR13)
 */
router.delete('/:id/items/:itemId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id, itemId } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    await prisma.actionItem.delete({
      where: { id: itemId },
    });

    res.json({ message: 'Action item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting action item:', error);
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

/**
 * POST /api/meetings/:id/re-extract
 * Re-runs LLM extraction on updated transcript (PRD FR10)
 */
router.post('/:id/re-extract', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { transcript } = req.body;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const updatedTranscript = transcript || meeting.rawTranscript || '';

    // Update meeting status back to processing
    await prisma.meeting.update({
      where: { id },
      data: {
        rawTranscript: updatedTranscript,
        status: 'processing',
      },
    });

    // Enqueue new extraction job
    await enqueueProcessingJob({
      meetingId: id,
      sourceType: meeting.sourceType as any,
      transcriptText: updatedTranscript,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Re-extraction initiated', status: 'processing' });
  } catch (error: any) {
    console.error('Error re-extracting meeting:', error);
    res.status(500).json({ error: 'Failed to re-extract meeting' });
  }
});

export default router;


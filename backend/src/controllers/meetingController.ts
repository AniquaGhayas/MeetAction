import { Request, Response } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { processingQueue } from '../queues/processingQueue';
import { getAudioFileUrl } from '../services/storage';
import { Meeting, SourceType } from '../types';

export const meetingController = {
  // POST /api/meetings
  async createMeeting(req: Request, res: Response) {
    try {
      const title = req.body.title || 'Untitled Meeting';
      const destination = req.body.destination || 'jira';
      const file = req.file;

      let sourceType: SourceType = 'text';
      let audioFileUrl: string | undefined = undefined;
      let rawTranscript = req.body.transcript || '';

      if (file) {
        const isAudio =
          file.mimetype.startsWith('audio/') ||
          file.mimetype.startsWith('video/') ||
          file.originalname.match(/\.(mp3|wav|m4a|webm|ogg|flac|aac)$/i);

        if (isAudio) {
          sourceType = 'audio';
          audioFileUrl = getAudioFileUrl(file.filename);
        } else {
          sourceType = 'file';
          try {
            rawTranscript = fs.readFileSync(file.path, 'utf-8');
          } catch (e) {
            console.warn('Could not read uploaded text file directly:', e);
          }
        }
      }

      const meetingId = uuidv4();
      const now = new Date().toISOString();

      const newMeeting: Meeting = {
        id: meetingId,
        userId: 'default_user',
        title: title.trim(),
        sourceType,
        rawTranscript,
        audioFileUrl,
        status: 'queued',
        destination,
        duration: sourceType === 'audio' ? '12 min' : '25 min',
        createdAt: now,
        updatedAt: now,
        actionItemsCount: 0,
      };

      db.saveMeeting(newMeeting);

      // Start asynchronous pipeline in background
      processingQueue.enqueue({ meetingId });

      return res.status(201).json({
        success: true,
        meeting: newMeeting,
      });
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      return res.status(500).json({ error: 'Failed to create meeting', details: err.message });
    }
  },

  // GET /api/meetings
  async getAllMeetings(_req: Request, res: Response) {
    try {
      const meetings = db.getAllMeetings();
      return res.json({ success: true, meetings });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch meetings', details: err.message });
    }
  },

  // GET /api/meetings/:id
  async getMeetingById(req: Request, res: Response) {
    try {
      const meetingId = String(req.params.id);
      const meeting = db.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const turns = db.getTurnsByMeetingId(meetingId);
      const items = db.getActionItemsByMeetingId(meetingId);

      return res.json({
        success: true,
        meeting,
        turns,
        items,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch meeting', details: err.message });
    }
  },

  // GET /api/meetings/:id/items
  async getMeetingItems(req: Request, res: Response) {
    try {
      const meetingId = String(req.params.id);
      const items = db.getActionItemsByMeetingId(meetingId);
      return res.json({ success: true, items });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch items', details: err.message });
    }
  },

  // GET /api/stats
  async getStats(_req: Request, res: Response) {
    try {
      const meetings = db.getAllMeetings();
      let totalItems = 0;
      let totalTickets = 0;

      meetings.forEach((m) => {
        totalItems += m.actionItemsCount || 0;
        if (m.tickets) {
          totalTickets += m.tickets.length;
        }
      });

      return res.json({
        success: true,
        stats: {
          totalMeetings: meetings.length,
          totalActionItems: totalItems,
          totalTicketsCreated: totalTickets,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
  },
};

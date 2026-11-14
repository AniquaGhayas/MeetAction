import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { ActionItem } from '../types';

export const itemController = {
  // PATCH /api/items/:id
  async updateItem(req: Request, res: Response) {
    try {
      const itemId = String(req.params.id);
      const updates = req.body;

      const existing = db.getActionItem(itemId);
      if (!existing) {
        return res.status(404).json({ error: 'Action item not found' });
      }

      const updated = db.updateActionItem(itemId, updates);
      return res.json({ success: true, item: updated });
    } catch (err: any) {
      console.error('Error updating item:', err);
      return res.status(500).json({ error: 'Failed to update item', details: err.message });
    }
  },

  // POST /api/meetings/:id/items
  async createManualItem(req: Request, res: Response) {
    try {
      const meetingId = String(req.params.id);
      const meeting = db.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const { description, assigneeName, dueDate, destination } = req.body;
      const name = assigneeName || 'Current User';
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const now = new Date().toISOString();
      const newItem: ActionItem = {
        id: `item-${uuidv4().slice(0, 8)}`,
        meetingId,
        description: description || 'New manual action item',
        assigneeRaw: name,
        assignee: {
          name,
          initials,
          colorClass: 'bg-primary text-on-primary',
        },
        dueDate: dueDate || 'Next Sprint',
        sourceSnippet: 'Added manually during review session',
        status: 'approved',
        included: true,
        excluded: false,
        confidence: 100,
        destination: destination || {
          icon: 'task_alt',
          label: 'Jira: Core / Task',
          colorClass: 'bg-surface-container-high text-on-surface',
        },
        createdAt: now,
        updatedAt: now,
      };

      db.saveActionItem(newItem);
      return res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      console.error('Error adding item:', err);
      return res.status(500).json({ error: 'Failed to add item', details: err.message });
    }
  },

  // DELETE /api/items/:id
  async deleteItem(req: Request, res: Response) {
    try {
      const itemId = String(req.params.id);
      const success = db.deleteActionItem(itemId);
      if (!success) {
        return res.status(404).json({ error: 'Item not found' });
      }
      return res.json({ success: true, message: 'Item deleted' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete item', details: err.message });
    }
  },
};

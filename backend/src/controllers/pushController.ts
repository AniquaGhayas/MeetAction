import { Request, Response } from 'express';
import { db } from '../db';
import { jiraAdapter } from '../services/jiraAdapter';
import { trelloAdapter } from '../services/trelloAdapter';

export const pushController = {
  // POST /api/meetings/:id/push
  async pushItems(req: Request, res: Response) {
    try {
      const meetingId = String(req.params.id);
      const meeting = db.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }

      const {
        targetProject,
        targetIssueType,
        targetBoard,
        targetList,
        itemIds,
      } = req.body || {};

      const allItems = db.getActionItemsByMeetingId(meetingId);
      let itemsToPush = allItems.filter((it) => it.included && !it.excluded);

      if (Array.isArray(itemIds) && itemIds.length > 0) {
        itemsToPush = allItems.filter((it) => itemIds.includes(it.id));
      }

      if (itemsToPush.length === 0) {
        return res.status(400).json({ error: 'No items selected to push' });
      }

      const results = [];
      const pushedTickets: string[] = [];

      for (const item of itemsToPush) {
        const destLabel = (item.destination?.label || '').toLowerCase();
        const globalDest = (meeting.destination || '').toLowerCase();
        const isTrello = destLabel.includes('trello') || (!destLabel.includes('jira') && globalDest === 'trello');

        try {
          if (isTrello) {
            const cardResult = await trelloAdapter.createCard(meeting.userId, item, {
              boardId: targetBoard,
              listId: targetList,
            });

            db.updateActionItem(item.id, {
              status: 'pushed',
              pushedTo: 'trello',
              externalId: cardResult.externalId,
              externalUrl: cardResult.externalUrl,
            });

            pushedTickets.push(cardResult.externalId);

            results.push({
              itemId: item.id,
              description: item.description,
              destination: 'Trello',
              externalId: cardResult.externalId,
              externalUrl: cardResult.externalUrl,
              status: 'success',
            });
          } else {
            const issueResult = await jiraAdapter.createIssue(meeting.userId, item, {
              projectKey: targetProject,
              issueType: targetIssueType,
            });

            db.updateActionItem(item.id, {
              status: 'pushed',
              pushedTo: 'jira',
              externalId: issueResult.externalId,
              externalUrl: issueResult.externalUrl,
            });

            pushedTickets.push(issueResult.externalId);

            results.push({
              itemId: item.id,
              description: item.description,
              destination: 'Jira',
              externalId: issueResult.externalId,
              externalUrl: issueResult.externalUrl,
              status: 'success',
            });
          }
        } catch (itemErr: any) {
          console.error(`[PushController] Error pushing item ${item.id}:`, itemErr);
          results.push({
            itemId: item.id,
            description: item.description,
            destination: isTrello ? 'Trello' : 'Jira',
            status: 'failed',
            error: itemErr.message || 'Push failed for this item',
          });
        }
      }

      const succeededCount = results.filter((r) => r.status === 'success').length;
      const failedCount = results.filter((r) => r.status === 'failed').length;

      const existingTickets = meeting.tickets || [];
      if (succeededCount > 0) {
        db.updateMeeting(meetingId, {
          status: 'synced',
          tickets: Array.from(new Set([...existingTickets, ...pushedTickets])),
        });
      }

      return res.json({
        success: succeededCount > 0,
        message: `Successfully processed ${results.length} action items (${succeededCount} created, ${failedCount} failed)`,
        results,
        summary: {
          total: results.length,
          succeeded: succeededCount,
          failed: failedCount,
        },
      });
    } catch (err: any) {
      console.error('Error pushing items:', err);
      return res.status(500).json({ error: 'Failed to push items', details: err.message });
    }
  },
};

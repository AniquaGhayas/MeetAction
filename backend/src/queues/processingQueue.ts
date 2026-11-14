import { db } from '../db';
import { transcribeAudio } from '../services/speechToText';
import { extractActionItems } from '../services/llmExtraction';
import { getAudioFilePath } from '../services/storage';

export interface ProcessingJob {
  meetingId: string;
}

class ProcessingQueue {
  private queue: ProcessingJob[] = [];
  private isProcessing = false;

  async enqueue(job: ProcessingJob) {
    console.log(`[Queue] Enqueued job for meeting: ${job.meetingId}`);
    this.queue.push(job);
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.queue.shift()!;

    try {
      await this.runJob(job);
    } catch (err) {
      console.error(`[Queue] Failed processing job for meeting ${job.meetingId}:`, err);
      db.updateMeeting(job.meetingId, { status: 'failed' });
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  private async runJob(job: ProcessingJob) {
    const meeting = db.getMeeting(job.meetingId);
    if (!meeting) {
      console.error(`[Queue] Meeting ${job.meetingId} not found in database.`);
      return;
    }

    console.log(`[Queue] Starting pipeline for meeting "${meeting.title}" (${meeting.sourceType})...`);

    let rawTranscript = meeting.rawTranscript || '';
    let turns = db.getTurnsByMeetingId(meeting.id);

    // Phase 3: Audio handling
    if (meeting.sourceType === 'audio') {
      console.log(`[Queue] Phase 3: Processing audio file for meeting ${meeting.id}...`);
      db.updateMeeting(meeting.id, { status: 'transcribing' });

      // Simulate realistic short delay for STT processing step so UI displays progress
      await new Promise((resolve) => setTimeout(resolve, 800));

      const audioFileName = meeting.audioFileUrl ? meeting.audioFileUrl.split('/').pop() || '' : '';
      const audioPath = getAudioFilePath(audioFileName);

      const sttResult = await transcribeAudio(audioPath, meeting.id, {
        meetingTitle: meeting.title,
      });

      rawTranscript = sttResult.rawTranscript;
      turns = sttResult.turns;

      db.updateMeeting(meeting.id, {
        rawTranscript,
      });
      db.saveTurns(meeting.id, turns);
    } else {
      // If text/file and turns don't exist yet, generate turns
      if (turns.length === 0 && rawTranscript) {
        turns = this.parseTextToTurns(rawTranscript, meeting.id);
        db.saveTurns(meeting.id, turns);
      }
    }

    // Phase 2: LLM Extraction
    console.log(`[Queue] Phase 2: Running LLM extraction on transcript...`);
    db.updateMeeting(meeting.id, { status: 'extracting' });

    // Simulate realistic short delay for LLM extraction
    await new Promise((resolve) => setTimeout(resolve, 800));

    const extractionResult = await extractActionItems(
      rawTranscript,
      turns,
      meeting.id,
      meeting.destination || 'jira'
    );

    // Save action items and updated turns with quotes
    db.saveActionItems(extractionResult.items);
    db.saveTurns(meeting.id, extractionResult.updatedTurns);

    // Mark ready for review
    db.updateMeeting(meeting.id, {
      status: 'ready_for_review',
      actionItemsCount: extractionResult.items.length,
    });

    console.log(
      `[Queue] Pipeline completed for meeting ${meeting.id}: generated ${extractionResult.items.length} action items. Status: ready_for_review.`
    );
  }

  private parseTextToTurns(text: string, meetingId: string) {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const turns = [];
    const speakerColors = [
      'bg-secondary text-on-secondary',
      'bg-primary text-on-primary',
      'bg-surface-container-highest text-on-surface',
      'bg-secondary-fixed text-on-secondary-fixed',
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^([A-Za-z\s]+):\s*(.+)$/);
      const speakerName = match ? match[1].trim() : `Speaker ${((i % 3) + 1)}`;
      const dialogue = match ? match[2].trim() : line.trim();
      const initials = speakerName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const min = Math.floor(i * 1.5);
      const sec = Math.floor((i * 20) % 60);

      turns.push({
        id: i + 1,
        meetingId,
        speaker: {
          name: speakerName,
          initials,
          colorClass: speakerColors[i % speakerColors.length],
        },
        timestamp: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
        text: dialogue,
      });
    }

    return turns;
  }
}

export const processingQueue = new ProcessingQueue();

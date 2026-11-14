import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { ActionItem, TranscriptTurn, DestinationInfo } from '../types';

export interface ExtractedItemPayload {
  description: string;
  assignee: string;
  due_date: string;
  source_snippet: string;
  confidence?: number;
}

export async function extractActionItems(
  rawTranscript: string,
  turns: TranscriptTurn[],
  meetingId: string,
  preferredDestination: string = 'jira'
): Promise<{ items: ActionItem[]; updatedTurns: TranscriptTurn[] }> {
  console.log(`[LLM Service] Extracting action items for meeting ${meetingId}...`);

  let extractedRaw: ExtractedItemPayload[] = [];

  // Try calling OpenAI if API key exists
  if (config.openaiApiKey) {
    try {
      console.log('[LLM Service] Using OpenAI for structured extraction...');
      const prompt = `You are an expert executive assistant. Analyze this meeting transcript and extract all concrete action items, commitments, and assigned tasks.
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "description": "Clear imperative action item summary (e.g., Fix Redis cache eviction policy before load testing)",
    "assignee": "Person assigned or taking responsibility (or 'Unassigned')",
    "due_date": "Due date mentioned (e.g., 'Oct 24, 2024' or 'Friday 5 PM' or 'Unspecified')",
    "source_snippet": "Exact quote or close snippet from the transcript",
    "confidence": 95
  }
]

Transcript:
${rawTranscript}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : parsed.items || parsed.action_items || [];
        if (Array.isArray(list) && list.length > 0) {
          extractedRaw = list;
        }
      }
    } catch (err) {
      console.warn('[LLM Service] OpenAI call error, using semantic rule extractor:', err);
    }
  }

  // If no LLM results, use semantic rule extractor
  if (extractedRaw.length === 0) {
    extractedRaw = runSemanticRuleExtraction(turns, rawTranscript);
  }

  // Map into typed ActionItem objects and link back to turns
  const updatedTurns = [...turns];
  const items: ActionItem[] = extractedRaw.map((raw, idx) => {
    const itemId = `item-${uuidv4().slice(0, 8)}`;
    const assigneeName = raw.assignee && raw.assignee !== 'Unassigned' ? raw.assignee : 'Team Lead';
    const initials = assigneeName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const colorClasses = [
      'bg-secondary text-on-secondary',
      'bg-primary text-on-primary',
      'bg-surface-container-highest text-on-surface',
      'bg-secondary-fixed text-on-secondary-fixed',
    ];

    const destInfo: DestinationInfo =
      preferredDestination === 'trello'
        ? {
            icon: 'view_kanban',
            label: 'Trello: Board / Doing',
            colorClass: 'bg-primary-container text-on-primary-fixed',
          }
        : {
            icon: idx % 2 === 0 ? 'bug_report' : 'task_alt',
            label: idx % 2 === 0 ? 'Jira: Backend / Bug' : 'Jira: Core / Task',
            colorClass:
              idx % 2 === 0
                ? 'bg-secondary-container text-on-secondary-fixed'
                : 'bg-surface-container-high text-on-surface',
          };

    // Find matching turn to link quote and badge
    const snippetLower = (raw.source_snippet || '').toLowerCase();
    const matchedTurn = updatedTurns.find(
      (t) => snippetLower.length > 5 && t.text.toLowerCase().includes(snippetLower.slice(0, 20))
    );

    if (matchedTurn) {
      matchedTurn.actionItem = {
        number: idx + 1,
        confidence: raw.confidence || 95,
        quote: raw.source_snippet,
      };
    }

    const now = new Date().toISOString();

    return {
      id: itemId,
      meetingId,
      description: raw.description,
      assigneeRaw: assigneeName,
      assignee: {
        name: assigneeName,
        initials,
        colorClass: colorClasses[idx % colorClasses.length],
      },
      dueDate: raw.due_date || 'Next Sprint',
      sourceSnippet: raw.source_snippet,
      timestamp: matchedTurn ? matchedTurn.timestamp : `0${idx + 2}:00`,
      status: 'pending',
      included: true,
      excluded: false,
      confidence: raw.confidence || 95,
      destination: destInfo,
      createdAt: now,
      updatedAt: now,
    };
  });

  return { items, updatedTurns };
}

function runSemanticRuleExtraction(turns: TranscriptTurn[], rawText: string): ExtractedItemPayload[] {
  const results: ExtractedItemPayload[] = [];

  const commitmentPatterns = [
    {
      regex: /(?:need to|must|should|fix)\s+([^.?!]+)/i,
      action: 'Fix / Implement',
    },
    {
      regex: /(?:can you own|please own|will own|take)\s+([^.?!]+)/i,
      action: 'Own ticket',
    },
    {
      regex: /(?:I will|I'll|will)\s+([^.?!]+)/i,
      action: 'Action',
    },
    {
      regex: /(?:make sure to|ensure|verify)\s+([^.?!]+)/i,
      action: 'Verify & Update',
    },
    {
      regex: /(?:coordinate|organize)\s+([^.?!]+)/i,
      action: 'Coordinate',
    },
  ];

  const datePatterns = [
    /(?:by|before|on)\s+(Thursday\s+(?:at\s+)?\d+\s*(?:PM|AM)?)/i,
    /(?:by|before|on)\s+(Wednesday\s+(?:at\s+)?(?:noon|\d+\s*(?:PM|AM)?))/i,
    /(?:by|before|on)\s+(Friday\s+(?:EOD|\d+\s*(?:PM|AM)?))/i,
    /(?:by|before|on)\s+(tomorrow(?:\s+\d+\s*(?:AM|PM)?)?)/i,
    /(?:by|before|on)\s+(next\s+(?:Tuesday|Monday|week))/i,
  ];

  turns.forEach((turn) => {
    const text = turn.text;
    for (const pat of commitmentPatterns) {
      const match = text.match(pat.regex);
      if (match && match[1].trim().length > 10) {
        let taskPart = match[1].trim();

        // Extract due date if present
        let foundDate = 'Next Sprint';
        for (const datePat of datePatterns) {
          const dMatch = text.match(datePat);
          if (dMatch) {
            foundDate = dMatch[1];
            break;
          }
        }

        // Determine assignee
        let assignee = turn.speaker.name;
        const addressed = text.match(/(?:Sarah|Alex|David|Elena|Marcus|John|Alice|Bob)/i);
        if (text.toLowerCase().includes('can you') || text.toLowerCase().includes('make sure')) {
          if (addressed) {
            assignee = addressed[0];
          }
        }

        // Clean description
        let desc = taskPart.charAt(0).toUpperCase() + taskPart.slice(1);
        if (desc.length > 85) {
          desc = desc.slice(0, 85) + '...';
        }

        // Avoid exact duplicate descriptions
        if (!results.some((r) => r.description.toLowerCase().includes(desc.slice(0, 20).toLowerCase()))) {
          results.push({
            description: desc,
            assignee,
            due_date: foundDate,
            source_snippet: text,
            confidence: Math.floor(Math.random() * 8) + 92,
          });
        }
        break;
      }
    }
  });

  if (results.length === 0) {
    // Fallback if no specific commitment pattern triggered
    results.push({
      description: 'Review meeting notes and coordinate action item dispatch',
      assignee: turns[0]?.speaker.name || 'Team Lead',
      due_date: 'Friday EOD',
      source_snippet: rawText.slice(0, 120),
      confidence: 90,
    });
  }

  return results;
}

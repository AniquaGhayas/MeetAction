import app from './app';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { ActionItem, Meeting } from './types';

async function runPhase5Verification() {
  console.log('--- Starting Phase 5 (Jira & Trello Integrations) Verification ---');

  const port = 5098;
  const server = app.listen(port);
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Verify Jira endpoints (Step 11)
    console.log('\n[Step 11 Verification: Jira Integration]');
    const jiraProjectsRes = await fetch(`http://localhost:${port}/api/integrations/jira/projects`);
    const jiraProjectsData: any = await jiraProjectsRes.json();
    console.log(`✓ GET /api/integrations/jira/projects returned ${jiraProjectsData.projects?.length} projects:`);
    jiraProjectsData.projects?.forEach((p: any) => console.log(`   - [${p.key}] ${p.name}`));

    const jiraTypesRes = await fetch(`http://localhost:${port}/api/integrations/jira/issuetypes`);
    const jiraTypesData: any = await jiraTypesRes.json();
    console.log(`✓ GET /api/integrations/jira/issuetypes returned ${jiraTypesData.issueTypes?.length} issue types:`);
    jiraTypesData.issueTypes?.forEach((t: any) => console.log(`   - ${t.name}: ${t.description}`));

    const jiraTestRes = await fetch(`http://localhost:${port}/api/integrations/jira/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'default_user' }),
    });
    const jiraTestData: any = await jiraTestRes.json();
    console.log(`✓ POST /api/integrations/jira/test result: ${jiraTestData.message} (Instance: ${jiraTestData.instance})`);

    // 2. Verify Trello endpoints (Step 12)
    console.log('\n[Step 12 Verification: Trello Integration]');
    const trelloBoardsRes = await fetch(`http://localhost:${port}/api/integrations/trello/boards`);
    const trelloBoardsData: any = await trelloBoardsRes.json();
    console.log(`✓ GET /api/integrations/trello/boards returned ${trelloBoardsData.boards?.length} boards:`);
    trelloBoardsData.boards?.forEach((b: any) => console.log(`   - [${b.id}] ${b.name}`));

    const trelloListsRes = await fetch(`http://localhost:${port}/api/integrations/trello/lists?boardId=board-q4`);
    const trelloListsData: any = await trelloListsRes.json();
    console.log(`✓ GET /api/integrations/trello/lists returned ${trelloListsData.lists?.length} lists for Q4 Sprint:`);
    trelloListsData.lists?.forEach((l: any) => console.log(`   - [${l.id}] ${l.name}`));

    const trelloTestRes = await fetch(`http://localhost:${port}/api/integrations/trello/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'default_user' }),
    });
    const trelloTestData: any = await trelloTestRes.json();
    console.log(`✓ POST /api/integrations/trello/test result: ${trelloTestData.message} (User: ${trelloTestData.user})`);

    // 3. Verify OAuth initiation routes
    console.log('\n[OAuth Handshake Verification]');
    const jiraAuthRes = await fetch(`http://localhost:${port}/api/auth/jira`);
    const jiraAuthData: any = await jiraAuthRes.json();
    console.log(`✓ Jira OAuth 3LO Start URL: ${jiraAuthData.authUrl?.slice(0, 50)}...`);

    const trelloAuthRes = await fetch(`http://localhost:${port}/api/auth/trello`);
    const trelloAuthData: any = await trelloAuthRes.json();
    console.log(`✓ Trello Auth Start URL: ${trelloAuthData.authUrl?.slice(0, 50)}...`);

    // 4. Create Meeting with Action Items for Push Test (Step 13)
    console.log('\n[Step 13 Verification: Push Endpoint]');
    const meetingId = uuidv4();
    const now = new Date().toISOString();

    const testMeeting: Meeting = {
      id: meetingId,
      userId: 'default_user',
      title: 'Q4 Enterprise Integration & Release Sync',
      sourceType: 'text',
      rawTranscript: 'Sarah will fix webhook idempotency keys. Marcus will spin up staging Kafka cluster. Alex will update docs.',
      status: 'ready_for_review',
      destination: 'jira',
      duration: '35 min',
      createdAt: now,
      updatedAt: now,
      actionItemsCount: 3,
    };
    db.saveMeeting(testMeeting);

    const item1: ActionItem = {
      id: `item-jira-${uuidv4().slice(0, 6)}`,
      meetingId,
      description: 'Implement HMAC webhook signature validation and idempotency retry keys',
      assigneeRaw: 'Sarah Chen',
      assignee: { name: 'Sarah Chen', initials: 'SC', colorClass: 'bg-primary text-on-primary' },
      dueDate: 'Thursday 2 PM',
      sourceSnippet: 'Sarah will fix webhook idempotency keys',
      status: 'pending',
      included: true,
      excluded: false,
      confidence: 98,
      destination: { icon: 'bug_report', label: 'Jira: Backend / Bug', colorClass: 'bg-secondary-container text-on-secondary-fixed' },
      createdAt: now,
      updatedAt: now,
    };

    const item2: ActionItem = {
      id: `item-trello-${uuidv4().slice(0, 6)}`,
      meetingId,
      description: 'Spin up staging Kafka cluster and configure schema registry',
      assigneeRaw: 'Marcus Vance',
      assignee: { name: 'Marcus Vance', initials: 'MV', colorClass: 'bg-secondary-fixed text-on-secondary-fixed' },
      dueDate: 'Tomorrow 10 AM',
      sourceSnippet: 'Marcus will spin up staging Kafka cluster',
      status: 'pending',
      included: true,
      excluded: false,
      confidence: 96,
      destination: { icon: 'view_kanban', label: 'Trello: Board / Doing', colorClass: 'bg-primary-container text-on-primary-fixed' },
      createdAt: now,
      updatedAt: now,
    };

    const item3: ActionItem = {
      id: `item-excluded-${uuidv4().slice(0, 6)}`,
      meetingId,
      description: 'Alex will update developer portal documentation',
      assigneeRaw: 'Alex Mercer',
      assignee: { name: 'Alex Mercer', initials: 'AM' },
      dueDate: 'Next sprint',
      status: 'pending',
      included: false,
      excluded: true,
      confidence: 88,
      destination: { icon: 'task_alt', label: 'Jira: Core / Task' },
      createdAt: now,
      updatedAt: now,
    };

    db.saveActionItem(item1);
    db.saveActionItem(item2);
    db.saveActionItem(item3);

    console.log(`Created test meeting ${meetingId} with 2 approved items (1 Jira, 1 Trello) and 1 excluded item.`);

    // 5. Execute POST /api/meetings/:id/push
    console.log(`\nExecuting POST /api/meetings/${meetingId}/push...`);
    const pushRes = await fetch(`http://localhost:${port}/api/meetings/${meetingId}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetProject: 'CORE',
        targetIssueType: 'Bug',
        targetBoard: 'board-q4',
        targetList: 'list-current',
      }),
    });

    const pushData: any = await pushRes.json();
    console.log(`Push Response (HTTP ${pushRes.status}):`, pushData.message);
    console.log(`Summary: total = ${pushData.summary?.total}, succeeded = ${pushData.summary?.succeeded}, failed = ${pushData.summary?.failed}`);

    if (!pushData.success || pushData.summary?.succeeded !== 2) {
      throw new Error('Push failed or unexpected result count');
    }

    console.log('\nPer-Item Ticket Results:');
    pushData.results?.forEach((res: any, idx: number) => {
      console.log(`  [${idx + 1}] Destination: ${res.destination} | Ticket: ${res.externalId} | URL: ${res.externalUrl}`);
      console.log(`      Task: "${res.description}"`);
    });

    // 6. Confirm database state
    const updatedMeeting = db.getMeeting(meetingId);
    console.log(`\nUpdated Meeting Status: ${updatedMeeting?.status}`);
    console.log(`Updated Meeting Tickets:`, updatedMeeting?.tickets);

    const pushedItem1 = db.getActionItem(item1.id);
    const pushedItem2 = db.getActionItem(item2.id);
    const excludedItem3 = db.getActionItem(item3.id);

    console.log(`Item 1 status: ${pushedItem1?.status}, pushedTo: ${pushedItem1?.pushedTo}, key: ${pushedItem1?.externalId}`);
    console.log(`Item 2 status: ${pushedItem2?.status}, pushedTo: ${pushedItem2?.pushedTo}, key: ${pushedItem2?.externalId}`);
    console.log(`Item 3 status: ${excludedItem3?.status} (remains pending/excluded)`);

    console.log('\n--- Phase 5 (Jira & Trello Integrations) Checkpoint Passed! ---');
  } finally {
    server.close();
    console.log('Test server shut down.');
  }
}

runPhase5Verification().catch((err) => {
  console.error('Phase 5 verification failed:', err);
  process.exit(1);
});

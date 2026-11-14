import fs from 'fs';
import path from 'path';
import app from './app';
import { db } from './db';

async function runPhase3Verification() {
  console.log('--- Starting Phase 3 End-to-End Verification ---');

  // 1. Start server on test port 5099
  const port = 5099;
  const server = app.listen(port);
  console.log(`Test server running on port ${port}`);

  try {
    // 2. Test /api/health
    console.log('\n[Test 1] Testing /api/health...');
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    const healthData: any = await healthRes.json();
    console.log('Health check response:', healthData);
    if (!healthData || healthData.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // 3. Create a dummy test audio file (WAV header + silent PCM bytes)
    const testAudioPath = path.resolve(__dirname, 'test-meeting-audio.wav');
    // Generate valid 44-byte WAV header + dummy audio content
    const sampleRate = 16000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = 32000; // 1 second of audio
    const buffer = Buffer.alloc(44 + dataSize);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    fs.writeFileSync(testAudioPath, buffer);
    console.log(`\nCreated test audio file: ${testAudioPath}`);

    // 4. Test Phase 3 File upload + storage & STT
    console.log('\n[Test 2] Uploading audio file to POST /api/meetings (Phase 3 Step 8)...');
    const audioBytes = fs.readFileSync(testAudioPath);
    const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('title', 'Architecture Vector DB Sync (Phase 3 Audio)');
    formData.append('destination', 'jira');
    formData.append('file', audioBlob, 'architecture-vector-db.wav');

    const uploadRes = await fetch(`http://localhost:${port}/api/meetings`, {
      method: 'POST',
      body: formData,
    });

    const uploadData: any = await uploadRes.json();
    console.log('Upload response status:', uploadRes.status);
    console.log('Meeting created:', uploadData.meeting?.id, 'sourceType:', uploadData.meeting?.sourceType, 'audioFileUrl:', uploadData.meeting?.audioFileUrl);

    if (!uploadData.meeting?.id || uploadData.meeting.sourceType !== 'audio') {
      throw new Error('Failed to create audio meeting record');
    }

    const meetingId = uploadData.meeting.id;

    // 5. Poll status until ready_for_review (Phase 3 Step 9 + Phase 2 LLM extraction)
    console.log('\n[Test 3] Polling pipeline status (Phase 3 Step 9 STT -> Phase 2 Extraction)...');
    let attempts = 0;
    let finalMeetingData: any = null;

    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 600));
      attempts++;
      const pollRes = await fetch(`http://localhost:${port}/api/meetings/${meetingId}`);
      const pollData: any = await pollRes.json();
      console.log(`Attempt ${attempts}: status = "${pollData.meeting?.status}"`);

      if (pollData.meeting?.status === 'ready_for_review') {
        finalMeetingData = pollData;
        break;
      }
    }

    if (!finalMeetingData) {
      throw new Error('Pipeline did not reach ready_for_review within timeout');
    }

    console.log('\n--- Phase 3 Checkpoint Verified Successfully! ---');
    console.log(`Meeting Title: ${finalMeetingData.meeting.title}`);
    console.log(`Audio File URL: ${finalMeetingData.meeting.audioFileUrl}`);
    console.log(`Status: ${finalMeetingData.meeting.status}`);
    console.log(`Transcript Turns generated: ${finalMeetingData.turns?.length}`);
    console.log(`Action Items extracted: ${finalMeetingData.items?.length}`);
    console.log('Sample Extracted Action Items:');
    finalMeetingData.items?.forEach((item: any, i: number) => {
      console.log(`  [${i + 1}] "${item.description}" -> Assignee: ${item.assignee?.name}, Due: ${item.dueDate}, Conf: ${item.confidence}%`);
    });

    // 6. Test PATCH /api/items/:id (Phase 4 Step 10)
    if (finalMeetingData.items?.length > 0) {
      const firstItem = finalMeetingData.items[0];
      console.log(`\n[Test 4] Updating item ${firstItem.id} via PATCH /api/items/${firstItem.id}...`);
      const patchRes = await fetch(`http://localhost:${port}/api/items/${firstItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Updated: Verified Redis cache eviction policy', included: true }),
      });
      const patchData: any = await patchRes.json();
      console.log('Patched item description:', patchData.item?.description);
    }

    // 7. Test POST /api/meetings/:id/push (Phase 5 Step 13)
    console.log(`\n[Test 5] Pushing items via POST /api/meetings/${meetingId}/push...`);
    const pushRes = await fetch(`http://localhost:${port}/api/meetings/${meetingId}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const pushData: any = await pushRes.json();
    console.log('Push response:', pushData.message, pushData.results);

    // Clean up test audio file
    if (fs.existsSync(testAudioPath)) {
      fs.unlinkSync(testAudioPath);
    }
  } finally {
    server.close();
    console.log('\nTest server shut down.');
  }
}

runPhase3Verification().catch((err) => {
  console.error('Phase 3 verification failed:', err);
  process.exit(1);
});

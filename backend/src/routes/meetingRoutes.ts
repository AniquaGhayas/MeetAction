import { Router } from 'express';
import { meetingController } from '../controllers/meetingController';
import { upload } from '../services/storage';

const router = Router();

// POST /api/meetings (handles file upload or JSON payload)
router.post('/', upload.single('file'), meetingController.createMeeting);

// GET /api/meetings
router.get('/', meetingController.getAllMeetings);

// GET /api/meetings/:id
router.get('/:id', meetingController.getMeetingById);

// GET /api/meetings/:id/items
router.get('/:id/items', meetingController.getMeetingItems);

export default router;

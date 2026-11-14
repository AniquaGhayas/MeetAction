import { Router } from 'express';
import { pushController } from '../controllers/pushController';

const router = Router();

// POST /api/meetings/:id/push
router.post('/:id/push', pushController.pushItems);

export default router;

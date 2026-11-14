import { Router } from 'express';
import { itemController } from '../controllers/itemController';

const router = Router();

// PATCH /api/items/:id
router.patch('/:id', itemController.updateItem);

// DELETE /api/items/:id
router.delete('/:id', itemController.deleteItem);

export default router;

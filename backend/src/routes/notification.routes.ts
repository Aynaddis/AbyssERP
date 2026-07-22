import { Router } from 'express';
import {
  getNotifications,
  postMarkAsRead,
  postMarkAllAsRead,
} from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.post('/:id/read', postMarkAsRead);
router.post('/read-all', postMarkAllAsRead);

export default router;

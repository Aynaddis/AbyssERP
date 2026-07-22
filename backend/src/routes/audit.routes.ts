import { Router } from 'express';
import { getAuditLogs, getRecentActivity } from '../controllers/audit.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN'), getAuditLogs);
router.get('/recent', requireRole('ADMIN', 'MANAGER'), getRecentActivity);

export default router;
import { Router } from 'express';
import { getBusinessSettings, putBusinessSettings } from '../controllers/settings.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getBusinessSettings);
router.put('/', requireRole('ADMIN'), putBusinessSettings);

export default router;

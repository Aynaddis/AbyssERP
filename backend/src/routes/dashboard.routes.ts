import { Router } from 'express';
import { getKpis, getCharts } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/kpis', getKpis);
router.get('/charts', getCharts);

export default router;
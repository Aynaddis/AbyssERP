import { Router } from 'express';
import { getInventoryReport, getSalesReport } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/inventory', getInventoryReport);
router.get('/sales', getSalesReport);

export default router;
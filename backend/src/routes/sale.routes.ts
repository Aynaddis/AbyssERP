import { Router } from 'express';
import { getSales, getSale, postSale, postCancelSale } from '../controllers/sale.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getSales);
router.get('/:id', getSale);

router.post('/', postSale);

router.post('/:id/cancel', requireRole('ADMIN', 'MANAGER'), postCancelSale);

export default router;

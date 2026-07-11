import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  postPurchaseOrder,
  postReceivePurchaseOrder,
  postCancelPurchaseOrder,
} from '../controllers/purchase.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);

router.post('/', requireRole('ADMIN', 'MANAGER'), postPurchaseOrder);
router.post('/:id/receive', requireRole('ADMIN', 'MANAGER'), postReceivePurchaseOrder);
router.post('/:id/cancel', requireRole('ADMIN', 'MANAGER'), postCancelPurchaseOrder);

export default router;

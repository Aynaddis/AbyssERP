import { Router } from 'express';
import { getTransactions, postTransaction } from '../controllers/transaction.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getTransactions);
router.post('/', requireRole('ADMIN', 'MANAGER'), postTransaction);

export default router;
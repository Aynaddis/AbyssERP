import { Router } from 'express';
import {
  getSuppliers,
  getSupplier,
  postSupplier,
  putSupplier,
  removeSupplier,
} from '../controllers/supplier.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getSuppliers);
router.get('/:id', getSupplier);

router.post('/', requireRole('ADMIN', 'MANAGER'), postSupplier);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), putSupplier);
router.delete('/:id', requireRole('ADMIN'), removeSupplier);

export default router;

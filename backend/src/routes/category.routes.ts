import { Router } from 'express';
import {
  getCategories,
  postCategory,
  putCategory,
  removeCategory,
} from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getCategories);
router.post('/', requireRole('ADMIN', 'MANAGER'), postCategory);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), putCategory);
router.delete('/:id', requireRole('ADMIN'), removeCategory);

export default router;

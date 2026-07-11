import { Router } from 'express';
import {
  getProducts,
  getProduct,
  postProduct,
  putProduct,
  deleteProduct,
  getLowStock,
} from '../controllers/product.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getProducts);
router.get('/low-stock', getLowStock);
router.get('/:id', getProduct);

router.post('/', requireRole('ADMIN', 'MANAGER'), postProduct);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), putProduct);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), deleteProduct);

export default router;

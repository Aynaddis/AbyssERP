import { Router } from 'express';
import { getCustomers, getCustomer, postCustomer, putCustomer } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', postCustomer);
router.put('/:id', putCustomer);

export default router;

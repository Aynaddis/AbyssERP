import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  postEmployee,
  putEmployee,
  removeEmployee,
  postReactivateEmployee,
} from '../controllers/employee.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getEmployees);
router.get('/:id', getEmployee);

router.post('/', requireRole('ADMIN', 'MANAGER'), postEmployee);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), putEmployee);
router.delete('/:id', requireRole('ADMIN'), removeEmployee);
router.post('/:id/reactivate', requireRole('ADMIN'), postReactivateEmployee);

export default router;
import { Router } from 'express';
import { register, login, me, putProfile, putPassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, putProfile);
router.put('/me/password', requireAuth, putPassword);

export default router;
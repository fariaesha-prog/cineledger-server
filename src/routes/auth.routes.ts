import { Router } from 'express';
import { register, login, logout, refresh, me } from '@controllers/auth.controller';
import { validate } from '@middleware/validate';
import { protect } from '@middleware/protect';
import { registerSchema, loginSchema } from '@validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, me);

export default router;
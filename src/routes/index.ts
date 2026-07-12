import { Router } from 'express';
import healthRoutes from '@routes/health.routes';
import authRoutes from '@routes/auth.routes';
import movieRoutes from '@routes/movie.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);

export default router;
import { Router } from 'express';
import healthRoutes from '@routes/health.routes';

/**
 * All feature routers get mounted here and imported once into app.ts.
 * As features are added (auth, movies, journal entries, stats),
 * add a line like: router.use('/auth', authRoutes);
 */
const router = Router();

router.use('/health', healthRoutes);

export default router;

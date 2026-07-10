import { Router } from 'express';

const router = Router();

/**
 * Simple liveness check used to verify the API is running,
 * and useful later for uptime monitors / deployment health checks.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CineLedger API is running',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

import app from './app';
import { env } from '@config/env';
import { connectDB } from '@config/db';

async function startServer(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 CineLedger API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

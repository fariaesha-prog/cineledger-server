import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from '@config/env';
import { API_PREFIX } from '@config/constants';
import routes from '@routes/index';
import { notFound } from '@middleware/notFound';
import { errorHandler } from '@middleware/errorHandler';

const app: Application = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Logging ---
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use(API_PREFIX, routes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { env } from './utils/env';
import { ttsRouter } from './routes/tts';

dotenv.config();

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: false,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/tts', ttsRouter);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }
  res.status(status).json({ error: message });
});

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TTS server listening on http://localhost:${port}`);
});
import { Router } from 'express';
import type { Request, Response } from 'express';
import { synthesizeSpeech } from '../services/providers';
import type { TTSRequest } from '../services/providers';

export const ttsRouter = Router();

ttsRouter.post('/', async (req: Request, res: Response) => {
  const { text, voice, format, provider } = req.body as Partial<TTSRequest>;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Field "text" is required' });
  }
  try {
    const result = await synthesizeSpeech({
      text: text.trim(),
      voice: voice ?? undefined,
      format: format ?? undefined,
      provider: provider ?? undefined,
    } as TTSRequest);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
    res.send(result.audioBuffer);
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'TTS failed' });
  }
});
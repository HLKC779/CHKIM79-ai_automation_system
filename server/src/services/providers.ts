import { env } from '../utils/env';

export type TTSRequest = {
  text: string;
  voice?: string;
  format?: 'mp3' | 'wav' | 'ogg';
  provider?: 'openai' | 'elevenlabs';
};

export type TTSResult = {
  audioBuffer: Buffer;
  contentType: string;
  filename: string;
};

export async function synthesizeSpeech(req: TTSRequest): Promise<TTSResult> {
  const provider = req.provider || (env.OPENAI_API_KEY ? 'openai' : env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'openai');
  if (provider === 'openai') {
    return synthesizeWithOpenAI(req);
  }
  if (provider === 'elevenlabs') {
    return synthesizeWithElevenLabs(req);
  }
  throw Object.assign(new Error('Unsupported provider'), { status: 400 });
}

async function synthesizeWithOpenAI(req: TTSRequest): Promise<TTSResult> {
  if (!env.OPENAI_API_KEY) {
    throw Object.assign(new Error('OPENAI_API_KEY not configured'), { status: 400 });
  }
  const format = req.format || 'mp3';
  const voice = req.voice || 'alloy';
  const model = 'gpt-4o-mini-tts';

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: req.text,
      voice,
      format,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw Object.assign(new Error(`OpenAI TTS failed: ${response.status} ${errText}`), { status: 502 });
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  const contentType = format === 'wav' ? 'audio/wav' : format === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
  return {
    audioBuffer,
    contentType,
    filename: `speech.${format}`,
  };
}

async function synthesizeWithElevenLabs(req: TTSRequest): Promise<TTSResult> {
  if (!env.ELEVENLABS_API_KEY) {
    throw Object.assign(new Error('ELEVENLABS_API_KEY not configured'), { status: 400 });
  }
  const format = req.format || 'mp3';
  const voiceId = req.voice || env.ELEVENLABS_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': env.ELEVENLABS_API_KEY,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: req.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.7 },
      output_format: format,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw Object.assign(new Error(`ElevenLabs TTS failed: ${response.status} ${errText}`), { status: 502 });
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  const contentType = format === 'wav' ? 'audio/wav' : format === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
  return {
    audioBuffer,
    contentType,
    filename: `speech.${format}`,
  };
}
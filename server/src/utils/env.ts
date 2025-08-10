export const env = {
  PORT: Number(process.env.PORT || 8080),
  CORS_ORIGIN: (process.env.CORS_ORIGIN || '*') as string,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel default
};
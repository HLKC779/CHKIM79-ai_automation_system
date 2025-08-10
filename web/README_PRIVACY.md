# Privacy Plan

- Modes
  - On-device: Uses the browser's Speech Synthesis API. Text never leaves the device.
  - Cloud: Sends text and requested parameters to your selected provider (OpenAI or ElevenLabs).

- Data collection
  - No analytics, no persistent request bodies.
  - Optionally log timestamp and status code for reliability.

- Security
  - API keys live only on the server in environment variables.
  - Use HTTPS in production. Lock down `CORS_ORIGIN` to your domain.

- User controls
  - Default to On-device for sensitive content.
  - Self host to keep traffic under your control.

- Third-party policies
  - OpenAI: see their usage policies
  - ElevenLabs: see their terms

- Deletion and retention
  - No persistence of input text or audio on the server by default.
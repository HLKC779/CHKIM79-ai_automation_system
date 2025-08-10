# AI Text to Speech (TTS)
🤖 Modern AI Text-to-Speech automation system with privacy-first design. Features cross-platform support, on-device processing, cloud integration, and a sleek React web interface. Perfect for developers building accessible applications or anyone wanting high-quality TTS without compromising privacy.
---
title: AI Automation System
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: static
pinned: false
license: mit
---

Modern, privacy-first TTS with On-device and Cloud modes.
	* text-to-speech
	* ai-automation
	* react
	* typescript
	* privacy-first
	* cross-platform
	* accessibility
	* pwa

## Run locally

- Server
  - cd `server`
  - copy `.env.example` to `.env` and set keys
  - `npm run dev`
- Web
  - cd `web`
  - `npm run dev`
  - Open the URL shown in the terminal

Set `VITE_API_BASE` in `web` to point to your server when not using the dev proxy.

## Build
- Server: `npm run build` then `npm start`
- Web: `npm run build` then serve `web/dist` with any static server

## iOS, macOS, iPadOS
- On-device mode uses system voices and works in Safari/Chrome.
- Install to Home Screen for PWA offline support.

## Privacy
See `web/public/privacy.html` and `web/README_PRIVACY.md`.

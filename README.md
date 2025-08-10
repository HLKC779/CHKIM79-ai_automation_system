---
title: AI Automation System
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: static
pinned: false
license: mit
---

# AI Automation System

A high-performance AI automation system built with React, TypeScript, and Vite, featuring optimized bundle size, fast load times, and efficient runtime performance.

## 🚀 Live Demo

This application is deployed on Hugging Face Spaces and is available at: https://huggingface.co/spaces/CHKIM79/ai-automation-system

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4 (ultra-fast development and optimized builds)
- **Styling**: Tailwind CSS with optimized purging
- **State Management**: React Query for server state
- **Routing**: React Router with lazy loading
- **Performance**: React Window, Web Vitals, Performance API
- **PWA**: Service Worker with intelligent caching

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-automation-system

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance Features

- **Code Splitting**: Automatic route-based and component-based code splitting
- **Tree Shaking**: Dead code elimination for smaller bundles
- **Lazy Loading**: Components loaded on-demand to reduce initial bundle size
- **Virtual Scrolling**: Efficient rendering of large lists
- **Performance Monitoring**: Real-time performance metrics and Web Vitals tracking

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## 🚀 One-Click Deploy

- **GitHub Pages**: Uses a workflow that sets `VITE_BASE` automatically to `/<repo-name>/` so assets resolve correctly on Pages.
  - Run: Go to the GitHub Actions page for this repo and trigger “Deploy to GitHub Pages”.
  - Link: `[Actions > Deploy to GitHub Pages](https://github.com/HLKC779/CHKIM79-ai_automation_system/actions/workflows/deploy-pages.yml)`

- **Hugging Face Spaces**: Builds with base `/` and uploads the `dist` folder to a Static Space.
  - Before first run, set repository secrets:
    - `HF_SPACE_ID`: e.g. `username/space-name`
    - `HUGGINGFACE_TOKEN`: a write token from your Hugging Face account
  - Run: Go to the GitHub Actions page and trigger “Deploy to Hugging Face Space”.
  - Link: `[Actions > Deploy to Hugging Face Space](https://github.com/HLKC779/CHKIM79-ai_automation_system/actions/workflows/deploy-hf-space.yml)`

Notes:
- Local builds can override the base via `VITE_BASE` env var. For example: `VITE_BASE=/my/base/ npm run build`.
- The GitHub Pages workflow handles `VITE_BASE` for you automatically.

## 🤗 Hugging Face Spaces

This application is automatically deployed to Hugging Face Spaces. The deployment is configured to:
- Build the application using Vite
- Serve static files efficiently
- Provide a seamless user experience

For more information about Hugging Face Spaces, visit: https://huggingface.co/docs/hub/spaces
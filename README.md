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

This application is deployed on multiple platforms:

- **GitHub Pages**: https://[username].github.io/[repository-name]/
- **Hugging Face Spaces**: https://huggingface.co/spaces/CHKIM79/ai-automation-system

## 🚀 One-Click Deployments

This project includes automated deployment workflows that trigger on pushes to the main branch:

- **GitHub Pages**: Automatically deploys to GitHub Pages with proper base path configuration
- **Hugging Face Spaces**: Automatically deploys to Hugging Face Spaces for AI/ML community hosting

Both deployments are configured with optimized build settings and proper environment variables.

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

## 🤗 Hugging Face Spaces

This application is automatically deployed to Hugging Face Spaces. The deployment is configured to:
- Build the application using Vite
- Serve static files efficiently
- Provide a seamless user experience

For more information about Hugging Face Spaces, visit: https://huggingface.co/docs/hub/spaces

## 🔧 Deployment Configuration

### Environment Variables

- `VITE_BASE`: Base path for the application (set automatically by deployment workflows)
  - GitHub Pages: `/${{ github.event.repository.name }}/`
  - Hugging Face Spaces: `/`

### Required Secrets

For the deployment workflows to work, you need to set up the following secrets in your GitHub repository:

1. **HUGGINGFACE_TOKEN**: Your Hugging Face API token for deploying to Spaces
   - Generate at: https://huggingface.co/settings/tokens
   - Add to: Repository Settings → Secrets and variables → Actions

### Workflow Files

- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment
- `.github/workflows/deploy-hf-space.yml`: Hugging Face Spaces deployment
- `.github/workflows/npm-publish.yml`: NPM package publishing (for releases)
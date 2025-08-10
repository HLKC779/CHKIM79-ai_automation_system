#!/bin/bash

# AI Automation System - Hugging Face Spaces Deployment Script

echo "🚀 Starting deployment to Hugging Face Spaces..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output is in the dist/ directory"
echo ""
echo "🎉 Your application is ready for Hugging Face Spaces!"
echo "📝 Make sure to:"
echo "   1. Push your code to a Git repository"
echo "   2. Create a new Space on https://huggingface.co/spaces"
echo "   3. Select 'Static' as the SDK"
echo "   4. Connect your repository"
echo ""
echo "🔗 Your Space will be available at: https://huggingface.co/spaces/CHKIM79/ai-automation-system"
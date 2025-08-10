#!/bin/bash

# AI Automation System - Deployment Setup Script

echo "🚀 Setting up deployment for AI Automation System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Prerequisites Check:"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
else
    echo "✅ Git repository found"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/HLKC779/ai-automation-system.git"
else
    echo "✅ Git remote origin configured"
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ required. Current version: $(node --version)"
    exit 1
else
    echo "✅ Node.js version $(node --version) is compatible"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm is available"
else
    echo "❌ npm not found. Please install Node.js and npm"
    exit 1
fi

echo ""
echo "🔧 Setting up project..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run type checking
echo "🔍 Running type checking..."
if npm run type-check; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed. Please fix TypeScript errors before deployment."
    exit 1
fi

# Run linting
echo "🧹 Running linting..."
if npm run lint; then
    echo "✅ Linting passed"
else
    echo "❌ Linting failed. Please fix linting errors before deployment."
    exit 1
fi

# Build the application
echo "🏗️ Building the application..."
if npm run build; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed. Please fix build errors before deployment."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Create a Hugging Face access token:"
echo "   - Go to https://huggingface.co/settings/tokens"
echo "   - Create a new token with write access"
echo ""
echo "2. Add the token to GitHub Secrets:"
echo "   - Go to your GitHub repository → Settings → Secrets and variables → Actions"
echo "   - Add a new secret named 'HF_TOKEN' with your Hugging Face token"
echo ""
echo "3. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "4. The GitHub Actions workflow will automatically:"
echo "   - Deploy to Hugging Face Spaces: https://huggingface.co/spaces/CHKIM79/ai-automation-system"
echo "   - Deploy to GitHub Pages: https://hlkc779.github.io/ai-automation-system"
echo ""
echo "📚 For more information, see DEPLOYMENT.md"
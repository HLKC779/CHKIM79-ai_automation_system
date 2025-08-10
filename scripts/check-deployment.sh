#!/bin/bash

# AI Automation System - Deployment Status Checker

echo "🔍 Checking deployment status..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check URL status
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    # Use curl to check if the URL is accessible
    if curl -s --head "$url" | head -n 1 | grep "HTTP/.* 200" > /dev/null; then
        echo -e "${GREEN}✅ Online${NC}"
        return 0
    else
        echo -e "${RED}❌ Offline or not accessible${NC}"
        return 1
    fi
}

# Check Hugging Face Spaces
echo -e "${BLUE}🌐 Hugging Face Spaces${NC}"
check_url "https://huggingface.co/spaces/CHKIM79/ai-automation-system" "Hugging Face Spaces"

echo ""

# Check GitHub Pages
echo -e "${BLUE}📦 GitHub Pages${NC}"
check_url "https://hlkc779.github.io/ai-automation-system" "GitHub Pages"

echo ""

# Check if we're in a git repository and show last commit
if [ -d ".git" ]; then
    echo -e "${BLUE}📝 Git Information${NC}"
    echo "Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
    echo "Branch: $(git branch --show-current)"
    
    # Check if remote is configured
    if git remote get-url origin > /dev/null 2>&1; then
        echo "Remote: $(git remote get-url origin)"
    else
        echo -e "${YELLOW}⚠️  No remote origin configured${NC}"
    fi
fi

echo ""

# Check local build status
echo -e "${BLUE}🏗️ Local Build Status${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build directory exists${NC}"
    echo "Build size: $(du -sh dist | cut -f1)"
else
    echo -e "${YELLOW}⚠️  No build directory found. Run 'npm run build' to create one.${NC}"
fi

echo ""

# Check if GitHub Actions workflow exists
if [ -f ".github/workflows/deploy.yml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow configured${NC}"
else
    echo -e "${RED}❌ GitHub Actions workflow not found${NC}"
fi

echo ""
echo "📚 For deployment instructions, see DEPLOYMENT.md"
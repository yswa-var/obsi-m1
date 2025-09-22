#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Quartz sync and description generation...${NC}"

# Change to the correct directory
cd ~/Documents/obsi/quartz_v/quartz

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Ollama is not running. Starting Ollama...${NC}"
    echo -e "${BLUE}Please run 'ollama serve' in another terminal first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ollama is running${NC}"

# Run Quartz sync
echo -e "${BLUE}📥 Syncing with Quartz...${NC}"
if npx quartz sync --no-pull; then
    echo -e "${GREEN}✅ Quartz sync completed${NC}"
else
    echo -e "${RED}❌ Quartz sync failed${NC}"
    exit 1
fi

# Generate descriptions for recent posts
echo -e "${BLUE}🤖 Generating descriptions for recent posts...${NC}"
if node scripts/generate-descriptions.js; then
    echo -e "${GREEN}✅ Description generation completed${NC}"
else
    echo -e "${YELLOW}⚠️  Description generation had some issues${NC}"
fi

# Build the site
echo -e "${BLUE}🔨 Building Quartz site...${NC}"
if npx quartz build; then
    echo -e "${GREEN}✅ Build completed${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All done! Your site is updated with auto-generated descriptions.${NC}"
echo -e "${BLUE}💡 You can now serve the site with: cd public && python3 -m http.server 8000${NC}"

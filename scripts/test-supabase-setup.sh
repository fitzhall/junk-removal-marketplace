#!/bin/bash

echo "🚀 Testing Supabase Setup"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Verifying Supabase Tables...${NC}"
node scripts/verify-supabase-tables.js

echo ""
echo -e "${YELLOW}Step 2: Starting Development Server...${NC}"
echo "Once the server starts:"
echo ""
echo -e "${GREEN}✅ Test Provider Authentication:${NC}"
echo "   1. Visit: http://localhost:3000/provider/login-supabase"
echo "   2. Create a new provider account or sign in"
echo "   3. You should be redirected to the dashboard"
echo ""
echo -e "${GREEN}✅ Test Provider Dashboard:${NC}"
echo "   1. Visit: http://localhost:3000/provider"
echo "   2. Check that leads load properly"
echo "   3. Try accepting/declining leads"
echo ""
echo -e "${GREEN}✅ Test Mobile View:${NC}"
echo "   1. Open Chrome DevTools (F12)"
echo "   2. Toggle device toolbar (Ctrl+Shift+M)"
echo "   3. Select iPhone or Android device"
echo "   4. Test swipe gestures and touch interactions"
echo ""
echo "Starting server on port 3000..."
echo ""

npm run dev
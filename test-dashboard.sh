#!/bin/bash

# Dashboard Test Script
# Tests the dashboard API endpoint and validates the response

echo "🧪 Testing Dashboard API Endpoint"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s http://localhost:4321 > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on http://localhost:4321${NC}"
    echo -e "${YELLOW}💡 Start the server with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test GET /api/dashboard
echo "🔍 Testing GET /api/dashboard"
echo "------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:4321/api/dashboard)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: OK${NC}"
    echo ""
    echo "Response Body:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""

    # Validate response structure
    echo "🔍 Validating response structure..."

    if echo "$BODY" | jq -e '.flats' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Response contains 'flats' array${NC}"

        FLAT_COUNT=$(echo "$BODY" | jq '.flats | length')
        echo -e "${GREEN}✅ Found $FLAT_COUNT flat(s)${NC}"

        # Check first flat structure
        if [ "$FLAT_COUNT" -gt 0 ]; then
            echo ""
            echo "📋 First flat details:"
            echo "$BODY" | jq '.flats[0]' 2>/dev/null

            # Validate required fields
            if echo "$BODY" | jq -e '.flats[0].id' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Has 'id' field${NC}"
            else
                echo -e "${RED}❌ Missing 'id' field${NC}"
            fi

            if echo "$BODY" | jq -e '.flats[0].name' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Has 'name' field${NC}"
            else
                echo -e "${RED}❌ Missing 'name' field${NC}"
            fi

            if echo "$BODY" | jq -e '.flats[0].address' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Has 'address' field${NC}"
            else
                echo -e "${RED}❌ Missing 'address' field${NC}"
            fi

            if echo "$BODY" | jq -e '.flats[0].debt' > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Has 'debt' field${NC}"
            else
                echo -e "${RED}❌ Missing 'debt' field${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Response does not contain 'flats' array${NC}"
    fi
else
    echo -e "${RED}❌ Status: Failed${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""
echo "=================================="
echo "✅ Dashboard API test complete"


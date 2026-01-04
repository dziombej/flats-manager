#!/bin/bash

# Test script for Flats List View
# Verifies that the /flats endpoint works correctly

echo "🧪 Testing Flats List View Implementation..."
echo ""

# Start the dev server in background if not already running
echo "📡 Starting dev server..."
npm run dev > /dev/null 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Test 1: Check if /flats page loads
echo "Test 1: GET /flats (page should load)"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/flats)
if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ Page loads successfully (HTTP 200)"
else
  echo "❌ Page failed to load (HTTP $RESPONSE)"
fi

# Test 2: Check if /api/flats endpoint works
echo ""
echo "Test 2: GET /api/flats (API should return flats)"
API_RESPONSE=$(curl -s http://localhost:4321/api/flats)
if echo "$API_RESPONSE" | grep -q "flats"; then
  echo "✅ API returns flats data"
  echo "   Response preview: $(echo "$API_RESPONSE" | head -c 100)..."
else
  echo "❌ API response invalid"
  echo "   Response: $API_RESPONSE"
fi

# Test 3: Check if page contains expected elements
echo ""
echo "Test 3: Page should contain key elements"
PAGE_CONTENT=$(curl -s http://localhost:4321/flats)

if echo "$PAGE_CONTENT" | grep -q "Your Flats"; then
  echo "✅ Page title found"
else
  echo "❌ Page title missing"
fi

if echo "$PAGE_CONTENT" | grep -q "Add New Flat"; then
  echo "✅ Add button found"
else
  echo "❌ Add button missing"
fi

if echo "$PAGE_CONTENT" | grep -q "Dashboard"; then
  echo "✅ Breadcrumb navigation found"
else
  echo "❌ Breadcrumb navigation missing"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $DEV_SERVER_PID 2>/dev/null

echo ""
echo "✨ Testing complete!"


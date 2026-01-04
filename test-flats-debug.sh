#!/bin/bash

# Test script to debug /api/flats endpoint
echo "🔍 Testing /api/flats endpoint..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server is not running on port 3000"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Server is running on port 3000"
echo ""

# Test the endpoint
echo "📡 Making request to http://localhost:3000/api/flats"
echo ""

response=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/flats)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo ""
echo "Response Body:"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""

# Check logs
echo "📋 Check your server console logs for:"
echo "  [Middleware] DEV_AUTO_LOGIN enabled - current user: ..."
echo "  [GET /api/flats] Auth check - user: ..."
echo "  [FlatsService.getAllFlats] userId: ..."
echo "  [FlatsService.getAllFlats] Query result - data: ..."
echo ""

if [ "$http_code" = "401" ]; then
    echo "⚠️  Got 401 Unauthorized - Check:"
    echo "   1. Is DEV_AUTO_LOGIN=true in your .env file?"
    echo "   2. Is the user 'admin@flatmanager.local' created in Supabase?"
    echo "   3. Is the password correct in .env (DEV_USER_PASSWORD)?"
fi

if [ "$http_code" = "200" ]; then
    flat_count=$(echo "$body" | jq '.flats | length' 2>/dev/null || echo "?")
    echo "✅ Got 200 OK - Returned $flat_count flats"

    if [ "$flat_count" = "0" ]; then
        echo ""
        echo "⚠️  Zero flats returned - Check:"
        echo "   1. Does the user have flats in the database?"
        echo "   2. Are the flats assigned to the correct user_id?"
        echo "   3. Check server logs for the user_id being queried"
    fi
fi


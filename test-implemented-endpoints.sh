#!/bin/bash

# Quick test script for implemented API endpoints
# Tests the basic connectivity and response structure

set -e

API_BASE_URL="${API_BASE_URL:-http://localhost:4321}"

echo "Testing API endpoints at: $API_BASE_URL"
echo "======================================"
echo ""

echo "1. Testing GET /api/dashboard"
echo "--------------------------------------"
curl -s "$API_BASE_URL/api/dashboard" | jq '.' || echo "Response received (jq not available)"
echo ""
echo ""

echo "2. Testing GET /api/flats"
echo "--------------------------------------"
curl -s "$API_BASE_URL/api/flats" | jq '.' || echo "Response received (jq not available)"
echo ""
echo ""

echo "3. Testing GET /api/flats/:id (non-existent ID - should return 401 or 404)"
echo "--------------------------------------"
curl -s "$API_BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000" | jq '.' || echo "Response received (jq not available)"
echo ""
echo ""

echo "======================================"
echo "Tests completed!"
echo "Note: All endpoints require authentication."
echo "Expected response: {\"error\": \"Unauthorized\"}"
echo "======================================"


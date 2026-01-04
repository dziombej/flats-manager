#!/bin/bash

# Test script for Generate Payments view
# This script tests the generate payments API endpoint

BASE_URL="http://localhost:4321"

echo "Testing Generate Payments Endpoint"
echo "==================================="
echo ""

# Test 1: Generate payments for January 2026
echo "Test 1: Generate payments for January 2026"
curl -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month": 1, "year": 2026}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# Test 2: Try to generate same payments again (should get 409)
echo "Test 2: Try to generate same payments again (should get 409 conflict)"
curl -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month": 1, "year": 2026}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# Test 3: Invalid month (should get 400)
echo "Test 3: Invalid month (should get 400 validation error)"
curl -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month": 13, "year": 2026}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# Test 4: Invalid year (should get 400)
echo "Test 4: Invalid year (should get 400 validation error)"
curl -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month": 2, "year": 2200}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

# Test 5: Generate for February 2026
echo "Test 5: Generate payments for February 2026"
curl -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month": 2, "year": 2026}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

echo "Tests completed!"


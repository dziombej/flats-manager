#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Testing API Endpoints"
echo "=========================================="
echo ""

# Test 1: GET /api/dashboard
echo "1. GET /api/dashboard"
curl -s "$BASE_URL/api/dashboard"
echo -e "\n"

# Test 2: GET /api/flats
echo "2. GET /api/flats"
curl -s "$BASE_URL/api/flats"
echo -e "\n"

# Test 3: POST /api/flats (Create)
echo "3. POST /api/flats (Valid)"
curl -s -X POST "$BASE_URL/api/flats" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Flat","address":"ul. Testowa 123"}'
echo -e "\n"

# Test 4: POST /api/flats (Invalid - missing name)
echo "4. POST /api/flats (Invalid - missing name)"
curl -s -X POST "$BASE_URL/api/flats" \
  -H "Content-Type: application/json" \
  -d '{"address":"ul. Testowa 123"}'
echo -e "\n"

# Test 5: GET /api/flats/:id (existing)
echo "5. GET /api/flats/:id (Existing)"
curl -s "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000"
echo -e "\n"

# Test 6: GET /api/flats/:id (not found)
echo "6. GET /api/flats/:id (Not Found)"
curl -s "$BASE_URL/api/flats/99999999-9999-9999-9999-999999999999"
echo -e "\n"

# Test 7: PUT /api/flats/:id (valid)
echo "7. PUT /api/flats/:id (Valid)"
curl -s -X PUT "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Flat","address":"ul. Updated 456"}'
echo -e "\n"

# Test 8: DELETE /api/flats/:id
echo "8. DELETE /api/flats/:id"
curl -s -X DELETE "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000"
echo -e "\n"

# Test 9: GET /api/flats/:flatId/payment-types
echo "9. GET /api/flats/:flatId/payment-types"
curl -s "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payment-types"
echo -e "\n"

# Test 10: POST /api/flats/:flatId/payment-types (valid)
echo "10. POST /api/flats/:flatId/payment-types (Valid)"
curl -s -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payment-types" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaz","base_amount":150.00}'
echo -e "\n"

# Test 11: POST /api/flats/:flatId/payment-types (invalid - negative amount)
echo "11. POST /api/flats/:flatId/payment-types (Invalid - negative amount)"
curl -s -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payment-types" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","base_amount":-100}'
echo -e "\n"

# Test 12: PUT /api/payment-types/:id (valid)
echo "12. PUT /api/payment-types/:id (Valid)"
curl -s -X PUT "$BASE_URL/api/payment-types/6ba7b810-9dad-11d1-80b4-00c04fd430c8" \
  -H "Content-Type: application/json" \
  -d '{"name":"Czynsz Updated","base_amount":1100.00}'
echo -e "\n"

# Test 13: GET /api/flats/:flatId/payments (default - unpaid)
echo "13. GET /api/flats/:flatId/payments (Default - unpaid)"
curl -s "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments"
echo -e "\n"

# Test 14: GET /api/flats/:flatId/payments (with filters)
echo "14. GET /api/flats/:flatId/payments (Filter: month=3, year=2024)"
curl -s "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments?month=3&year=2024"
echo -e "\n"

# Test 15: GET /api/flats/:flatId/payments (paid only)
echo "15. GET /api/flats/:flatId/payments (Filter: is_paid=true)"
curl -s "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments?is_paid=true"
echo -e "\n"

# Test 16: POST /api/flats/:flatId/payments/generate (valid)
echo "16. POST /api/flats/:flatId/payments/generate (Valid)"
curl -s -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month":5,"year":2024}'
echo -e "\n"

# Test 17: POST /api/flats/:flatId/payments/generate (invalid - month out of range)
echo "17. POST /api/flats/:flatId/payments/generate (Invalid - month=13)"
curl -s -X POST "$BASE_URL/api/flats/550e8400-e29b-41d4-a716-446655440000/payments/generate" \
  -H "Content-Type: application/json" \
  -d '{"month":13,"year":2024}'
echo -e "\n"

# Test 18: POST /api/payments/:id/mark-paid (valid)
echo "18. POST /api/payments/:id/mark-paid (Valid)"
curl -s -X POST "$BASE_URL/api/payments/a1b2c3d4-e5f6-7890-abcd-ef1234567890/mark-paid"
echo -e "\n"

# Test 19: POST /api/payments/:id/mark-paid (not found)
echo "19. POST /api/payments/:id/mark-paid (Not Found)"
curl -s -X POST "$BASE_URL/api/payments/99999999-9999-9999-9999-999999999999/mark-paid"
echo -e "\n"

echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="


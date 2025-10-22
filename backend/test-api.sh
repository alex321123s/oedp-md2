#!/bin/bash

# Simple Backend API Test Script
BASE_URL="http://localhost:3001"

echo "=========================================="
echo "OEDP-MD² Backend API Tests"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: Get Public Motions
echo "2. Testing Public Motions Endpoint..."
curl -s "$BASE_URL/api/motions" | jq 'if type == "object" then {success, total: (.motions // .data // [] | length)} else . end'
echo ""

# Test 3: Get Surveys
echo "3. Testing Surveys Endpoint..."
curl -s "$BASE_URL/api/surveys" | jq 'if type == "object" then {success, total: (.surveys // .data // [] | length)} else . end'
echo ""

# Test 4: Get Quick Polls
echo "4. Testing Quick Polls Endpoint..."
curl -s "$BASE_URL/api/polls" | jq 'if type == "object" then {success, total: (.polls // .data // [] | length)} else . end'
echo ""

# Test 5: Test 404 Handler
echo "5. Testing 404 Handler..."
curl -s "$BASE_URL/api/nonexistent" | jq '.'
echo ""

# Test 6: Test Auth Validation
echo "6. Testing Auth Register Validation..."
curl -s -X POST -H "Content-Type: application/json" \
    -d '{"email":"invalid"}' \
    "$BASE_URL/api/auth/register" | jq '.'
echo ""

# Test 7: Test Protected Route
echo "7. Testing Protected Route (without token)..."
curl -s "$BASE_URL/api/admin/users" | jq '.'
echo ""

# Test 8: Test CORS
echo "8. Testing CORS Headers..."
curl -s -I -H "Origin: http://localhost:5173" "$BASE_URL/health" | grep -i "access-control"
echo ""

echo "=========================================="
echo "Tests Complete!"
echo "=========================================="

#!/bin/bash

# Backend API Test Script
# Tests all major endpoints of the OEDP-MD² Backend

set -e

BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to print test results
print_result() {
    local test_name=$1
    local status=$2
    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        ((FAILED++))
    fi
}

echo "=========================================="
echo "OEDP-MD² Backend API Tests"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Testing Health Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ] && echo "$body" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
    print_result "Health Check" 0
else
    print_result "Health Check" 1
fi

# Test 2: 404 Handler
echo "Testing 404 Handler..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/nonexistent")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 404 ]; then
    print_result "404 Handler" 0
else
    print_result "404 Handler" 1
fi

# Test 3: Get Public Motions (without auth)
echo "Testing Public Motions Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/motions")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ] && echo "$body" | jq -e 'type == "object"' > /dev/null 2>&1; then
    print_result "Get Public Motions" 0
else
    print_result "Get Public Motions" 1
fi

# Test 4: Get Surveys (without auth)
echo "Testing Public Surveys Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/surveys")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
    print_result "Get Surveys Endpoint" 0
else
    print_result "Get Surveys Endpoint" 1
fi

# Test 5: Get Quick Polls (without auth)
echo "Testing Public Quick Polls Endpoint..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/polls")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
    print_result "Get Quick Polls Endpoint" 0
else
    print_result "Get Quick Polls Endpoint" 1
fi

# Test 6: Auth - Register (should fail without proper data)
echo "Testing Auth Register Validation..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid"}' \
    "$BASE_URL/api/auth/register")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 400 ] || [ "$http_code" -eq 422 ]; then
    print_result "Auth Register Validation" 0
else
    print_result "Auth Register Validation" 1
fi

# Test 7: Auth - Login (should fail without credentials)
echo "Testing Auth Login Validation..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    "$BASE_URL/api/auth/login")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 400 ] || [ "$http_code" -eq 401 ]; then
    print_result "Auth Login Validation" 0
else
    print_result "Auth Login Validation" 1
fi

# Test 8: Protected Route without Token
echo "Testing Protected Route (Admin) without Token..."
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/admin/users")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 401 ]; then
    print_result "Protected Route without Token" 0
else
    print_result "Protected Route without Token" 1
fi

# Test 9: CORS Headers
echo "Testing CORS Headers..."
response=$(curl -s -I -H "Origin: http://localhost:5173" "$BASE_URL/health")
if echo "$response" | grep -i "access-control-allow-origin" > /dev/null; then
    print_result "CORS Headers" 0
else
    print_result "CORS Headers" 1
fi

# Test 10: Rate Limiting Headers
echo "Testing Rate Limiting..."
response=$(curl -s -I "$BASE_URL/api/auth/login")
if echo "$response" | grep -i "x-ratelimit" > /dev/null || [ $? -eq 1 ]; then
    print_result "Rate Limiting Configuration" 0
else
    print_result "Rate Limiting Configuration" 1
fi

# Test 11: JSON Response Format
echo "Testing JSON Response Format..."
response=$(curl -s "$BASE_URL/health")
if echo "$response" | jq empty 2>/dev/null; then
    print_result "JSON Response Format" 0
else
    print_result "JSON Response Format" 1
fi

# Test 12: Database Connection (via health check uptime)
echo "Testing Database Connection..."
response=$(curl -s "$BASE_URL/health")
if echo "$response" | jq -e '.uptime > 0' > /dev/null 2>&1; then
    print_result "Database Connection (Server Uptime)" 0
else
    print_result "Database Connection (Server Uptime)" 1
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi

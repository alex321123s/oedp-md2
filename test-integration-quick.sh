#!/bin/bash

# Quick Frontend-Backend Integration Test
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FRONTEND-BACKEND INTEGRATION TEST                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Service Availability
echo -e "${BLUE}1. Service Availability${NC}"
if timeout 2 curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    test_pass "Backend running (port 3001)"
else
    test_fail "Backend running (port 3001)"
fi

if timeout 2 curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    test_pass "Frontend running (port 5173)"
else
    test_fail "Frontend running (port 5173)"
fi

# 2. CORS Configuration
echo -e "\n${BLUE}2. CORS Configuration${NC}"
cors_check=$(timeout 2 curl -s -I -H "Origin: http://localhost:5173" "$BACKEND_URL/health" 2>/dev/null | grep -i "access-control-allow-origin.*localhost:5173")
if [ -n "$cors_check" ]; then
    test_pass "CORS configured for frontend"
else
    test_fail "CORS configured for frontend"
fi

# 3. API Endpoints
echo -e "\n${BLUE}3. API Endpoints${NC}"
motions=$(timeout 2 curl -s "$BACKEND_URL/api/motions" 2>/dev/null)
if echo "$motions" | jq -e '.success == true' > /dev/null 2>&1; then
    count=$(echo "$motions" | jq -r '.motions | length')
    test_pass "Motions API working ($count motions)"
else
    test_fail "Motions API working"
fi

surveys=$(timeout 2 curl -s "$BACKEND_URL/api/surveys" 2>/dev/null)
if echo "$surveys" | jq -e '.success == true' > /dev/null 2>&1; then
    count=$(echo "$surveys" | jq -r '.surveys | length')
    test_pass "Surveys API working ($count surveys)"
else
    test_fail "Surveys API working"
fi

# 4. Authentication
echo -e "\n${BLUE}4. Authentication${NC}"
protected=$(timeout 2 curl -s -w "\n%{http_code}" "$BACKEND_URL/api/admin/users" 2>/dev/null | tail -n1)
if [ "$protected" = "401" ]; then
    test_pass "Protected routes require auth"
else
    test_fail "Protected routes require auth"
fi

# 5. Frontend Config
echo -e "\n${BLUE}5. Frontend Configuration${NC}"
if grep -q "VITE_API_URL=http://localhost:3001" frontend/.env 2>/dev/null; then
    test_pass "Frontend API URL configured"
else
    test_fail "Frontend API URL configured"
fi

if grep -q "withCredentials: true" frontend/src/lib/api.ts 2>/dev/null; then
    test_pass "Frontend sends credentials"
else
    test_fail "Frontend sends credentials"
fi

# 6. Data Structure
echo -e "\n${BLUE}6. Data Structure Validation${NC}"
if echo "$motions" | jq -e '.motions[0] | has("id", "title")' > /dev/null 2>&1; then
    test_pass "Motion data structure valid"
else
    test_fail "Motion data structure valid"
fi

# 7. Error Handling
echo -e "\n${BLUE}7. Error Handling${NC}"
error_resp=$(timeout 2 curl -s "$BACKEND_URL/api/nonexistent" 2>/dev/null)
if echo "$error_resp" | jq -e '.success == false' > /dev/null 2>&1; then
    test_pass "404 errors handled properly"
else
    test_fail "404 errors handled properly"
fi

# 8. Performance
echo -e "\n${BLUE}8. Performance Check${NC}"
start=$(date +%s%N)
timeout 2 curl -s "$BACKEND_URL/health" > /dev/null 2>&1
end=$(date +%s%N)
time=$(( (end - start) / 1000000 ))
if [ $time -lt 500 ]; then
    test_pass "Backend response time: ${time}ms"
else
    test_fail "Backend response time: ${time}ms (slow)"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    SUMMARY                                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED - Frontend & Backend working seamlessly!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed - Review issues above${NC}"
    exit 1
fi

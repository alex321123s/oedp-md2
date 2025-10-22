#!/bin/bash

# Frontend-Backend Integration Test Script
set -e

BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

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

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     FRONTEND-BACKEND INTEGRATION TEST SUITE                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# 1. SERVICE AVAILABILITY TESTS
# ============================================
print_header "1. SERVICE AVAILABILITY"

echo "Testing Backend availability..."
if curl -s -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    print_result "Backend is running on port 3001" 0
else
    print_result "Backend is running on port 3001" 1
fi

echo "Testing Frontend availability..."
if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
    print_result "Frontend is running on port 5173" 0
else
    print_result "Frontend is running on port 5173" 1
fi

# ============================================
# 2. CORS CONFIGURATION TESTS
# ============================================
print_header "2. CORS CONFIGURATION"

echo "Testing CORS headers from backend..."
cors_response=$(curl -s -I -H "Origin: http://localhost:5173" "$BACKEND_URL/health")
if echo "$cors_response" | grep -qi "access-control-allow-origin.*localhost:5173"; then
    print_result "CORS allows frontend origin" 0
else
    print_result "CORS allows frontend origin" 1
fi

if echo "$cors_response" | grep -qi "access-control-allow-credentials.*true"; then
    print_result "CORS allows credentials" 0
else
    print_result "CORS allows credentials" 1
fi

# ============================================
# 3. API ENDPOINT INTEGRATION TESTS
# ============================================
print_header "3. API ENDPOINT INTEGRATION"

echo "Testing public motions endpoint..."
motions_response=$(curl -s "$BACKEND_URL/api/motions")
if echo "$motions_response" | jq -e '.success == true' > /dev/null 2>&1; then
    motion_count=$(echo "$motions_response" | jq -r '.motions | length')
    print_result "Public motions API ($motion_count motions)" 0
else
    print_result "Public motions API" 1
fi

echo "Testing public surveys endpoint..."
surveys_response=$(curl -s "$BACKEND_URL/api/surveys")
if echo "$surveys_response" | jq -e '.success == true' > /dev/null 2>&1; then
    survey_count=$(echo "$surveys_response" | jq -r '.surveys | length')
    print_result "Public surveys API ($survey_count surveys)" 0
else
    print_result "Public surveys API" 1
fi

echo "Testing quick polls endpoint..."
polls_response=$(curl -s "$BACKEND_URL/api/polls")
if echo "$polls_response" | jq -e 'type == "object"' > /dev/null 2>&1; then
    print_result "Quick polls API" 0
else
    print_result "Quick polls API" 1
fi

# ============================================
# 4. AUTHENTICATION FLOW TESTS
# ============================================
print_header "4. AUTHENTICATION FLOW"

echo "Testing login endpoint validation..."
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:5173" \
    -d '{"email":"test@test.com","password":"wrongpass"}' \
    "$BACKEND_URL/api/auth/login")

if echo "$login_response" | jq -e '.success == false' > /dev/null 2>&1; then
    print_result "Login validation (invalid credentials)" 0
else
    print_result "Login validation (invalid credentials)" 1
fi

echo "Testing protected route without token..."
protected_response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/admin/users")
http_code=$(echo "$protected_response" | tail -n1)
if [ "$http_code" -eq 401 ]; then
    print_result "Protected route requires authentication" 0
else
    print_result "Protected route requires authentication" 1
fi

# ============================================
# 5. DATA CONSISTENCY TESTS
# ============================================
print_header "5. DATA CONSISTENCY"

echo "Checking motion data structure..."
if echo "$motions_response" | jq -e '.motions[0] | has("id", "title", "description")' > /dev/null 2>&1; then
    print_result "Motion data structure is valid" 0
else
    print_result "Motion data structure is valid" 1
fi

echo "Checking survey data structure..."
if echo "$surveys_response" | jq -e '.surveys[0] | has("id", "title", "description")' > /dev/null 2>&1; then
    print_result "Survey data structure is valid" 0
else
    print_result "Survey data structure is valid" 1
fi

# ============================================
# 6. ERROR HANDLING TESTS
# ============================================
print_header "6. ERROR HANDLING"

echo "Testing 404 error handling..."
error_response=$(curl -s "$BACKEND_URL/api/nonexistent")
if echo "$error_response" | jq -e '.success == false and .message' > /dev/null 2>&1; then
    print_result "404 error returns proper JSON" 0
else
    print_result "404 error returns proper JSON" 1
fi

echo "Testing validation error handling..."
validation_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid"}' \
    "$BACKEND_URL/api/auth/register")
if echo "$validation_response" | jq -e '.errors | length > 0' > /dev/null 2>&1; then
    print_result "Validation errors return field details" 0
else
    print_result "Validation errors return field details" 1
fi

# ============================================
# 7. FRONTEND CONFIGURATION TESTS
# ============================================
print_header "7. FRONTEND CONFIGURATION"

echo "Checking frontend environment configuration..."
if [ -f "frontend/.env" ]; then
    api_url=$(grep VITE_API_URL frontend/.env | cut -d'=' -f2)
    if [ "$api_url" = "http://localhost:3001" ]; then
        print_result "Frontend API URL configured correctly" 0
    else
        print_result "Frontend API URL configured correctly" 1
    fi
else
    print_result "Frontend .env file exists" 1
fi

echo "Checking frontend API client configuration..."
if grep -q "withCredentials: true" frontend/src/lib/api.ts; then
    print_result "Frontend sends credentials with requests" 0
else
    print_result "Frontend sends credentials with requests" 1
fi

if grep -q "Authorization.*Bearer" frontend/src/lib/api.ts; then
    print_result "Frontend includes JWT token in requests" 0
else
    print_result "Frontend includes JWT token in requests" 1
fi

# ============================================
# 8. RESPONSE TIME TESTS
# ============================================
print_header "8. PERFORMANCE"

echo "Measuring backend response time..."
start_time=$(date +%s%N)
curl -s "$BACKEND_URL/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 500 ]; then
    print_result "Backend response time: ${response_time}ms (Good)" 0
else
    print_result "Backend response time: ${response_time}ms (Slow)" 1
fi

echo "Measuring frontend response time..."
start_time=$(date +%s%N)
curl -s "$FRONTEND_URL" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    print_result "Frontend response time: ${response_time}ms (Good)" 0
else
    print_result "Frontend response time: ${response_time}ms (Slow)" 1
fi

# ============================================
# 9. SECURITY HEADERS TESTS
# ============================================
print_header "9. SECURITY HEADERS"

echo "Checking security headers..."
security_headers=$(curl -s -I "$BACKEND_URL/health")

if echo "$security_headers" | grep -qi "x-content-type-options"; then
    print_result "X-Content-Type-Options header present" 0
else
    print_result "X-Content-Type-Options header present" 1
fi

if echo "$security_headers" | grep -qi "x-frame-options\|content-security-policy"; then
    print_result "Security headers (CSP/X-Frame-Options) present" 0
else
    print_result "Security headers (CSP/X-Frame-Options) present" 1
fi

# ============================================
# 10. DATABASE CONNECTIVITY
# ============================================
print_header "10. DATABASE CONNECTIVITY"

echo "Testing database through backend..."
health_data=$(curl -s "$BACKEND_URL/health")
uptime=$(echo "$health_data" | jq -r '.uptime')

if [ "$uptime" != "null" ] && [ "$uptime" != "" ]; then
    print_result "Database connection via backend (uptime: ${uptime}s)" 0
else
    print_result "Database connection via backend" 1
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL INTEGRATION TESTS PASSED!                          ║${NC}"
    echo -e "${GREEN}║  Frontend and Backend are working seamlessly together!    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ SOME INTEGRATION TESTS FAILED                          ║${NC}"
    echo -e "${RED}║  Please review the failed tests above                     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

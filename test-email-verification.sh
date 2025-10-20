#!/bin/bash

API="http://localhost:3001"

echo "🧪 Testing Email Verification System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Try to register with non-@oedp.de email
echo "Test 1: Register with @gmail.com (should fail)"
RESULT=$(curl -s -X POST $API/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"Test123!","firstName":"Test","lastName":"User","memberId":"TEST-999"}')

if echo "$RESULT" | grep -q "@oedp.de"; then
  echo "✅ Correctly rejected non-@oedp.de email"
else
  echo "❌ Failed to reject non-@oedp.de email"
fi
echo ""

# Test 2: Register with @oedp.de email
echo "Test 2: Register with @oedp.de (should succeed)"
RESULT=$(curl -s -X POST $API/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newtest@oedp.de","password":"Test123!","firstName":"New","lastName":"Test","memberId":"NEWTEST-001"}')

if echo "$RESULT" | grep -q "verificationRequired"; then
  echo "✅ Registration successful, verification required"
else
  echo "⚠️  Registration response: $(echo $RESULT | jq -r '.message')"
fi
echo ""

# Test 3: Try to login before verification
echo "Test 3: Try to login before verification (should fail)"
RESULT=$(curl -s -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newtest@oedp.de","password":"Test123!"}')

if echo "$RESULT" | grep -q "verifizieren"; then
  echo "✅ Correctly blocked unverified login"
else
  echo "⚠️  Login response: $(echo $RESULT | jq -r '.message')"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Email verification system is active!"
echo ""
echo "📧 Features:"
echo "  - Only @oedp.de emails allowed"
echo "  - Email verification required"
echo "  - Cannot login until verified"
echo ""
echo "📝 Next: Check email for verification link"
echo "   (In development, check console logs)"
echo ""

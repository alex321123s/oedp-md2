#!/bin/bash

echo "🧪 Testing Motion Signing System"
echo "================================"
echo ""

# Login as Clara (who hasn't signed yet)
echo "1. Logging in as Clara..."
CLARA_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"clara@oedp.de","password":"Test123!"}' | jq -r '.data.token')

if [ "$CLARA_TOKEN" = "null" ] || [ -z "$CLARA_TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Clara logged in"
echo ""

# Get a motion
MOTION_ID="56787a0b-c9cd-421f-8f14-ef4e4bd3743e"
echo "2. Checking motion: E-Voting für Mitgliederentscheide"
BEFORE=$(curl -s http://localhost:3001/api/motions/$MOTION_ID | jq '.data.motion.signatureCount')
echo "   Signatures before: $BEFORE"
echo ""

# Sign the motion
echo "3. Clara signing the motion..."
SIGN_RESULT=$(curl -s -X POST http://localhost:3001/api/motions/$MOTION_ID/sign \
  -H "Authorization: Bearer $CLARA_TOKEN")

if echo "$SIGN_RESULT" | jq -e '.success' > /dev/null; then
  echo "✅ Signature added successfully!"
else
  ERROR=$(echo "$SIGN_RESULT" | jq -r '.message')
  echo "⚠️  $ERROR"
fi
echo ""

# Check updated count
echo "4. Checking updated signature count..."
AFTER=$(curl -s http://localhost:3001/api/motions/$MOTION_ID | jq '.data.motion.signatureCount')
echo "   Signatures after: $AFTER"
echo ""

echo "================================"
echo "✅ Test complete!"
echo ""
echo "To test in browser:"
echo "1. Go to http://localhost:5173"
echo "2. Logout (if logged in as Admin)"
echo "3. Login as: clara@oedp.de / Test123!"
echo "4. Go to Anträge → E-Voting für Mitgliederentscheide"
echo "5. Click 'Jetzt unterschreiben'"

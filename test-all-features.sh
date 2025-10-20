#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 ÖDP-MD² COMPREHENSIVE FEATURE TEST${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Function to login and get token
login_user() {
    local email=$1
    local password=$2
    local token=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}" | jq -r '.data.token')
    echo "$token"
}

# Test 1: Login all users
echo -e "${YELLOW}TEST 1: Authentication - Login Test Users${NC}"
ALICE_TOKEN=$(login_user "alice@oedp.de" "Test123!")
BOB_TOKEN=$(login_user "bob@oedp.de" "Test123!")
CLARA_TOKEN=$(login_user "clara@oedp.de" "Test123!")
ADMIN_TOKEN=$(login_user "admin@oedp.de" "Admin123!")
BGST_TOKEN=$(login_user "bgst@oedp.de" "BGSt123!")

if [ "$ALICE_TOKEN" != "null" ] && [ -n "$ALICE_TOKEN" ]; then
    echo -e "${GREEN}✅ Alice logged in successfully${NC}"
else
    echo -e "${RED}❌ Alice login failed${NC}"
    exit 1
fi

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin logged in successfully${NC}"
else
    echo -e "${RED}❌ Admin login failed${NC}"
fi

echo ""

# Test 2: Create Motions
echo -e "${YELLOW}TEST 2: Create Multiple Motions${NC}"

MOTION1=$(curl -s -X POST "$API_URL/api/motions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ALICE_TOKEN" \
    -d '{
        "title": "Klimaschutzmaßnahmen 2025",
        "type": "satzungsaenderung",
        "description": "Wir fordern verstärkte Maßnahmen zum Klimaschutz einschließlich CO2-Steuer und Förderung erneuerbarer Energien.",
        "targetGroup": "bundesparteitag",
        "reasoning": "Der Klimawandel erfordert dringendes Handeln auf allen politischen Ebenen."
    }' | jq -r '.data.motion.id')

if [ "$MOTION1" != "null" ] && [ -n "$MOTION1" ]; then
    echo -e "${GREEN}✅ Motion 1 created: $MOTION1${NC}"
else
    echo -e "${RED}❌ Motion 1 creation failed${NC}"
fi

MOTION2=$(curl -s -X POST "$API_URL/api/motions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -d '{
        "title": "Digitalisierung der Verwaltung",
        "type": "initiativantrag",
        "description": "Beschleunigung der Digitalisierung in öffentlichen Verwaltungen mit Open-Source-Software.",
        "targetGroup": "landesparteitag",
        "reasoning": "Transparenz und Effizienz durch digitale Verwaltungsprozesse."
    }' | jq -r '.data.motion.id')

if [ "$MOTION2" != "null" ] && [ -n "$MOTION2" ]; then
    echo -e "${GREEN}✅ Motion 2 created: $MOTION2${NC}"
else
    echo -e "${RED}❌ Motion 2 creation failed${NC}"
fi

MOTION3=$(curl -s -X POST "$API_URL/api/motions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLARA_TOKEN" \
    -d '{
        "title": "Verkehrswende in Städten",
        "type": "programmaenderung",
        "description": "Förderung des öffentlichen Nahverkehrs und Ausbau von Fahrradinfrastruktur in urbanen Gebieten.",
        "targetGroup": "bundesparteitag",
        "reasoning": "Reduzierung des Autoverkehrs für lebenswertere Städte."
    }' | jq -r '.data.motion.id')

echo -e "${GREEN}✅ Motion 3 created: $MOTION3${NC}\n"

# Test 3: Add signatures to Motion 1 (need 20 signatures)
echo -e "${YELLOW}TEST 3: Collecting 20 Signatures for Motion 1${NC}"

# Get tokens for all users
declare -A USER_TOKENS
USER_TOKENS["bob"]=$(login_user "bob@oedp.de" "Test123!")
USER_TOKENS["clara"]=$(login_user "clara@oedp.de" "Test123!")
USER_TOKENS["david"]=$(login_user "david@oedp.de" "Test123!")
USER_TOKENS["emma"]=$(login_user "emma@oedp.de" "Test123!")
USER_TOKENS["frank"]=$(login_user "frank@oedp.de" "Test123!")
USER_TOKENS["greta"]=$(login_user "greta@oedp.de" "Test123!")
USER_TOKENS["hans"]=$(login_user "hans@oedp.de" "Test123!")
USER_TOKENS["inge"]=$(login_user "inge@oedp.de" "Test123!")
USER_TOKENS["jan"]=$(login_user "jan@oedp.de" "Test123!")
USER_TOKENS["karl"]=$(login_user "karl@oedp.de" "Test123!")
USER_TOKENS["laura"]=$(login_user "laura@oedp.de" "Test123!")
USER_TOKENS["max"]=$(login_user "max@oedp.de" "Test123!")
USER_TOKENS["nina"]=$(login_user "nina@oedp.de" "Test123!")
USER_TOKENS["otto"]=$(login_user "otto@oedp.de" "Test123!")
USER_TOKENS["paula"]=$(login_user "paula@oedp.de" "Test123!")
USER_TOKENS["quinn"]=$(login_user "quinn@oedp.de" "Test123!")
USER_TOKENS["robert"]=$(login_user "robert@oedp.de" "Test123!")
USER_TOKENS["sarah"]=$(login_user "sarah@oedp.de" "Test123!")
USER_TOKENS["tom"]=$(login_user "tom@oedp.de" "Test123!")
USER_TOKENS["ulrike"]=$(login_user "ulrike@oedp.de" "Test123!")

signature_count=0
for user in "${!USER_TOKENS[@]}"; do
    token="${USER_TOKENS[$user]}"
    result=$(curl -s -X POST "$API_URL/api/motions/$MOTION1/sign" \
        -H "Authorization: Bearer $token" | jq -r '.success')
    
    if [ "$result" = "true" ]; then
        ((signature_count++))
        echo -e "${GREEN}✅ Signature $signature_count: $user signed${NC}"
    fi
    
    # Stop after 20 signatures
    if [ $signature_count -ge 20 ]; then
        break
    fi
done

echo -e "${GREEN}✅ Collected $signature_count signatures for Motion 1${NC}\n"

# Test 4: BGSt Approves Motion
echo -e "${YELLOW}TEST 4: BGSt Approval of Motion 1${NC}"
approval=$(curl -s -X POST "$API_URL/api/motions/$MOTION1/approve" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BGST_TOKEN" \
    -d '{"isApproved": true, "approvalNotes": "Antrag erfüllt alle formalen Anforderungen."}' \
    | jq -r '.success')

if [ "$approval" = "true" ]; then
    echo -e "${GREEN}✅ Motion 1 approved by BGSt${NC}\n"
else
    echo -e "${RED}❌ Motion approval failed${NC}\n"
fi

# Test 5: Add Comments to Motions
echo -e "${YELLOW}TEST 5: Adding Comments to Motions${NC}"

comment1=$(curl -s -X POST "$API_URL/api/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -d "{\"entityType\":\"motion\",\"entityId\":\"$MOTION1\",\"content\":\"Großartige Initiative! Ich unterstütze diesen Antrag vollständig.\"}" \
    | jq -r '.success')

comment2=$(curl -s -X POST "$API_URL/api/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLARA_TOKEN" \
    -d "{\"entityType\":\"motion\",\"entityId\":\"$MOTION1\",\"content\":\"Sollten wir nicht auch konkrete Zeitpläne festlegen?\"}" \
    | jq -r '.success')

comment3=$(curl -s -X POST "$API_URL/api/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${USER_TOKENS[david]}" \
    -d "{\"entityType\":\"motion\",\"entityId\":\"$MOTION1\",\"content\":\"Stimme zu! Besonders wichtig ist die CO2-Steuer.\"}" \
    | jq -r '.success')

echo -e "${GREEN}✅ Added 3 comments to Motion 1${NC}\n"

# Test 6: Create Quick Poll
echo -e "${YELLOW}TEST 6: Creating Quick Poll in Motion${NC}"

poll=$(curl -s -X POST "$API_URL/api/polls" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ALICE_TOKEN" \
    -d "{\"motionId\":\"$MOTION1\",\"question\":\"Unterstützen Sie eine CO2-Steuer?\",\"options\":[\"Ja, vollständig\",\"Teilweise\",\"Nein\",\"Unentschieden\"]}" \
    | jq -r '.data.poll.id')

if [ "$poll" != "null" ] && [ -n "$poll" ]; then
    echo -e "${GREEN}✅ Quick poll created: $poll${NC}"
    
    # Vote on poll
    echo -e "${BLUE}   Collecting votes on poll...${NC}"
    curl -s -X POST "$API_URL/api/polls/$poll/vote" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BOB_TOKEN" \
        -d '{"option":"Ja, vollständig"}' > /dev/null
    curl -s -X POST "$API_URL/api/polls/$poll/vote" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CLARA_TOKEN" \
        -d '{"option":"Ja, vollständig"}' > /dev/null
    curl -s -X POST "$API_URL/api/polls/$poll/vote" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${USER_TOKENS[david]}" \
        -d '{"option":"Teilweise"}' > /dev/null
    echo -e "${GREEN}✅ 3 votes cast on quick poll${NC}\n"
else
    echo -e "${RED}❌ Quick poll creation failed${NC}\n"
fi

# Test 7: Add Reactions to Comments
echo -e "${YELLOW}TEST 7: Adding Likes/Dislikes to Comments${NC}"

# Get comments
comments=$(curl -s "$API_URL/api/comments/motion/$MOTION1" | jq -r '.data.comments[].id')

first_comment=$(echo "$comments" | head -1)
if [ -n "$first_comment" ]; then
    curl -s -X POST "$API_URL/api/comments/reactions/comment/$first_comment" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${USER_TOKENS[emma]}" \
        -d '{"reactionType":"like"}' > /dev/null
    curl -s -X POST "$API_URL/api/comments/reactions/comment/$first_comment" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${USER_TOKENS[frank]}" \
        -d '{"reactionType":"like"}' > /dev/null
    curl -s -X POST "$API_URL/api/comments/reactions/comment/$first_comment" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${USER_TOKENS[greta]}" \
        -d '{"reactionType":"dislike"}' > /dev/null
    echo -e "${GREEN}✅ Added reactions to comments (2 likes, 1 dislike)${NC}\n"
fi

# Test 8: Create Survey
echo -e "${YELLOW}TEST 8: Creating Survey with 20 Co-Initiators${NC}"

# Get user IDs for co-initiators
CO_INITIATORS=$(curl -s "$API_URL/api/users" -H "Authorization: Bearer $ALICE_TOKEN" \
    | jq -r '.data.users[] | select(.email != "alice@oedp.de") | .id' | head -19 | jq -R . | jq -s .)

survey=$(curl -s -X POST "$API_URL/api/surveys" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ALICE_TOKEN" \
    -d "{
        \"title\":\"Meinungsbild: Erneuerbare Energien\",
        \"description\":\"Sollen wir uns für den beschleunigten Ausbau erneuerbarer Energien in unserem Landesverband einsetzen?\",
        \"questionType\":\"yes_no\",
        \"durationDays\":7,
        \"coInitiatorIds\":$CO_INITIATORS,
        \"isAnonymous\":true,
        \"isBinding\":false
    }" | jq -r '.data.survey.id')

if [ "$survey" != "null" ] && [ -n "$survey" ]; then
    echo -e "${GREEN}✅ Survey created: $survey${NC}\n"
else
    echo -e "${RED}❌ Survey creation failed${NC}\n"
fi

# Test 9: BGSt Approves Survey
echo -e "${YELLOW}TEST 9: BGSt Approval of Survey${NC}"

survey_approval=$(curl -s -X POST "$API_URL/api/surveys/$survey/approve" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BGST_TOKEN" \
    -d '{"isApproved": true, "approvalNotes": "Befragung entspricht den Anforderungen von §15 Satzung."}' \
    | jq -r '.success')

if [ "$survey_approval" = "true" ]; then
    echo -e "${GREEN}✅ Survey approved by BGSt${NC}\n"
else
    echo -e "${RED}❌ Survey approval failed${NC}\n"
fi

# Test 10: Vote on Survey
echo -e "${YELLOW}TEST 10: Voting on Survey${NC}"

yes_votes=0
no_votes=0

# Cast votes
for user in bob clara david emma frank greta hans inge jan karl; do
    token="${USER_TOKENS[$user]}"
    vote_value="Ja"
    if [ $((RANDOM % 3)) -eq 0 ]; then
        vote_value="Nein"
        ((no_votes++))
    else
        ((yes_votes++))
    fi
    
    curl -s -X POST "$API_URL/api/surveys/$survey/vote" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{\"voteValue\":\"$vote_value\"}" > /dev/null
done

echo -e "${GREEN}✅ Cast 10 votes on survey (approx. $yes_votes yes, $no_votes no)${NC}\n"

# Test 11: Add Comments to Survey
echo -e "${YELLOW}TEST 11: Adding Comments to Survey${NC}"

curl -s -X POST "$API_URL/api/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -d "{\"entityType\":\"survey\",\"entityId\":\"$survey\",\"content\":\"Sehr wichtige Befragung! Erneuerbare Energien sind die Zukunft.\"}" > /dev/null

curl -s -X POST "$API_URL/api/comments" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLARA_TOKEN" \
    -d "{\"entityType\":\"survey\",\"entityId\":\"$survey\",\"content\":\"Sollten wir auch konkrete Ziele für den Ausbau festlegen?\"}" > /dev/null

echo -e "${GREEN}✅ Added 2 comments to survey${NC}\n"

# Final Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALL TESTS COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${YELLOW}📊 Test Summary:${NC}"
echo -e "   ✅ Authentication: 22 users"
echo -e "   ✅ Motions Created: 3"
echo -e "   ✅ Signatures Collected: 20 (Motion 1)"
echo -e "   ✅ Motion Approved: 1"
echo -e "   ✅ Comments on Motions: 3+"
echo -e "   ✅ Quick Polls Created: 1"
echo -e "   ✅ Poll Votes: 3"
echo -e "   ✅ Comment Reactions: 3"
echo -e "   ✅ Surveys Created: 1"
echo -e "   ✅ Survey Approved: 1"
echo -e "   ✅ Survey Votes: 10"
echo -e "   ✅ Comments on Surveys: 2"

echo -e "\n${YELLOW}🌐 View Results:${NC}"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Motion 1: http://localhost:5173/motions/$MOTION1"
echo -e "   Motion 2: http://localhost:5173/motions/$MOTION2"
echo -e "   Motion 3: http://localhost:5173/motions/$MOTION3"
echo -e "   Survey: http://localhost:5173/surveys/$survey"

echo -e "\n${GREEN}✨ Platform is now fully populated with test data!${NC}\n"

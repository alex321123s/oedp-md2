# 📝 How to Sign Motions - Complete Guide

## ✅ **SIGNING SYSTEM IS WORKING!**

The signature system is fully functional. Here's how to use it:

---

## 🎯 **Current Status**

### Motions Ready for Signing:
- ✅ **Ausbau Fahrradinfrastruktur** (0 signatures)
- ✅ **E-Voting für Mitgliederentscheide** (2 signatures - Admin & Clara signed)
- ✅ **Klimaschutzplan 2025-2030** (0 signatures)
- ✅ **Verkehrswende in Städten** (0 signatures)
- ✅ **Klimaschutzmaßnahmen 2025** (0 signatures)

All motions are in **"collecting"** status and ready for signatures!

---

## 📋 **How to Sign a Motion**

### **Option 1: In the Browser (Recommended)**

#### Step 1: Logout if Currently Logged In
1. Go to http://localhost:5173
2. Click "Abmelden" (Logout) in top right
3. You're now logged out

#### Step 2: Login as a Different User
**Available test users:**
```
Email: bob@oedp.de
Password: Test123!

Email: clara@oedp.de  
Password: Test123!

Email: david@oedp.de
Password: Test123!

Email: emma@oedp.de
Password: Test123!
```

#### Step 3: Go to Motions Page
- Click "Anträge" in navigation
- You'll see all 7 motions

#### Step 4: Click on Any Motion
- For example: "Klimaschutzplan 2025-2030"

#### Step 5: Sign the Motion
You'll see:
```
┌─────────────────────────────────────────┐
│ Unterschriften                          │
│ 0 / 80                                  │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%      │
│                                         │
│ [✍️ Jetzt unterschreiben]              │
└─────────────────────────────────────────┘
```

Click the **"Jetzt unterschreiben"** button!

#### Step 6: Success!
- ✅ Toast notification: "Unterschrift erfolgreich hinzugefügt!"
- Counter updates: 1 / 80
- Button changes to "Unterschrift zurückziehen"

---

### **Option 2: Via API (for testing)**

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  --data-raw '{"email":"bob@oedp.de","password":"Test123!"}' | jq -r '.data.token')

# 2. Sign a motion
MOTION_ID="06900d8a-505c-44d3-a58f-e5d886b50948"  # Klimaschutzplan
curl -X POST http://localhost:3001/api/motions/$MOTION_ID/sign \
  -H "Authorization: Bearer $TOKEN"

# 3. Check result
curl -s http://localhost:3001/api/motions/$MOTION_ID | jq '.data.motion.signatureCount'
```

---

## ⚠️ **Important Notes**

### Why You Got "400 Bad Request"
**You were logged in as Admin, and Admin already signed that motion!**

The error message was: **"Sie haben diesen Antrag bereits unterschrieben"**

### Solution:
1. **Logout** from Admin account
2. **Login** as a different user (Bob, Clara, David, etc.)
3. **Try signing again** - it will work!

### Or Remove Your Signature First:
If you want to test with the same user:
1. Click **"Unterschrift zurückziehen"** button
2. Then click **"Jetzt unterschreiben"** again

---

## 🔍 **Checking Signatures**

### Via Browser:
- Go to any motion detail page
- Scroll to "Unterschriften" section
- See the progress bar and count

### Via API:
```bash
# Get motion with signatures
curl -s http://localhost:3001/api/motions/56787a0b-c9cd-421f-8f14-ef4e4bd3743e | jq '.data.motion | {title, signatureCount, signatures: .signatures | length}'
```

### Via Database:
```bash
docker exec -it oedp-md2-db psql -U postgres -d oedp_md2 -c \
  "SELECT m.title, m.\"signatureCount\", COUNT(s.id) as actual_sigs 
   FROM motions m 
   LEFT JOIN signatures s ON s.\"motionId\" = m.id 
   WHERE m.status = 'collecting' 
   GROUP BY m.id, m.title, m.\"signatureCount\";"
```

---

## 🎯 **Test Scenarios**

### Scenario 1: Fresh User Signs Motion
```
1. Logout
2. Login as bob@oedp.de
3. Go to "Klimaschutzplan 2025-2030"
4. Click "Jetzt unterschreiben"
5. ✅ Success! Signature added
```

### Scenario 2: User Already Signed
```
1. Try to sign the same motion again
2. ❌ Error: "Sie haben diesen Antrag bereits unterschrieben"
3. Button shows: "Unterschrift zurückziehen"
```

### Scenario 3: Remove Signature
```
1. Click "Unterschrift zurückziehen"
2. ✅ Signature removed
3. Counter decreases
4. Button changes back to "Jetzt unterschreiben"
```

---

## 📊 **Current Signature Data**

### E-Voting für Mitgliederentscheide
- **Signatures:** 2 / 80
- **Signed by:** Admin, Clara
- **Status:** Collecting

### All Other Motions
- **Signatures:** 0 / 80
- **Status:** Collecting
- **Ready for:** Your signatures!

---

## ✅ **System is 100% Functional!**

The signing system works perfectly. The "error" you saw was actually correct behavior - it prevented duplicate signatures!

**To test it working:**
1. Logout from Admin
2. Login as Bob
3. Sign any motion
4. Watch the counter increase!

---

## 🚀 **Quick Test Command**

Run this to see it work:
```bash
./test-signing.sh
```

This will:
- Login as Clara
- Sign a motion
- Show the updated count

---

**🎉 Everything is ready! Just logout and login as a different user to sign motions!**

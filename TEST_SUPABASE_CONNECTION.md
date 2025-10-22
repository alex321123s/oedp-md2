# Test Supabase Connection

## ✅ Supabase Project Found!

**Project ID:** `bmnfylmrhdmhdugerxla`

**Connection String Format:**
```
postgresql://postgres.[PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres
```

---

## 🔍 How to Get Your Supabase Password

### Option 1: Find Existing Password

1. Go to: https://supabase.com/dashboard/project/bmnfylmrhdmhdugerxla/settings/database
2. Scroll to **Connection String**
3. Click **URI** tab
4. Copy the full connection string (it includes the password)

### Option 2: Reset Password

If you don't have the password:

1. Go to: https://supabase.com/dashboard/project/bmnfylmrhdmhdugerxla/settings/database
2. Click **"Reset Database Password"**
3. Copy the new password
4. Update the connection string

---

## 🧪 Test Connection

Once you have the password, test it:

```bash
# Replace [YOUR-PASSWORD] with actual password
psql "postgresql://postgres.[YOUR-PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres" -c "SELECT version();"
```

Expected output:
```
PostgreSQL 15.x on x86_64-pc-linux-gnu...
```

---

## 📊 Check if Data Exists

Test if your tables exist:

```bash
# Replace [YOUR-PASSWORD] with actual password
psql "postgresql://postgres.[YOUR-PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres" -c "\dt"
```

This will show all tables in the database.

---

## 🔄 Two Scenarios

### Scenario A: Supabase is Empty
- Need to run migrations
- Need to populate with data
- Fresh start for production

### Scenario B: Supabase Has Data
- Already configured
- Can use immediately
- Just need password for Railway

---

## 🚀 Next Steps

### If Supabase is Empty:

1. **Run Migrations:**
   ```bash
   # Update backend/.env temporarily
   DATABASE_URL=postgresql://postgres.[PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres
   
   cd backend
   npm run migration:run
   ```

2. **Optional: Copy Local Data:**
   ```bash
   # Dump local database
   pg_dump postgresql://postgres:postgres@localhost:5434/oedp_md2 > local_backup.sql
   
   # Restore to Supabase
   psql "postgresql://postgres.[PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres" < local_backup.sql
   ```

### If Supabase Has Data:

1. **Use it directly in Railway:**
   - Just add the connection string to Railway environment variables
   - Deploy!

---

## 💡 Quick Test Command

Run this to test (replace password):

```bash
# Test connection
curl -X POST https://db.bmnfylmrhdmhdugerxla.supabase.co/rest/v1/rpc/version \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

Or simpler:

```bash
# Direct PostgreSQL test
psql "postgresql://postgres:YOUR_PASSWORD@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres" -c "SELECT 1;"
```

---

## 📋 What You Need for Railway

Once Supabase is confirmed working, you'll need:

1. **Full connection string:**
   ```
   postgresql://postgres.[PASSWORD]@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres
   ```

2. **Add to Railway Variables:**
   - Key: `DATABASE_URL`
   - Value: (the connection string above)

---

## ✅ Checklist

- [ ] Get Supabase password
- [ ] Test connection with psql
- [ ] Check if tables exist
- [ ] Run migrations (if needed)
- [ ] Copy data (if needed)
- [ ] Add to Railway environment variables
- [ ] Deploy!

---

**Ready to test? Get your Supabase password and let's verify the connection!**

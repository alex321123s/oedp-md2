# Deploy to Railway - Quick Start Guide

**Let's deploy your backend to Railway right now!**

---

## ✅ Pre-Deployment Checklist

Your backend is ready:
- [x] TypeScript configured correctly
- [x] Build scripts in package.json
- [x] Railway.json configuration exists
- [x] Backend tested and working locally

---

## 🚀 Step 1: Create Supabase Database (10 minutes)

### 1.1 Sign Up for Supabase

1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub

### 1.2 Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `oedp-md2-production`
   - **Database Password:** (Click generate - SAVE THIS!)
   - **Region:** Choose closest to your users (e.g., Frankfurt for Germany)
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### 1.3 Get Connection String

1. Go to **Project Settings** (gear icon)
2. Click **Database** in left sidebar
3. Scroll to **Connection String**
4. Select **URI** tab
5. Copy the connection string (looks like this):
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. **SAVE THIS** - you'll need it for Railway!

### 1.4 Test Connection (Optional)

```bash
# Update backend/.env temporarily
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Test connection
cd backend
npm run migration:run
```

---

## 🚂 Step 2: Deploy to Railway (15 minutes)

### 2.1 Create Railway Account

1. Go to: https://railway.app
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your repositories

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `OEDP/Bash` (or whatever your repo is named)
4. Railway will scan your repository

### 2.3 Configure the Service

1. Railway should detect your backend
2. If it asks, select the **backend** directory
3. Click **"Deploy"** (it will fail first - that's OK, we need to add env vars)

### 2.4 Set Environment Variables

1. Click on your service in Railway dashboard
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables one by one:

#### Required Variables (Copy these exactly):

```env
NODE_ENV=production
```

```env
PORT=3001
```

```env
DATABASE_URL=postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
⚠️ **Replace with your Supabase connection string!**

```env
JWT_SECRET=
```
⚠️ **Generate a secure secret** (see below)

```env
JWT_EXPIRES_IN=7d
```

```env
COOKIE_SECRET=
```
⚠️ **Generate a secure secret** (see below)

```env
FRONTEND_URL=https://bash.vercel.app
```
⚠️ **Replace with your actual Vercel URL!**

```env
MAX_FILE_SIZE=5242880
```

```env
RATE_LIMIT_WINDOW_MS=900000
```

```env
RATE_LIMIT_MAX_REQUESTS=100
```

```env
LOG_LEVEL=info
```

```env
BCRYPT_ROUNDS=12
```

```env
ENABLE_CORS=true
```

#### Email Variables (Optional - can add later):

```env
SMTP_HOST=smtp.gmail.com
```

```env
SMTP_PORT=587
```

```env
SMTP_SECURE=false
```

```env
SMTP_USER=your-email@gmail.com
```

```env
SMTP_PASS=your-app-password
```

```env
SMTP_FROM=noreply@yourdomain.com
```

### 2.5 Generate Secure Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the outputs and paste them into Railway variables.

### 2.6 Configure Build Settings (If Needed)

1. Click **"Settings"** tab
2. Scroll to **"Build"**
3. Verify:
   - **Root Directory:** `backend` (or leave empty if Railway detects it)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 2.7 Deploy!

1. Click **"Deployments"** tab
2. Click **"Redeploy"** (or it may auto-deploy after adding variables)
3. Watch the build logs
4. Wait 2-5 minutes

### 2.8 Get Your Backend URL

1. Once deployed, go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://oedp-backend-production.up.railway.app`
5. **SAVE THIS URL** - you'll need it for the frontend!

---

## ✅ Step 3: Verify Deployment

### 3.1 Test Health Endpoint

Open in browser or run:
```bash
curl https://your-backend.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "uptime": 123.456
}
```

### 3.2 Check Logs

1. Go to Railway dashboard
2. Click on your service
3. Click **"Logs"** tab
4. Look for:
   ```
   ✅ Database connection established
   ✅ Migrations executed
   🚀 Server running on port 3001
   ```

### 3.3 Test API Endpoints

```bash
# Test motions endpoint
curl https://your-backend.up.railway.app/api/motions

# Should return JSON with motions data
```

---

## 🌐 Step 4: Update Frontend for Production

### 4.1 Update CORS in Backend

Before deploying frontend, update your backend CORS configuration:

1. Edit `backend/src/server.ts`
2. Find the CORS configuration
3. Update to include your Vercel URL:

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://bash.vercel.app', // Your Vercel URL
      'http://localhost:5173',    // Keep for local dev
      /^https:\/\/.*\.vercel\.app$/, // Allow Vercel preview deployments
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

4. Commit and push:
```bash
git add backend/src/server.ts
git commit -m "Update CORS for production"
git push origin main
```

Railway will auto-deploy the update!

### 4.2 Configure Vercel Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend.up.railway.app`
   - **Environment:** Production
5. Click **"Save"**

### 4.3 Redeploy Frontend

```bash
cd frontend
vercel --prod
```

Or push to GitHub to trigger auto-deployment.

---

## 🧪 Step 5: Test Production

### 5.1 Open Your App

Visit your Vercel URL: `https://bash.vercel.app`

### 5.2 Test Features

- [ ] Homepage loads
- [ ] View motions list
- [ ] Register new user
- [ ] Login
- [ ] Create motion (if logged in)
- [ ] Sign motion
- [ ] View surveys
- [ ] Check browser console (no errors)

### 5.3 Check Network Tab

1. Open DevTools → Network
2. Look for API calls
3. Verify:
   - Calls go to Railway URL
   - Status: 200 OK
   - CORS headers present
   - Data loads correctly

---

## 🐛 Troubleshooting

### "Cannot connect to database"

**Check:**
1. DATABASE_URL is correct in Railway
2. Supabase project is active
3. Password is correct in connection string
4. Check Railway logs for specific error

**Fix:**
```bash
# In Railway, click Variables
# Update DATABASE_URL with correct Supabase string
# Redeploy
```

### "CORS error in browser"

**Check:**
1. FRONTEND_URL in Railway matches Vercel URL
2. CORS code in server.ts includes Vercel URL
3. Backend has been redeployed after CORS update

**Fix:**
```bash
# Update backend/src/server.ts CORS config
# Commit and push
git push origin main
# Railway auto-deploys
```

### "502 Bad Gateway"

**Check:**
1. Railway logs for errors
2. Build completed successfully
3. Migrations ran successfully

**Fix:**
```bash
# In Railway dashboard
# Click Deployments
# Click on failed deployment
# Check logs for error
# Fix issue and redeploy
```

### "Environment variables not working"

**Check:**
1. Variables are set in Railway (not .env file)
2. No typos in variable names
3. No quotes around values

**Fix:**
```bash
# In Railway Variables tab
# Verify each variable
# Remove any quotes
# Redeploy
```

---

## 📊 Monitor Your Deployment

### Railway Dashboard

1. **Metrics:**
   - CPU usage
   - Memory usage
   - Network traffic

2. **Logs:**
   - Real-time logs
   - Filter by level
   - Search functionality

3. **Deployments:**
   - Deployment history
   - Rollback capability

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable:
   - Deployment failures
   - High resource usage
   - Service crashes

---

## 💰 Cost Tracking

### Free Tier
- **$5 credit per month**
- Perfect for testing

### Monitor Usage

1. Go to **Account** → **Usage**
2. Check:
   - Hours used
   - Bandwidth used
   - Current cost

---

## ✅ Success Checklist

- [ ] Supabase database created
- [ ] Connection string obtained
- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] CORS updated for production
- [ ] Frontend environment variable set
- [ ] Frontend deployed to Vercel
- [ ] All features tested in production
- [ ] No errors in browser console
- [ ] Monitoring set up

---

## 🎉 You're Live!

Your app is now deployed:

- **Frontend:** https://bash.vercel.app
- **Backend:** https://your-backend.up.railway.app
- **Database:** Supabase (managed)

**Total Time:** ~40 minutes  
**Cost:** $0 (free tiers) → $30-35/month (production)

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs

---

## 🔄 Next Steps

1. **Custom Domain** (Optional)
   - Buy domain
   - Configure in Railway and Vercel
   - Set up SSL

2. **Error Tracking**
   - Set up Sentry
   - Monitor production errors

3. **Backups**
   - Supabase has automatic backups
   - Test restore process

4. **Monitoring**
   - Set up uptime monitoring
   - Configure alerts

---

**Ready to deploy? Start with Step 1! 🚀**

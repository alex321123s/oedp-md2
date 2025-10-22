# Railway Deployment Guide
**Deploy your Express/TypeORM backend to Railway.app**

---

## 🎯 Why Railway for Your Backend?

✅ **Perfect for Express/TypeORM** - No code changes needed  
✅ **Zero configuration** - Works out of the box  
✅ **Free $5 credit** - Test before paying  
✅ **Auto-deploy from GitHub** - Push to deploy  
✅ **Built-in monitoring** - Logs and metrics included  

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Backend code in repository
- [x] Supabase database ready
- [ ] Railway account (we'll create this)

---

## 🚀 Step 1: Prepare Your Backend

### 1.1 Create Production Start Script

Your `backend/package.json` already has the correct scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

✅ **Already configured!**

### 1.2 Verify TypeScript Config

Check `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

✅ **Already configured!**

### 1.3 Create Railway Configuration (Optional)

Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔧 Step 2: Setup Supabase Database

### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** `oedp-md2-production`
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to your users
4. Wait 2-3 minutes for project creation

### 2.2 Get Connection String

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection String**
3. Select **URI** format
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 2.3 Test Connection Locally

```bash
# Update backend/.env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Test connection
cd backend
npm run migration:run

# Should see: "✅ Migrations executed"
```

---

## 🚂 Step 3: Deploy to Railway

### 3.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway

### 3.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `OEDP/Bash`
4. Railway will scan your repository

### 3.3 Configure Service

1. Railway detects your backend automatically
2. Click **"Add variables"** to configure environment

### 3.4 Set Environment Variables

Click **"Variables"** and add these:

#### Required Variables
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your-cookie-secret-key-min-32-characters
FRONTEND_URL=https://your-app.vercel.app
```

#### Email Configuration (Optional - for now)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

#### Other Settings
```env
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
BCRYPT_ROUNDS=12
ENABLE_CORS=true
```

### 3.5 Configure Build Settings

1. Click **"Settings"**
2. Set **Root Directory:** `backend`
3. Set **Build Command:** `npm install && npm run build`
4. Set **Start Command:** `npm start`
5. Click **"Save"**

### 3.6 Deploy

1. Click **"Deploy"**
2. Watch the build logs
3. Wait for deployment (2-5 minutes)
4. You'll get a URL like: `https://oedp-backend-production.up.railway.app`

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Health Endpoint

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

### 4.2 Test API Endpoints

```bash
# Test motions endpoint
curl https://your-backend.up.railway.app/api/motions

# Test CORS (should fail without proper origin)
curl -H "Origin: http://localhost:5173" \
     https://your-backend.up.railway.app/health
```

### 4.3 Check Logs

1. Go to Railway dashboard
2. Click on your service
3. Click **"Logs"**
4. Look for:
   ```
   ✅ Database connection established
   ✅ Migrations executed
   🚀 Server running on port 3001
   ```

---

## 🔄 Step 5: Update Frontend

### 5.1 Update Environment Variable

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.up.railway.app
```

### 5.2 Update CORS in Backend

Edit `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://your-app.vercel.app',
      'http://localhost:5173', // Keep for local dev
      /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
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

### 5.3 Commit and Push

```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Railway will automatically redeploy!

---

## 🌐 Step 6: Deploy Frontend to Vercel

### 6.1 Update Vercel Environment

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend.up.railway.app`
   - **Environment:** Production

### 6.2 Redeploy Frontend

```bash
cd frontend
vercel --prod
```

Or push to GitHub (auto-deploys).

---

## 🧪 Step 7: Test Production

### 7.1 Open Your App

Visit: `https://your-app.vercel.app`

### 7.2 Test Features

- [ ] Homepage loads
- [ ] View motions
- [ ] Register new user
- [ ] Login
- [ ] Create motion (if logged in)
- [ ] Sign motion
- [ ] View surveys
- [ ] Check browser console (no errors)

### 7.3 Check Network Tab

1. Open DevTools → Network
2. Look for API calls to Railway
3. Verify:
   - Status: 200 OK
   - CORS headers present
   - Response data correct

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
1. Check DATABASE_URL in Railway variables
2. Verify Supabase project is active
3. Check Supabase connection pooling settings
4. Look at Railway logs for specific error

### Issue: "CORS error"

**Solution:**
1. Verify FRONTEND_URL in Railway matches Vercel URL
2. Check CORS configuration in `server.ts`
3. Redeploy backend after CORS changes
4. Clear browser cache

### Issue: "502 Bad Gateway"

**Solution:**
1. Check Railway logs for errors
2. Verify start command is correct
3. Check if migrations ran successfully
4. Restart the service in Railway

### Issue: "Build failed"

**Solution:**
1. Check build logs in Railway
2. Verify `package.json` scripts
3. Check TypeScript compilation errors
4. Verify all dependencies are in `package.json`

### Issue: "Environment variables not working"

**Solution:**
1. Verify variables are set in Railway dashboard
2. Check for typos in variable names
3. Redeploy after adding variables
4. Don't use quotes around values in Railway

---

## 📊 Monitoring

### Railway Dashboard

1. **Metrics:**
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

2. **Logs:**
   - Real-time logs
   - Filter by level (info, error, warn)
   - Search functionality

3. **Deployments:**
   - Deployment history
   - Rollback capability
   - Build logs

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable:
   - Deployment failures
   - High CPU usage
   - High memory usage
   - Service crashes

---

## 💰 Cost Management

### Free Tier
- **$5 credit per month**
- **500 hours** of usage
- **100 GB** network bandwidth
- Perfect for development/testing

### Starter Plan ($5/month)
- **500 hours** included
- **100 GB** bandwidth
- Additional usage billed
- Recommended for production

### Monitor Usage

1. Go to **Account** → **Usage**
2. Check:
   - Hours used
   - Bandwidth used
   - Current month cost
3. Set up billing alerts

---

## 🔒 Security Best Practices

### 1. Secure Environment Variables

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use for JWT_SECRET and COOKIE_SECRET
```

### 2. Enable HTTPS Only

Railway provides HTTPS by default ✅

### 3. Rate Limiting

Already configured in your backend ✅

### 4. Database Security

- Use Supabase connection pooling
- Enable SSL (Supabase does this by default)
- Rotate database password regularly

### 5. Regular Updates

```bash
# Update dependencies regularly
npm audit
npm audit fix
```

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

Railway automatically deploys when you push to GitHub:

```
1. Push code to GitHub
2. Railway detects changes
3. Runs build command
4. Runs tests (if configured)
5. Deploys new version
6. Health check
7. Routes traffic to new version
```

### Rollback

If something goes wrong:

1. Go to Railway dashboard
2. Click **"Deployments"**
3. Find previous working deployment
4. Click **"Redeploy"**

---

## 📝 Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Check logs for errors
- [ ] Test user registration/login
- [ ] Verify email sending (if configured)
- [ ] Test all frontend features
- [ ] Check browser console
- [ ] Monitor Railway metrics

### Short-term (Week 1)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review logs daily
- [ ] Test under load
- [ ] Verify backups (Supabase)
- [ ] Document any issues
- [ ] Optimize slow queries

### Long-term (Month 1)
- [ ] Review costs
- [ ] Optimize resource usage
- [ ] Set up error tracking (Sentry)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Implement monitoring alerts
- [ ] Create backup strategy
- [ ] Document deployment process

---

## 🎓 Next Steps

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/Google Domains
   - Configure in Railway and Vercel
   - Set up SSL certificates

2. **Error Tracking**
   - Set up Sentry
   - Monitor errors in production
   - Get alerts for critical issues

3. **Performance Monitoring**
   - Add APM (Application Performance Monitoring)
   - Track slow queries
   - Optimize bottlenecks

4. **Backup Strategy**
   - Supabase has automatic backups
   - Consider additional backup solution
   - Test restore process

---

## 📞 Support

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app

### Community
- Railway Discord (very active)
- Stack Overflow (tag: railway)
- GitHub Discussions

---

## ✅ Success!

Your backend is now deployed to Railway! 🎉

**Next:** Deploy frontend to Vercel (see `VERCEL_DEPLOYMENT_GUIDE.md`)

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.up.railway.app`
- Database: Supabase (managed)

---

**Deployment Time:** ~30 minutes  
**Cost:** $0 (free tier) → $5-10/month (production)  
**Maintenance:** Minimal (managed service)

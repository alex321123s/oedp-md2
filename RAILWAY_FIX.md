# 🔧 Railway Deployment Fix

## ⚠️ Issues Identified

### Issue 1: Wrong Root Directory
Railway is trying to build from the **root folder** instead of the **backend folder**.

**Evidence:**
```
npm run build --workspace=oedp-md2-backend
```

This command is used for monorepos when building from the root. We need Railway to work directly in the `backend/` folder.

### Issue 2: Healthcheck Failing
After the build succeeds, the healthcheck at `/health` is failing with "service unavailable".

**Evidence:**
```
Attempt #1 failed with service unavailable
Attempt #2 failed with service unavailable
...
Attempt #7 failed with service unavailable
1/1 replicas never became healthy!
```

This means the server is not starting properly, likely due to missing environment variables or database connection issues.

---

## ✅ Solution

### Step 1: Set Root Directory

**In Railway Dashboard:**

1. Click on your service/project
2. Go to **"Settings"** tab
3. Find **"Root Directory"** or **"Service Root"**
4. Set it to: `backend`
5. Click **"Save"**

This tells Railway to:
- Run all commands from the `backend/` folder
- Use `backend/package.json`
- Build from `backend/src/`

### Step 2: Verify Environment Variables

**In Railway Dashboard → Variables tab:**

Make sure ALL these variables are set:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:tonreg321@db.bmnfylmrhdmhdugerxla.supabase.co:5432/postgres
JWT_SECRET=b31f4098962ae2da86463be5f593238f07247e3775c5fef061ce89a7cd28755a
JWT_EXPIRES_IN=7d
COOKIE_SECRET=211d815860edba5db83a285dc16fed87c2b15d1961facea29a547933a939677e
FRONTEND_URL=https://bash-pj2y2dymh-alexanderjosephbell-gmailcoms-projects.vercel.app/
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
BCRYPT_ROUNDS=12
ENABLE_CORS=true
```

### Step 3: Redeploy

After setting the root directory and verifying environment variables:

1. Click **"Redeploy"** or **"Deploy"**
2. Watch the build logs
3. Wait for "Deployed" status

---

## 🎯 Expected Behavior After Fix

### Build Phase:
```
[Region: europe-west4]
Using Nixpacks
setup: nodejs_22, npm-9_x
install: npm i
build: npm run build
start: node dist/server.js
```

### Healthcheck:
```
Starting Healthcheck
Path: /health
✅ Attempt #1 succeeded
Service is healthy!
```

### Deployment:
```
✅ Deployed successfully
```

---

## 🔍 Why This Happens

Railway tries to auto-detect your project structure. When it sees:
- Root `package.json` with workspaces
- `backend/` folder with another `package.json`

It assumes it's a monorepo and tries to build from the root using workspace commands.

By setting **Root Directory = backend**, we tell Railway:
- "Work inside the backend folder"
- "Use backend/package.json"
- "Ignore the root package.json"

---

## 📊 Verification

After deployment succeeds, test these endpoints:

1. **Health Check:**
   ```
   https://your-app.railway.app/health
   ```
   Should return: `{"status":"ok"}`

2. **API Root:**
   ```
   https://your-app.railway.app/api
   ```
   Should return API info

3. **Database Connection:**
   Check logs for:
   ```
   ✅ Database connected
   ✅ Server running on port 3001
   ```

---

## 🚀 Next Steps After Successful Deployment

1. Get your Railway URL from Settings → Domains
2. Update Vercel frontend environment variable:
   - `VITE_API_URL` = your Railway URL
3. Redeploy frontend on Vercel
4. Test the full application!

---

**Set the Root Directory to `backend` and redeploy!**

# 🚀 DEPLOY TO VERCEL - SCHRITT FÜR SCHRITT

## 🎯 DEPLOYMENT STRATEGIE

**Vercel** ist perfekt für das Frontend, aber wir brauchen eine separate Lösung für Backend + PostgreSQL.

### **Empfohlene Architektur:**
```
Frontend (Vercel)     → KOSTENLOS
Backend (Railway)     → $5 Free Tier
PostgreSQL (Railway)  → Im Free Tier enthalten
```

---

## 📋 OPTION 1: NUR FRONTEND AUF VERCEL (EMPFOHLEN)

### ✅ **Vorteile:**
- Frontend: Kostenlos & blitzschnell
- Backend: Railway (einfach & günstig)
- Beste Performance
- Einfaches Setup

---

## 🚀 FRONTEND AUF VERCEL DEPLOYEN

### 1️⃣ **Vercel Account erstellen**

1. Gehe zu **https://vercel.com**
2. Klicke **"Sign Up"**
3. Wähle **"Continue with GitHub"**
4. Autorisiere Vercel

### 2️⃣ **Projekt importieren**

1. **Dashboard:** https://vercel.com/dashboard
2. Klicke **"Add New..."** → **"Project"**
3. **Import Git Repository**
4. Suche: `alex321123s/oedp-md2`
5. Klicke **"Import"**

### 3️⃣ **Projekt konfigurieren**

#### **Framework Preset:**
- Wähle: **Vite**

#### **Root Directory:**
- Setze: `frontend`

#### **Build Settings:**
```
Build Command:    npm run build
Output Directory: dist
Install Command:  npm install
```

#### **Environment Variables:**
```
VITE_API_URL=https://your-backend.railway.app
```

**Wichtig:** Backend-URL kommt später von Railway!

### 4️⃣ **Deploy!**

1. Klicke **"Deploy"**
2. Warte 2-3 Minuten
3. ✅ Frontend ist live!

---

## 🔧 BACKEND AUF RAILWAY DEPLOYEN

### 1️⃣ **Railway Account**

1. Gehe zu **https://railway.app**
2. **"Login with GitHub"**

### 2️⃣ **Backend Service erstellen**

1. **"New Project"** → **"Deploy from GitHub repo"**
2. Wähle: `alex321123s/oedp-md2`
3. **Root Directory:** `backend`

### 3️⃣ **PostgreSQL hinzufügen**

1. **"New"** → **"Database"** → **"PostgreSQL"**
2. Automatisch erstellt!

### 4️⃣ **Environment Variables (Backend)**

```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=https://your-app.vercel.app
```

### 5️⃣ **Backend URL kopieren**

Nach dem Deployment:
1. Railway Dashboard → Backend Service
2. **Settings** → **Domains**
3. URL kopieren (z.B. `https://your-backend.railway.app`)

---

## 🔗 SERVICES VERBINDEN

### **Vercel Frontend → Railway Backend**

1. **Vercel Dashboard** → Dein Projekt
2. **Settings** → **Environment Variables**
3. Bearbeite `VITE_API_URL`:
```
VITE_API_URL=https://your-backend.railway.app
```
4. **Redeploy** (Vercel deployt automatisch neu)

### **Railway Backend → Vercel Frontend**

1. **Railway Dashboard** → Backend Service
2. **Variables**
3. Bearbeite `FRONTEND_URL`:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## 📋 OPTION 2: ALLES AUF VERCEL (FORTGESCHRITTEN)

⚠️ **Hinweis:** Vercel Serverless Functions haben Limits (10s Timeout, keine WebSockets)

### **Vercel + Supabase:**

#### **Frontend:** Vercel (kostenlos)
#### **Backend API:** Vercel Serverless Functions
#### **Database:** Supabase (kostenlos)

### **Setup:**

1. **Supabase Account:** https://supabase.com
2. **Neues Projekt** erstellen
3. **PostgreSQL Connection String** kopieren
4. **Backend als Serverless Functions** umbauen
5. **Vercel deployen**

**Nachteil:** Mehr Arbeit, Serverless Limits

---

## 💰 KOSTEN-VERGLEICH

### **Option 1: Vercel + Railway (EMPFOHLEN)**
```
Frontend (Vercel):     $0/Monat ✅
Backend (Railway):     ~$3/Monat (Free Tier)
PostgreSQL (Railway):  Im Free Tier enthalten
─────────────────────────────────────────
TOTAL:                 ~$0-3/Monat
```

### **Option 2: Vercel + Supabase**
```
Frontend (Vercel):     $0/Monat
Backend (Vercel):      $0/Monat (mit Limits)
PostgreSQL (Supabase): $0/Monat (500MB)
─────────────────────────────────────────
TOTAL:                 $0/Monat
```

---

## 🎯 EMPFOHLENE SCHRITTE

### **1. Frontend auf Vercel** (5 Minuten)
```bash
1. vercel.com → Login with GitHub
2. Import Repository: alex321123s/oedp-md2
3. Root Directory: frontend
4. Framework: Vite
5. Deploy!
```

### **2. Backend auf Railway** (10 Minuten)
```bash
1. railway.app → Login with GitHub
2. New Project → GitHub Repo
3. Root Directory: backend
4. Add PostgreSQL
5. Set Environment Variables
6. Deploy!
```

### **3. Services verbinden** (2 Minuten)
```bash
1. Vercel: VITE_API_URL = Railway Backend URL
2. Railway: FRONTEND_URL = Vercel Frontend URL
3. Redeploy both
```

---

## 🔧 VERCEL CLI (OPTIONAL)

### **Installation:**
```bash
npm install -g vercel
```

### **Login:**
```bash
vercel login
```

### **Deploy Frontend:**
```bash
cd frontend
vercel
```

### **Production Deploy:**
```bash
vercel --prod
```

---

## 📝 VERCEL KONFIGURATION

### **vercel.json (Root):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### **package.json (Frontend):**
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

---

## 🌐 CUSTOM DOMAIN

### **Vercel Domain:**

1. **Vercel Dashboard** → Projekt → **Settings** → **Domains**
2. **Add Domain:** `md2.oedp.de`
3. **DNS bei Domain-Provider:**
```
Type: CNAME
Name: md2
Value: cname.vercel-dns.com
```

### **Railway Domain:**

1. **Railway Dashboard** → Backend → **Settings** → **Domains**
2. **Add Domain:** `api-md2.oedp.de`
3. **DNS:**
```
Type: CNAME
Name: api-md2
Value: your-backend.railway.app
```

---

## 🐛 TROUBLESHOOTING

### **Problem: Build Failed**
**Lösung:**
```bash
# Lokal testen
cd frontend
npm install
npm run build

# Logs prüfen
vercel logs
```

### **Problem: API Connection Error**
**Lösung:**
1. `VITE_API_URL` korrekt gesetzt?
2. Backend läuft auf Railway?
3. CORS konfiguriert?

### **Problem: Environment Variables nicht geladen**
**Lösung:**
1. Vercel Dashboard → Settings → Environment Variables
2. Alle mit `VITE_` Prefix
3. Redeploy nach Änderungen

---

## ✅ DEPLOYMENT CHECKLISTE

### **Vercel (Frontend):**
- [ ] Vercel Account erstellt
- [ ] Repository importiert
- [ ] Root Directory: `frontend`
- [ ] Framework: Vite
- [ ] Environment Variables gesetzt
- [ ] Deployed
- [ ] URL notiert

### **Railway (Backend):**
- [ ] Railway Account erstellt
- [ ] Backend Service erstellt
- [ ] PostgreSQL hinzugefügt
- [ ] Environment Variables gesetzt
- [ ] Migrations ausgeführt
- [ ] Deployed
- [ ] URL notiert

### **Verbindung:**
- [ ] Vercel: `VITE_API_URL` gesetzt
- [ ] Railway: `FRONTEND_URL` gesetzt
- [ ] Beide redeployed
- [ ] Getestet

---

## 🎯 QUICK START

### **Schnellster Weg (15 Minuten):**

```bash
# 1. Vercel Frontend (5 Min)
→ vercel.com
→ Import: alex321123s/oedp-md2
→ Root: frontend
→ Deploy!

# 2. Railway Backend (10 Min)
→ railway.app
→ Import: alex321123s/oedp-md2
→ Root: backend
→ Add PostgreSQL
→ Set Variables
→ Deploy!

# 3. Verbinden (2 Min)
→ Vercel: VITE_API_URL = Railway URL
→ Railway: FRONTEND_URL = Vercel URL
→ Redeploy!
```

---

## 📊 PERFORMANCE

### **Vercel Vorteile:**
- ✅ **Edge Network** - Weltweit schnell
- ✅ **Automatisches Caching**
- ✅ **Image Optimization**
- ✅ **Zero Config**
- ✅ **Instant Rollbacks**
- ✅ **Preview Deployments**

### **Railway Vorteile:**
- ✅ **Einfaches Backend Hosting**
- ✅ **PostgreSQL inklusive**
- ✅ **Keine Serverless Limits**
- ✅ **WebSocket Support**
- ✅ **Persistent Storage**

---

## 🔗 WICHTIGE LINKS

### **Vercel:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- CLI: https://vercel.com/cli

### **Railway:**
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app

### **Repository:**
- GitHub: https://github.com/alex321123s/oedp-md2

---

## ✅ FERTIG!

**Ihre ÖDP-MD² Platform ist jetzt live!** 🎉

### **URLs:**
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.railway.app`
- **Health:** `https://your-backend.railway.app/health`

### **Kosten:**
- **Vercel:** $0/Monat (Frontend)
- **Railway:** ~$3/Monat (Backend + DB)
- **Total:** ~$3/Monat ✅

**Viel Erfolg!** 🚀

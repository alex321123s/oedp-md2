# ⚡ VERCEL QUICK START - 5 MINUTEN

## 🎯 SCHNELLSTE METHODE

### **1. Vercel öffnen** (1 Minute)
```
https://vercel.com
→ "Sign Up" oder "Login"
→ "Continue with GitHub"
```

### **2. Projekt importieren** (2 Minuten)
```
1. Dashboard: https://vercel.com/dashboard
2. "Add New..." → "Project"
3. "Import Git Repository"
4. Suche: alex321123s/oedp-md2
5. "Import"
```

### **3. Konfigurieren** (1 Minute)
```
Framework Preset:     Vite
Root Directory:       frontend
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
```

### **4. Environment Variable** (30 Sekunden)
```
Name:  VITE_API_URL
Value: https://your-backend.railway.app
```
*(Backend URL kommt später von Railway)*

### **5. Deploy!** (30 Sekunden)
```
→ Klicke "Deploy"
→ Warte 2-3 Minuten
→ ✅ Fertig!
```

---

## 🔗 BACKEND DEPLOYEN (RAILWAY)

### **Warum Railway für Backend?**
- ✅ PostgreSQL inklusive
- ✅ Einfaches Setup
- ✅ $5 Free Tier
- ✅ Keine Serverless Limits

### **Quick Setup:**
```
1. https://railway.app
2. "Login with GitHub"
3. "New Project" → "Deploy from GitHub"
4. Repository: alex321123s/oedp-md2
5. Root Directory: backend
6. "Add PostgreSQL"
7. Environment Variables setzen
8. Deploy!
```

**Detaillierte Anleitung:** [DEPLOY_TO_RAILWAY.md](./DEPLOY_TO_RAILWAY.md)

---

## 🔗 SERVICES VERBINDEN

### **Nach beiden Deployments:**

#### **1. Railway Backend URL kopieren**
```
Railway Dashboard → Backend Service → Settings → Domains
→ Kopiere URL (z.B. https://oedp-backend.railway.app)
```

#### **2. In Vercel einfügen**
```
Vercel Dashboard → Dein Projekt → Settings → Environment Variables
→ VITE_API_URL = https://oedp-backend.railway.app
→ Redeploy (automatisch)
```

#### **3. Vercel URL in Railway**
```
Railway Dashboard → Backend → Variables
→ FRONTEND_URL = https://oedp-md2.vercel.app
→ Redeploy
```

---

## ✅ FERTIG!

**Ihre App ist live!** 🎉

### **URLs:**
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.railway.app`

### **Kosten:**
- **Vercel:** $0/Monat (Frontend)
- **Railway:** ~$3/Monat (Backend + PostgreSQL)

### **Login testen:**
```
Email: admin@oedp.de
Password: Admin123!
```

---

## 🎯 ALTERNATIVE: NUR VERCEL CLI

### **Noch schneller mit CLI:**

```bash
# 1. Vercel CLI installieren
npm install -g vercel

# 2. Login
vercel login

# 3. Frontend deployen
cd frontend
vercel

# 4. Production
vercel --prod
```

**Fertig in 2 Minuten!** ⚡

---

## 📝 CHECKLISTE

- [ ] Vercel Account erstellt
- [ ] Repository importiert
- [ ] Framework: Vite
- [ ] Root: frontend
- [ ] Deployed
- [ ] Railway Backend deployed
- [ ] URLs verbunden
- [ ] Getestet

---

## 🔗 LINKS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **GitHub Repo:** https://github.com/alex321123s/oedp-md2
- **Detaillierte Anleitung:** [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)

---

**Los geht's!** 🚀

# 🚀 BACKEND AUF RAILWAY DEPLOYEN - JETZT!

## ⚡ OPTION 1: ÜBER WEBSITE (EMPFOHLEN - 10 MINUTEN)

### **Schritt 1: Railway Account** (2 Min)
```
1. Öffne: https://railway.app
2. Klicke: "Start a New Project"
3. Wähle: "Login with GitHub"
4. Autorisiere Railway
```

### **Schritt 2: Projekt erstellen** (2 Min)
```
1. Dashboard: https://railway.app/dashboard
2. Klicke: "New Project"
3. Wähle: "Deploy from GitHub repo"
4. Suche und wähle: alex321123s/oedp-md2
5. Railway erkennt das Projekt automatisch
```

### **Schritt 3: Backend Service konfigurieren** (3 Min)
```
1. Im Railway Dashboard
2. Klicke auf das Service (sollte automatisch erkannt werden)
3. Settings → Root Directory: backend
4. Settings → Start Command: node dist/server.js
```

### **Schritt 4: PostgreSQL hinzufügen** (1 Min)
```
1. Im Railway Dashboard
2. Klicke: "New" → "Database" → "Add PostgreSQL"
3. PostgreSQL wird automatisch erstellt
4. Connection String wird automatisch generiert
```

### **Schritt 5: Environment Variables setzen** (2 Min)
```
1. Backend Service → Variables Tab
2. Klicke: "Add Variable"

Setze folgende Variables:

NODE_ENV=production
PORT=3001
JWT_SECRET=erzeuge-einen-sicheren-32-zeichen-schluessel-hier
FRONTEND_URL=https://your-app.vercel.app

DATABASE_URL wird automatisch von PostgreSQL verlinkt!
```

**JWT Secret generieren:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Schritt 6: PostgreSQL verlinken** (1 Min)
```
1. Backend Service → Variables
2. Klicke: "New Variable" → "Add Reference"
3. Wähle: PostgreSQL
4. Variable: DATABASE_URL
5. Reference: DATABASE_URL
```

### **Schritt 7: Deploy!** (30 Sek)
```
Railway deployt automatisch!
Warte 2-3 Minuten...
```

### **Schritt 8: Backend URL kopieren** (30 Sek)
```
1. Backend Service → Settings → Domains
2. Kopiere die URL (z.B. https://oedp-backend.up.railway.app)
3. Diese URL brauchst du für Vercel!
```

---

## ⚡ OPTION 2: MIT RAILWAY CLI (SCHNELLER - 5 MINUTEN)

### **Schritt 1: Railway CLI installieren**
```bash
npm install -g @railway/cli
```

### **Schritt 2: Login**
```bash
railway login
```
*(Öffnet Browser für GitHub Auth)*

### **Schritt 3: Projekt initialisieren**
```bash
cd /home/alex/Projects/Portfolio/OEDP/Bash
railway init
```
*(Wähle: "Create new project")*

### **Schritt 4: PostgreSQL hinzufügen**
```bash
railway add -d postgres
```

### **Schritt 5: Environment Variables setzen**
```bash
# JWT Secret generieren
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Variables setzen
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

### **Schritt 6: Backend deployen**
```bash
cd backend
railway up
```

### **Schritt 7: URL anzeigen**
```bash
railway domain
```

---

## 🔧 NACH DEM DEPLOYMENT

### **1. Datenbank initialisieren**

#### **Option A: Railway CLI**
```bash
# Migrations ausführen
railway run npm run migration:run

# Seed-Daten einfügen
railway run npm run seed:dev
```

#### **Option B: Über PostgreSQL Client**
```bash
# Connection String von Railway kopieren
# Railway Dashboard → PostgreSQL → Connect

# Verbinden
psql "postgresql://user:pass@host:port/database"

# Migrations manuell ausführen
\i backend/src/database/migrations/add-motion-legal-fields.sql
\i backend/src/database/migrations/add-signature-count-trigger.sql
```

### **2. Health Check testen**
```bash
curl https://your-backend.railway.app/health
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.45
}
```

### **3. Backend URL notieren**
```
https://your-backend.railway.app
```
**Diese URL brauchst du für Vercel Frontend!**

---

## 📋 ENVIRONMENT VARIABLES ÜBERSICHT

### **Erforderlich:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Automatisch verlinkt
JWT_SECRET=<32-zeichen-random-string>
FRONTEND_URL=https://your-app.vercel.app
```

### **Optional (für Email):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@oedp.de
```

---

## 🐛 TROUBLESHOOTING

### **Problem: Build Failed**
```
Lösung:
1. Railway Dashboard → Deployments → Logs prüfen
2. Stelle sicher: package.json hat "build" script
3. Stelle sicher: Node.js Version >= 18
```

### **Problem: Database Connection Error**
```
Lösung:
1. PostgreSQL Service läuft?
2. DATABASE_URL korrekt verlinkt?
3. Railway Dashboard → PostgreSQL → Status prüfen
```

### **Problem: Port Error**
```
Lösung:
Railway setzt automatisch PORT Variable
Backend muss process.env.PORT verwenden
```

### **Problem: Migrations nicht ausgeführt**
```
Lösung:
railway run npm run migration:run
```

---

## ✅ DEPLOYMENT CHECKLISTE

- [ ] Railway Account erstellt
- [ ] GitHub Repository verbunden
- [ ] Backend Service erstellt
- [ ] Root Directory: backend
- [ ] PostgreSQL hinzugefügt
- [ ] DATABASE_URL verlinkt
- [ ] Environment Variables gesetzt
- [ ] JWT_SECRET generiert
- [ ] Deployed (automatisch)
- [ ] Migrations ausgeführt
- [ ] Health Check erfolgreich
- [ ] Backend URL notiert

---

## 🎯 NÄCHSTER SCHRITT: VERCEL FRONTEND

Nach erfolgreichem Backend-Deployment:

### **1. Backend URL kopieren**
```
https://your-backend.railway.app
```

### **2. Vercel Frontend deployen**
```
1. https://vercel.com
2. Import Repository: alex321123s/oedp-md2
3. Root Directory: frontend
4. Environment Variable:
   VITE_API_URL=https://your-backend.railway.app
5. Deploy!
```

### **3. Frontend URL in Railway setzen**
```
Railway Dashboard → Backend → Variables
→ FRONTEND_URL = https://your-app.vercel.app
→ Redeploy
```

---

## 💰 KOSTEN

### **Railway Free Tier:**
```
$5/Monat Guthaben (KOSTENLOS)

Geschätzte Nutzung:
- Backend (256MB):    ~$1.50/Monat
- PostgreSQL (256MB): ~$1.50/Monat
────────────────────────────────────
TOTAL:                ~$3.00/Monat ✅

Passt in Free Tier!
```

---

## 🔗 WICHTIGE LINKS

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **GitHub Repo:** https://github.com/alex321123s/oedp-md2
- **Railway CLI Docs:** https://docs.railway.app/develop/cli

---

## 📝 SCHNELL-KOMMANDOS

### **Railway CLI:**
```bash
# Login
railway login

# Projekt initialisieren
railway init

# PostgreSQL hinzufügen
railway add -d postgres

# Variables setzen
railway variables set KEY=value

# Deployen
railway up

# Logs anzeigen
railway logs

# Shell öffnen
railway shell

# Domain anzeigen
railway domain

# Status prüfen
railway status
```

---

## ✅ FERTIG!

Nach erfolgreichem Deployment:

**Backend URL:** `https://your-backend.railway.app`

**Health Check:** `https://your-backend.railway.app/health`

**Nächster Schritt:** Frontend auf Vercel deployen!

---

**Los geht's!** 🚀

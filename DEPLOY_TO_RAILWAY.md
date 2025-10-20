# 🚀 DEPLOY TO RAILWAY - SCHRITT FÜR SCHRITT

## ✅ Repository ist auf GitHub!

**URL:** https://github.com/alex321123s/oedp-md2

---

## 📋 DEPLOYMENT SCHRITTE

### 1️⃣ RAILWAY ACCOUNT ERSTELLEN

1. Gehe zu **https://railway.app**
2. Klicke auf **"Start a New Project"**
3. Wähle **"Login with GitHub"**
4. Autorisiere Railway für GitHub

---

### 2️⃣ PROJEKT ERSTELLEN

1. **Dashboard öffnen:** https://railway.app/dashboard
2. Klicke **"New Project"**
3. Wähle **"Deploy from GitHub repo"**
4. Suche und wähle: **`alex321123s/oedp-md2`**
5. Railway erkennt automatisch das Projekt

---

### 3️⃣ POSTGRESQL DATENBANK HINZUFÜGEN

1. Im Railway Dashboard
2. Klicke **"New"** → **"Database"** → **"Add PostgreSQL"**
3. PostgreSQL wird automatisch erstellt
4. Connection String wird automatisch generiert

---

### 4️⃣ BACKEND SERVICE KONFIGURIEREN

#### A. Service erstellen:
1. Klicke **"New"** → **"GitHub Repo"**
2. Wähle **`oedp-md2`**
3. Root Directory: **`/backend`**

#### B. Environment Variables setzen:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=dein-super-sicherer-geheimer-schluessel-mindestens-32-zeichen-lang
FRONTEND_URL=${{Frontend.url}}
```

**Wichtig:** 
- `DATABASE_URL` wird automatisch von PostgreSQL verlinkt
- `FRONTEND_URL` wird nach Frontend-Deployment gesetzt
- `JWT_SECRET` muss ein starker, zufälliger String sein

#### C. Build Settings:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/server.js`
- **Healthcheck Path:** `/health`

---

### 5️⃣ FRONTEND SERVICE KONFIGURIEREN

#### A. Service erstellen:
1. Klicke **"New"** → **"GitHub Repo"**
2. Wähle **`oedp-md2`**
3. Root Directory: **`/frontend`**

#### B. Environment Variables setzen:
```
VITE_API_URL=${{Backend.url}}
```

**Wichtig:**
- `VITE_API_URL` wird automatisch von Backend verlinkt

#### C. Build Settings:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run preview`

---

### 6️⃣ SERVICES VERLINKEN

#### Backend → PostgreSQL:
1. Backend Service öffnen
2. **Variables** Tab
3. **"Reference"** → PostgreSQL auswählen
4. `DATABASE_URL` wird automatisch gesetzt

#### Frontend → Backend:
1. Frontend Service öffnen
2. **Variables** Tab
3. **"Reference"** → Backend auswählen
4. `VITE_API_URL` wird automatisch gesetzt

#### Backend → Frontend:
1. Backend Service öffnen
2. **Variables** Tab
3. Manuell setzen: `FRONTEND_URL=https://your-frontend.railway.app`

---

### 7️⃣ DATENBANK INITIALISIEREN

#### Option A: Über Railway CLI
```bash
# Railway CLI installieren
npm install -g @railway/cli

# Login
railway login

# Projekt verlinken
railway link

# Migration ausführen
railway run npm run migration:run

# Seed-Daten einfügen
railway run npm run seed:dev
```

#### Option B: Über PostgreSQL Client
1. Connection String von Railway kopieren
2. Lokal verbinden:
```bash
psql "postgresql://user:pass@host:port/database"
```
3. Migrations manuell ausführen:
```sql
-- SQL aus backend/src/database/migrations/ kopieren und ausführen
```

---

### 8️⃣ DEPLOYMENT TESTEN

#### A. Backend Health Check:
```bash
curl https://your-backend.railway.app/health
```

Erwartete Antwort:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.45
}
```

#### B. Frontend öffnen:
```
https://your-frontend.railway.app
```

#### C. Login testen:
- Email: `admin@oedp.de`
- Password: `Admin123!`

---

### 9️⃣ CUSTOM DOMAIN (OPTIONAL)

#### A. Domain bei Railway hinzufügen:
1. Frontend Service → **Settings**
2. **Domains** → **"Add Domain"**
3. Domain eingeben: `md2.oedp.de`
4. DNS-Einträge bei Domain-Provider setzen:

```
Type: CNAME
Name: md2
Value: your-frontend.railway.app
```

#### B. Backend Domain:
1. Backend Service → **Settings**
2. **Domains** → **"Add Domain"**
3. Domain eingeben: `api-md2.oedp.de`
4. DNS-Einträge setzen:

```
Type: CNAME
Name: api-md2
Value: your-backend.railway.app
```

#### C. Environment Variables aktualisieren:
```
Backend:
FRONTEND_URL=https://md2.oedp.de

Frontend:
VITE_API_URL=https://api-md2.oedp.de
```

---

## 🔧 RAILWAY.JSON KONFIGURATION

### Backend (backend/railway.json):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Frontend (frontend/railway.json):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 📊 KOSTEN-ÜBERSICHT

### Free Tier ($5/Monat Guthaben):
```
Backend (256MB RAM):     ~$1.50/Monat
Frontend (256MB RAM):    ~$1.50/Monat
PostgreSQL (256MB RAM):  ~$1.50/Monat
─────────────────────────────────────
TOTAL:                   ~$4.50/Monat ✅
```

**Passt perfekt in den Free Tier!**

---

## 🔐 SICHERHEIT

### Environment Variables sicher setzen:
```bash
# JWT Secret generieren
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# In Railway setzen:
JWT_SECRET=<generierter-wert>
```

### PostgreSQL Backup:
```bash
# Railway CLI
railway run pg_dump > backup.sql

# Restore
railway run psql < backup.sql
```

---

## 🐛 TROUBLESHOOTING

### Problem: Backend startet nicht
**Lösung:**
1. Logs prüfen: Railway Dashboard → Backend → **Deployments** → **Logs**
2. Environment Variables prüfen
3. DATABASE_URL korrekt verlinkt?

### Problem: Frontend kann Backend nicht erreichen
**Lösung:**
1. `VITE_API_URL` korrekt gesetzt?
2. CORS in Backend konfiguriert?
3. Backend läuft und ist erreichbar?

### Problem: Database Connection Error
**Lösung:**
1. PostgreSQL Service läuft?
2. DATABASE_URL korrekt?
3. Migrations ausgeführt?

---

## 📝 CHECKLISTE

- [ ] Railway Account erstellt
- [ ] GitHub Repository verbunden
- [ ] PostgreSQL Datenbank hinzugefügt
- [ ] Backend Service konfiguriert
- [ ] Frontend Service konfiguriert
- [ ] Environment Variables gesetzt
- [ ] Services verlinkt
- [ ] Datenbank initialisiert (Migrations)
- [ ] Seed-Daten eingefügt
- [ ] Health Check erfolgreich
- [ ] Frontend erreichbar
- [ ] Login funktioniert
- [ ] Custom Domain (optional)

---

## 🎯 NÄCHSTE SCHRITTE

### Nach erfolgreichem Deployment:

1. **Admin-Account erstellen:**
```bash
railway run npm run create-admin
```

2. **Test-Benutzer erstellen:**
```bash
railway run npm run create-test-users
```

3. **Monitoring einrichten:**
- Railway Dashboard → **Metrics**
- Logs überwachen
- Alerts konfigurieren

4. **Backup-Strategie:**
- Automatische PostgreSQL Backups aktivieren
- Regelmäßige manuelle Backups

5. **Performance optimieren:**
- Caching aktivieren
- CDN für statische Assets
- Database Indizes prüfen

---

## 🔗 WICHTIGE LINKS

- **GitHub Repository:** https://github.com/alex321123s/oedp-md2
- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **Support:** https://railway.app/help

---

## ✅ FERTIG!

**Ihr ÖDP-MD² System ist jetzt live auf Railway!** 🎉

**URLs:**
- Frontend: `https://your-frontend.railway.app`
- Backend: `https://your-backend.railway.app`
- Health: `https://your-backend.railway.app/health`

**Viel Erfolg mit dem Deployment!** 🚀

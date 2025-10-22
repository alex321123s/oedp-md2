# 🚀 DEPLOYMENT MIT SUPABASE - EINFACHER & KOSTENLOS!

## 🎯 NEUE ARCHITEKTUR

```
Frontend (Vercel)     → $0/Monat ✅ DEPLOYED
Backend (Vercel)      → $0/Monat (Serverless Functions)
Database (Supabase)   → $0/Monat (500MB Free)
────────────────────────────────────────────
TOTAL:                  $0/Monat! 🎉
```

---

## ⚡ SCHRITT 1: SUPABASE DATENBANK (5 MINUTEN)

### **1. Supabase Account erstellen**
```
https://supabase.com
→ "Start your project"
→ "Sign in with GitHub"
```

### **2. Neues Projekt erstellen**
```
1. Dashboard → "New Project"
2. Name: oedp-md2
3. Database Password: <starkes-passwort>
4. Region: Europe (Frankfurt)
5. "Create new project"
6. Warte 2-3 Minuten...
```

### **3. Connection String kopieren**
```
1. Project Settings → Database
2. Connection String → URI
3. Kopiere die URL:
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### **4. Datenbank initialisieren**

**SQL Editor öffnen:**
```
Supabase Dashboard → SQL Editor → "New query"
```

**Migrations ausführen:**

Kopiere den Inhalt aus:
- `backend/src/database/migrations/add-motion-legal-fields.sql`
- `backend/src/database/migrations/add-signature-count-trigger.sql`

Füge ein und führe aus.

---

## ⚡ SCHRITT 2: BACKEND ALS VERCEL SERVERLESS (10 MINUTEN)

### **Option A: Backend auf Vercel (Empfohlen für Start)**

**1. Backend für Vercel vorbereiten:**

Erstelle `api/index.ts` im Root:
```typescript
// api/index.ts
import { app } from '../backend/src/server';

export default app;
```

**2. Vercel Config anpassen:**

Erstelle `vercel.json` im Root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

**3. Backend auf Vercel deployen:**
```bash
# Neues Vercel Projekt für Backend
vercel --prod

# Environment Variables setzen
vercel env add DATABASE_URL production
# Wert: Supabase Connection String

vercel env add JWT_SECRET production
# Wert: <generierter-32-zeichen-string>

vercel env add FRONTEND_URL production
# Wert: https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app

# Neu deployen
vercel --prod
```

---

## ⚡ OPTION B: BACKEND AUF RENDER (EINFACHER)

### **1. Render Account**
```
https://render.com
→ "Get Started for Free"
→ "Sign in with GitHub"
```

### **2. Web Service erstellen**
```
1. Dashboard → "New +"
2. "Web Service"
3. Connect Repository: alex321123s/oedp-md2
4. Name: oedp-md2-backend
5. Root Directory: backend
6. Runtime: Node
7. Build Command: npm install && npm run build
8. Start Command: node dist/server.js
9. Plan: Free
```

### **3. Environment Variables**
```
DATABASE_URL=<supabase-connection-string>
JWT_SECRET=<32-zeichen-string>
FRONTEND_URL=https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app
NODE_ENV=production
PORT=3001
```

### **4. Deploy!**
```
Render deployt automatisch
Warte 5-10 Minuten...
```

---

## ⚡ OPTION C: BACKEND AUF FLY.IO (SCHNELL)

### **1. Fly.io CLI installieren**
```bash
curl -L https://fly.io/install.sh | sh
```

### **2. Login**
```bash
fly auth login
```

### **3. App erstellen**
```bash
cd backend
fly launch --name oedp-md2-backend --region fra
```

### **4. Secrets setzen**
```bash
fly secrets set DATABASE_URL="<supabase-connection-string>"
fly secrets set JWT_SECRET="<32-zeichen-string>"
fly secrets set FRONTEND_URL="https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app"
fly secrets set NODE_ENV="production"
```

### **5. Deploy**
```bash
fly deploy
```

---

## 🎯 EMPFEHLUNG: RENDER (AM EINFACHSTEN)

### **Warum Render?**
- ✅ Einfachste Einrichtung
- ✅ Kostenlos (mit Sleep nach 15 Min)
- ✅ Automatische Deployments
- ✅ Keine Serverless Limits
- ✅ Persistent Storage
- ✅ Logs & Monitoring

### **Nachteile:**
- ⚠️ Free Tier schläft nach 15 Min Inaktivität
- ⚠️ Erster Request nach Sleep: ~30 Sek

**Für Production später:** Render Starter ($7/Monat) - kein Sleep

---

## 📋 KOMPLETTE SETUP-ANLEITUNG (RENDER + SUPABASE)

### **1. Supabase Setup** (5 Min)
```
1. https://supabase.com → Sign in with GitHub
2. New Project: oedp-md2
3. Region: Europe (Frankfurt)
4. Create Project
5. SQL Editor → Migrations ausführen
6. Connection String kopieren
```

### **2. Render Setup** (5 Min)
```
1. https://render.com → Sign in with GitHub
2. New + → Web Service
3. Repository: alex321123s/oedp-md2
4. Root: backend
5. Build: npm install && npm run build
6. Start: node dist/server.js
7. Environment Variables setzen
8. Create Web Service
```

### **3. Vercel Frontend Update** (2 Min)
```bash
cd frontend
vercel env add VITE_API_URL production
# Wert: https://oedp-md2-backend.onrender.com

vercel --prod
```

### **4. Testen!** (1 Min)
```
1. Frontend öffnen
2. Login: admin@oedp.de / Admin123!
3. ✅ Funktioniert!
```

---

## 💰 KOSTEN-VERGLEICH

### **Supabase + Render (Free):**
```
Frontend (Vercel):    $0/Monat
Backend (Render):     $0/Monat (mit Sleep)
Database (Supabase):  $0/Monat (500MB)
────────────────────────────────────
TOTAL:                $0/Monat! 🎉
```

### **Supabase + Render (Starter):**
```
Frontend (Vercel):    $0/Monat
Backend (Render):     $7/Monat (kein Sleep)
Database (Supabase):  $0/Monat (500MB)
────────────────────────────────────
TOTAL:                $7/Monat
```

### **Supabase + Fly.io:**
```
Frontend (Vercel):    $0/Monat
Backend (Fly.io):     $0/Monat (Free Tier)
Database (Supabase):  $0/Monat (500MB)
────────────────────────────────────
TOTAL:                $0/Monat! 🎉
```

---

## 🔧 SUPABASE MIGRATIONS

### **Schema erstellen:**

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  membership_number VARCHAR(50) UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Motions Table
CREATE TABLE motions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  motion_type VARCHAR(50) NOT NULL,
  legal_reference VARCHAR(100),
  majority_required VARCHAR(20) DEFAULT 'simple',
  target_group VARCHAR(50),
  author_id UUID REFERENCES users(id),
  trust_person_id UUID REFERENCES users(id),
  replacement_person_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft',
  signature_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  submitted_at TIMESTAMP,
  validated_at TIMESTAMP
);

-- Signatures Table
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_id UUID REFERENCES motions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  signed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(motion_id, user_id)
);

-- Trigger für Signature Counter
CREATE OR REPLACE FUNCTION update_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE motions
  SET signature_count = (
    SELECT COUNT(*) FROM signatures WHERE motion_id = NEW.motion_id
  )
  WHERE id = NEW.motion_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signature_count_trigger
AFTER INSERT OR DELETE ON signatures
FOR EACH ROW
EXECUTE FUNCTION update_signature_count();

-- Surveys, Votes, Comments, etc.
-- (Weitere Tabellen aus deinen Migrations)
```

---

## ✅ DEPLOYMENT CHECKLISTE

### **Supabase:**
- [ ] Account erstellt
- [ ] Projekt erstellt
- [ ] Region: Europe
- [ ] Migrations ausgeführt
- [ ] Connection String kopiert
- [ ] Seed-Daten eingefügt (optional)

### **Render Backend:**
- [ ] Account erstellt
- [ ] Web Service erstellt
- [ ] Repository verbunden
- [ ] Root Directory: backend
- [ ] Build Command gesetzt
- [ ] Start Command gesetzt
- [ ] Environment Variables gesetzt
- [ ] Deployed
- [ ] URL notiert

### **Vercel Frontend:**
- [ ] VITE_API_URL aktualisiert
- [ ] Neu deployed
- [ ] Getestet

---

## 🐛 TROUBLESHOOTING

### **Problem: Render Build Failed**
```
Lösung:
1. Logs prüfen
2. package.json "build" script vorhanden?
3. TypeScript korrekt konfiguriert?
```

### **Problem: Database Connection Error**
```
Lösung:
1. Supabase Connection String korrekt?
2. Password URL-encoded?
3. Supabase Projekt aktiv?
```

### **Problem: CORS Error**
```
Lösung:
1. FRONTEND_URL korrekt in Backend gesetzt?
2. Backend CORS Middleware konfiguriert?
```

---

## 🔗 WICHTIGE LINKS

- **Supabase:** https://supabase.com
- **Render:** https://render.com
- **Fly.io:** https://fly.io
- **Vercel:** https://vercel.com
- **GitHub:** https://github.com/alex321123s/oedp-md2

---

## 🎯 SCHNELLSTART (15 MINUTEN)

```
1. Supabase (5 Min)
   → https://supabase.com
   → New Project
   → Migrations ausführen

2. Render (5 Min)
   → https://render.com
   → New Web Service
   → alex321123s/oedp-md2
   → Environment Variables

3. Vercel Update (2 Min)
   → vercel env add VITE_API_URL
   → vercel --prod

4. Test! (1 Min)
   → Login testen
   → ✅ Fertig!
```

---

**Los geht's mit Supabase!** 🚀

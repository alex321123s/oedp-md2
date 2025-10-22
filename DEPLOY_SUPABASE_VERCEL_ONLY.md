# 🚀 NUR SUPABASE + VERCEL - KOMPLETT KOSTENLOS!

## 🎯 ARCHITEKTUR

```
Frontend (Vercel)           → $0/Monat ✅ DEPLOYED
Backend API (Vercel)        → $0/Monat (Serverless)
Database (Supabase)         → $0/Monat (500MB Free)
─────────────────────────────────────────────────
TOTAL:                        $0/Monat! 🎉
```

**Alles auf 2 Platforms - Super einfach!**

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
2. Organization: Wähle oder erstelle eine
3. Name: oedp-md2
4. Database Password: <starkes-passwort> (NOTIEREN!)
5. Region: Europe West (Frankfurt)
6. Pricing Plan: Free
7. "Create new project"
8. Warte 2-3 Minuten...
```

### **3. Connection String kopieren**
```
1. Project Settings (Zahnrad-Icon) → Database
2. Connection String → URI
3. Kopiere und ersetze [YOUR-PASSWORD]:

postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### **4. Datenbank Schema erstellen**

**SQL Editor öffnen:**
```
Supabase Dashboard → SQL Editor → "New query"
```

**Schema SQL einfügen und ausführen:**

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS motions (
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
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_id UUID REFERENCES motions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  signed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(motion_id, user_id)
);

-- Signature Counter Trigger
CREATE OR REPLACE FUNCTION update_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE motions
    SET signature_count = signature_count + 1
    WHERE id = NEW.motion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE motions
    SET signature_count = signature_count - 1
    WHERE id = OLD.motion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signature_count_trigger
AFTER INSERT OR DELETE ON signatures
FOR EACH ROW
EXECUTE FUNCTION update_signature_count();

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  starts_at TIMESTAMP,
  ends_at TIMESTAMP
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  answer TEXT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(survey_id, user_id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motion_id UUID REFERENCES motions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quick Polls Table
CREATE TABLE IF NOT EXISTS quick_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(255) NOT NULL,
  options JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_motions_author ON motions(author_id);
CREATE INDEX IF NOT EXISTS idx_motions_status ON motions(status);
CREATE INDEX IF NOT EXISTS idx_signatures_motion ON signatures(motion_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user ON signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_survey ON votes(survey_id);
CREATE INDEX IF NOT EXISTS idx_comments_motion ON comments(motion_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
```

**Klicke "Run" → Schema wird erstellt!**

### **5. Admin-Benutzer erstellen (Optional)**

```sql
-- Admin User erstellen
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
VALUES (
  'admin@oedp.de',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7Aq8QJFa.C', -- Admin123!
  'Admin',
  'User',
  'admin',
  true
);
```

---

## ⚡ SCHRITT 2: VERCEL DEPLOYMENT (5 MINUTEN)

### **1. Environment Variables in Vercel setzen**

```bash
cd /home/alex/Projects/Portfolio/OEDP/Bash

# Database URL
vercel env add DATABASE_URL production
# Wert: <Supabase Connection String>

# JWT Secret generieren und setzen
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
vercel env add JWT_SECRET production
# Wert: <generierter-string>

# Frontend URL
vercel env add FRONTEND_URL production
# Wert: https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app

# Node Environment
vercel env add NODE_ENV production
# Wert: production
```

### **2. Backend API deployen**

```bash
# Gesamtes Projekt deployen (Frontend + API)
vercel --prod
```

**Vercel wird automatisch:**
- ✅ Frontend bauen und deployen
- ✅ API als Serverless Functions deployen
- ✅ Beide auf derselben Domain hosten

### **3. API URL in Frontend setzen**

Da API und Frontend auf derselben Domain sind:

```bash
vercel env rm VITE_API_URL production
vercel env add VITE_API_URL production
# Wert: /api (relativer Pfad!)

# Neu deployen
vercel --prod
```

---

## ✅ FERTIG! TESTEN

### **1. Health Check**
```bash
curl https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app/api/health
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:17:00.000Z",
  "uptime": 0.123
}
```

### **2. Frontend öffnen**
```
https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app
```

### **3. Login testen**
```
Email: admin@oedp.de
Password: Admin123!
```

---

## 📋 KOMPLETTE CHECKLISTE

### **Supabase:**
- [ ] Account erstellt
- [ ] Projekt erstellt (oedp-md2)
- [ ] Region: Europe West
- [ ] Database Password notiert
- [ ] Connection String kopiert
- [ ] Schema SQL ausgeführt
- [ ] Admin User erstellt

### **Vercel:**
- [ ] DATABASE_URL gesetzt
- [ ] JWT_SECRET gesetzt
- [ ] FRONTEND_URL gesetzt
- [ ] NODE_ENV gesetzt
- [ ] VITE_API_URL=/api gesetzt
- [ ] vercel --prod ausgeführt
- [ ] Deployment erfolgreich

### **Testing:**
- [ ] Health Check OK
- [ ] Frontend lädt
- [ ] Login funktioniert
- [ ] API Calls funktionieren

---

## 🐛 TROUBLESHOOTING

### **Problem: Database Connection Error**
```
Lösung:
1. Supabase Connection String korrekt?
2. Password URL-encoded? (Sonderzeichen wie @, #, etc.)
3. Supabase Projekt aktiv?
4. Vercel Environment Variable gesetzt?
```

### **Problem: API 404**
```
Lösung:
1. vercel.json korrekt?
2. api/index.ts existiert?
3. Routes korrekt konfiguriert?
4. Neu deployen: vercel --prod
```

### **Problem: CORS Error**
```
Lösung:
1. FRONTEND_URL in Vercel gesetzt?
2. CORS Middleware in api/index.ts konfiguriert?
3. Beide Services neu deployen
```

### **Problem: Serverless Timeout**
```
Lösung:
Vercel Free Tier: 10s Timeout
- Queries optimieren
- Indexes prüfen
- Upgrade zu Pro ($20/Monat) für 60s Timeout
```

---

## 💰 KOSTEN

### **Free Tier (Für immer):**
```
Vercel Hobby:
- Unlimited Deployments
- 100 GB Bandwidth
- Serverless Functions (10s timeout)
- $0/Monat ✅

Supabase Free:
- 500 MB Database
- 1 GB File Storage
- 2 GB Bandwidth
- $0/Monat ✅

TOTAL: $0/Monat! 🎉
```

### **Limits:**
```
Vercel Free:
- 100 GB Bandwidth/Monat
- 100 GB-Hours Serverless
- 10s Function Timeout

Supabase Free:
- 500 MB Database
- 50,000 Monthly Active Users
- 2 GB Bandwidth
```

**Für kleine bis mittlere Apps perfekt!**

---

## 🚀 VORTEILE DIESER LÖSUNG

### ✅ **Komplett kostenlos**
### ✅ **Nur 2 Platforms**
### ✅ **Einfaches Setup**
### ✅ **Automatische Deployments**
### ✅ **Globales CDN**
### ✅ **Automatisches HTTPS**
### ✅ **Keine Server-Verwaltung**
### ✅ **Automatisches Scaling**

---

## ⚠️ WICHTIGE HINWEISE

### **Serverless Limits:**
- ⏱️ **10s Timeout** (Vercel Free)
- 📦 **50 MB Deployment Size**
- 🔄 **Cold Starts** (~1-2s)

### **Für Production:**
Wenn diese Limits zu eng werden:
- Vercel Pro: $20/Monat (60s Timeout)
- Oder Backend auf Render/Fly.io

### **Aber für Start: Perfekt!** ✅

---

## 🔗 WICHTIGE LINKS

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/alex321123s/oedp-md2
- **Frontend URL:** https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app

---

## 📝 ZUSAMMENFASSUNG

**✅ Was du brauchst:**
1. Supabase Account (kostenlos)
2. Vercel Account (bereits vorhanden)
3. 10 Minuten Zeit

**✅ Was du bekommst:**
- Vollständiges Backend API
- PostgreSQL Datenbank
- Frontend Hosting
- Alles kostenlos!

**🚀 Los geht's!**

1. https://supabase.com → Projekt erstellen
2. Schema SQL ausführen
3. Connection String kopieren
4. Vercel Environment Variables setzen
5. vercel --prod
6. Fertig! 🎉

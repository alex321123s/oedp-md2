# 🚀 DEPLOYMENT SCHRITTE - JETZT AUSFÜHREN!

## ✅ SCHRITT 1: SUPABASE DATENBANK ERSTELLEN

### **1. Supabase öffnen:**
```
https://supabase.com
```

### **2. Projekt erstellen:**
- Klicke: "New Project"
- Name: **oedp-md2**
- Database Password: **Erstelle ein starkes Passwort** (NOTIEREN!)
- Region: **Europe West (Frankfurt)**
- Klicke: "Create new project"
- Warte 2-3 Minuten...

### **3. Connection String holen:**
- Project Settings (Zahnrad) → Database
- Connection String → **URI**
- Kopiere die URL (sieht so aus):
  ```
  postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
  ```
- **Ersetze [YOUR-PASSWORD]** mit deinem Passwort!

### **4. Schema erstellen:**
- Supabase Dashboard → **SQL Editor**
- Klicke: "New query"
- Kopiere den SQL Code aus: `backend/src/database/migrations/add-motion-legal-fields.sql`
- Füge ein und klicke: **"Run"**
- Wiederhole für: `backend/src/database/migrations/add-signature-count-trigger.sql`

**ODER nutze dieses komplette Schema:**

```sql
-- Siehe DEPLOY_SUPABASE_VERCEL_ONLY.md für komplettes Schema
```

---

## ✅ SCHRITT 2: VERCEL ENVIRONMENT VARIABLES

**Nachdem du die Supabase Connection String hast:**

### **Führe diese Befehle aus:**

```bash
cd /home/alex/Projects/Portfolio/OEDP/Bash

# 1. Database URL (Supabase Connection String)
vercel env add DATABASE_URL production

# 2. JWT Secret (bereits generiert)
vercel env add JWT_SECRET production
# Wert: b492b563f72dbdd7e7a17721de2f11e670abd4d1681dffc2c56862dde1bb86b5

# 3. Frontend URL
vercel env add FRONTEND_URL production
# Wert: https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app

# 4. Node Environment
vercel env add NODE_ENV production
# Wert: production

# 5. API URL für Frontend (relativer Pfad)
vercel env add VITE_API_URL production
# Wert: /api
```

---

## ✅ SCHRITT 3: DEPLOYEN!

```bash
vercel --prod
```

**Warte 2-3 Minuten...**

---

## ✅ SCHRITT 4: TESTEN

### **Health Check:**
```bash
curl https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app/api/health
```

### **Frontend öffnen:**
```
https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app
```

### **Login:**
```
Email: admin@oedp.de
Password: Admin123!
```

---

## 📝 ZUSAMMENFASSUNG

**Du brauchst:**
1. ✅ Supabase Account erstellen
2. ✅ Projekt erstellen
3. ✅ Connection String kopieren
4. ✅ Schema SQL ausführen
5. ✅ Vercel Environment Variables setzen
6. ✅ vercel --prod ausführen

**Dann läuft alles!** 🎉

---

## 🔗 LINKS

- **Supabase:** https://supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Frontend:** https://frontend-kizh37n70-alexanderjosephbell-gmailcoms-projects.vercel.app

---

**Starte mit Supabase!** 🚀

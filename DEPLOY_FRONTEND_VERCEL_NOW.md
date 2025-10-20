# 🚀 FRONTEND AUF VERCEL DEPLOYEN - JETZT!

## ⚡ VERCEL CLI IST BEREIT!

Die Vercel CLI ist installiert und wartet auf Authentifizierung.

---

## 🔐 AUTHENTIFIZIERUNG (2 OPTIONEN)

### **OPTION 1: Device Code (CLI läuft bereits)**

**Der CLI zeigt:**
```
Visit vercel.com/device and enter VBDB-XRCJ
```

**Schritte:**
1. Öffne: **https://vercel.com/device**
2. Gib den Code ein: **VBDB-XRCJ** (oder den aktuellen Code)
3. Autorisiere mit GitHub
4. Zurück zum Terminal → Enter drücken
5. ✅ Eingeloggt!

---

### **OPTION 2: Über Website (Einfacher)**

**Wenn CLI-Login nicht funktioniert:**

1. **Vercel öffnen:** https://vercel.com
2. **Login:** "Continue with GitHub"
3. **Dashboard:** https://vercel.com/dashboard
4. **Import Project:**
   - "Add New..." → "Project"
   - "Import Git Repository"
   - Suche: `alex321123s/oedp-md2`
   - "Import"

5. **Konfigurieren:**
   ```
   Framework Preset:     Vite
   Root Directory:       frontend
   Build Command:        npm run build
   Output Directory:     dist
   Install Command:      npm install
   ```

6. **Environment Variable:**
   ```
   Name:  VITE_API_URL
   Value: http://localhost:3001
   ```
   *(Später mit Railway Backend URL ersetzen)*

7. **Deploy!**
   - Klicke "Deploy"
   - Warte 2-3 Minuten
   - ✅ Live!

---

## 🚀 MIT CLI DEPLOYEN (NACH LOGIN)

### **Schritt 1: Zum Frontend wechseln**
```bash
cd /home/alex/Projects/Portfolio/OEDP/Bash/frontend
```

### **Schritt 2: Vercel deployen**
```bash
vercel
```

**Fragen beantworten:**
```
? Set up and deploy "~/Projects/Portfolio/OEDP/Bash/frontend"? [Y/n] Y
? Which scope do you want to deploy to? <Dein Account>
? Link to existing project? [y/N] N
? What's your project's name? oedp-md2-frontend
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

### **Schritt 3: Production Deploy**
```bash
vercel --prod
```

### **Schritt 4: Environment Variable setzen**
```bash
vercel env add VITE_API_URL production
# Wert eingeben: https://your-backend.railway.app
```

### **Schritt 5: Neu deployen mit Environment Variable**
```bash
vercel --prod
```

---

## 📋 NACH DEM DEPLOYMENT

### **1. Frontend URL notieren**
```bash
vercel ls
# Oder im Output nach "Production:" suchen
```

**URL Format:**
```
https://oedp-md2-frontend.vercel.app
```

### **2. URL in Railway Backend setzen**
```
Railway Dashboard → Backend Service → Variables
→ FRONTEND_URL = https://oedp-md2-frontend.vercel.app
→ Redeploy
```

### **3. Backend URL in Vercel setzen**
```bash
vercel env add VITE_API_URL production
# Wert: https://your-backend.railway.app

vercel --prod
```

---

## 🔧 VERCEL CLI KOMMANDOS

### **Nützliche Befehle:**
```bash
# Login
vercel login

# Deploy (Preview)
vercel

# Deploy (Production)
vercel --prod

# Projekte auflisten
vercel ls

# Projekt-Info
vercel inspect

# Logs anzeigen
vercel logs

# Environment Variables
vercel env ls
vercel env add KEY
vercel env rm KEY

# Domain verwalten
vercel domains ls
vercel domains add domain.com

# Projekt löschen
vercel remove
```

---

## 🌐 VERCEL DASHBOARD

**Zugriff:**
```
https://vercel.com/dashboard
```

**Hier kannst du:**
- ✅ Deployments sehen
- ✅ Environment Variables verwalten
- ✅ Domains hinzufügen
- ✅ Logs anzeigen
- ✅ Analytics sehen
- ✅ Settings ändern

---

## 🐛 TROUBLESHOOTING

### **Problem: CLI Login funktioniert nicht**
```
Lösung:
1. Browser öffnen: https://vercel.com/device
2. Code eingeben (aus Terminal)
3. Autorisieren
4. Zurück zum Terminal
```

### **Problem: Build Failed**
```
Lösung:
1. Lokal testen:
   cd frontend
   npm install
   npm run build
   
2. Logs prüfen:
   vercel logs
```

### **Problem: Environment Variables nicht geladen**
```
Lösung:
1. Vercel Dashboard → Projekt → Settings → Environment Variables
2. Alle mit VITE_ Prefix
3. Neu deployen: vercel --prod
```

### **Problem: API Connection Error**
```
Lösung:
1. VITE_API_URL korrekt gesetzt?
2. Backend läuft auf Railway?
3. CORS konfiguriert?
4. Health Check: curl https://backend.railway.app/health
```

---

## ✅ DEPLOYMENT CHECKLISTE

### **Vorbereitung:**
- [x] Code auf GitHub
- [x] Vercel CLI installiert
- [ ] Vercel Login

### **Deployment:**
- [ ] `cd frontend`
- [ ] `vercel` (Preview)
- [ ] `vercel --prod` (Production)
- [ ] Environment Variable gesetzt
- [ ] Frontend URL notiert

### **Verbindung:**
- [ ] Railway: FRONTEND_URL gesetzt
- [ ] Vercel: VITE_API_URL gesetzt
- [ ] Beide redeployed
- [ ] Getestet

---

## 🎯 SCHNELLSTER WEG

### **Wenn CLI-Login schwierig ist:**

**Nutze die Vercel Website:**
1. https://vercel.com → Login
2. Import Repository
3. Deploy!

**Dauert nur 5 Minuten!**

---

## 💡 EMPFEHLUNG

**Für den ersten Deploy:**
→ **Nutze die Vercel Website** (einfacher)

**Für spätere Updates:**
→ **Nutze CLI** (schneller)

---

## 🔗 WICHTIGE LINKS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Device Login:** https://vercel.com/device
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Repo:** https://github.com/alex321123s/oedp-md2

---

## ⚡ JETZT DEPLOYEN!

### **CLI Methode:**
```bash
# 1. Login abschließen (Device Code)
# Terminal zeigt: Visit vercel.com/device

# 2. Frontend deployen
cd frontend
vercel --prod

# 3. Environment Variable
vercel env add VITE_API_URL production
# Wert: https://your-backend.railway.app

# 4. Neu deployen
vercel --prod
```

### **Website Methode:**
```
1. https://vercel.com
2. Import: alex321123s/oedp-md2
3. Root: frontend
4. Deploy!
```

---

**Los geht's!** 🚀

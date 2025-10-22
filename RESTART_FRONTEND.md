# 🔄 FRONTEND NEU STARTEN - WICHTIG!

## ⚠️ PROBLEM

Das Frontend lädt die `.env` Datei nicht neu und versucht immer noch auf `localhost:3000` zuzugreifen.

---

## ✅ LÖSUNG: FRONTEND NEU STARTEN

### **Schritt 1: Frontend stoppen**

Im Terminal wo das Frontend läuft:
```bash
Drücke: Ctrl+C
```

### **Schritt 2: Frontend neu starten**

```bash
cd frontend
npm run dev
```

### **Schritt 3: Browser neu laden**

Öffne: `http://localhost:5173`

Drücke: **Ctrl+Shift+R** (Hard Reload)

Oder öffne **DevTools** (F12) → Rechtsklick auf Reload → "Empty Cache and Hard Reload"

---

## 🔍 PRÜFEN OB ES FUNKTIONIERT

### **DevTools Console öffnen (F12)**

Prüfe die Network-Requests:
```
Sollte sein: http://localhost:3001/api/...
NICHT:       http://localhost:3000/api/...
```

---

## ✅ BACKEND LÄUFT?

Stelle sicher, dass das Backend auch läuft:

```bash
curl http://localhost:3001/health
```

**Erwartete Antwort:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123.45
}
```

**Wenn Backend nicht läuft:**
```bash
cd backend
npm run dev
```

---

## 📋 VOLLSTÄNDIGER NEUSTART

Wenn es immer noch nicht funktioniert:

### **1. Beide Services stoppen**
```bash
# Frontend: Ctrl+C
# Backend: Ctrl+C
```

### **2. Backend starten**
```bash
cd backend
npm run dev
```

Warte bis du siehst:
```
✅ Database connected
🚀 Server running on port 3001
```

### **3. Frontend starten (neues Terminal)**
```bash
cd frontend
npm run dev
```

Warte bis du siehst:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### **4. Browser öffnen**
```
http://localhost:5173
```

**Hard Reload:** Ctrl+Shift+R

---

## 🐛 WENN ES IMMER NOCH NICHT FUNKTIONIERT

### **Problem 1: .env wird nicht geladen**

**Prüfe:**
```bash
cd frontend
cat .env
```

**Sollte sein:**
```
VITE_API_URL=http://localhost:3001
```

**Wenn falsch oder leer:**
```bash
echo "VITE_API_URL=http://localhost:3001" > .env
```

### **Problem 2: Browser Cache**

**Lösung:**
1. Öffne DevTools (F12)
2. Application Tab → Clear Storage
3. "Clear site data"
4. Seite neu laden

### **Problem 3: Falscher Port**

**Prüfe welche Ports belegt sind:**
```bash
# Backend Port
lsof -i :3001

# Frontend Port
lsof -i :5173
```

---

## 💡 SCHNELL-CHECK

```bash
# 1. Backend läuft?
curl http://localhost:3001/health

# 2. Frontend läuft?
curl http://localhost:5173

# 3. .env korrekt?
cat frontend/.env

# 4. Beide laufen? → Browser neu laden mit Ctrl+Shift+R
```

---

## ✅ NACH DEM NEUSTART

### **Test 1: Console Errors**
```
Öffne DevTools (F12) → Console
Sollte KEINE Errors mehr zeigen
```

### **Test 2: Network Requests**
```
DevTools → Network Tab
Requests sollten gehen zu: localhost:3001
NICHT zu: localhost:3000
```

### **Test 3: Login**
```
Email: admin@oedp.de
Password: Admin123!
```

---

**Starte jetzt das Frontend neu!** 🚀

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:5173
# Hard Reload: Ctrl+Shift+R
```

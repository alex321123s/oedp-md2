# ✅ RECHTLICHE DOKUMENTE AKTUALISIERT!

## 🎯 Was wurde geändert

Die Links im Footer zeigen jetzt auf die **echten Dokumente von der ÖDP-Website** (www.oedp.de).

---

## 📋 AKTUALISIERTE LINKS

### Im Footer sichtbar:

#### 1. Satzung der ÖDP
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Satzung_OeDP.pdf
- **Beschreibung:** Parteisatzung (§§1-17) - Höchste interne Rechtsgrundlage

#### 2. Finanzordnung
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Finanzordnung_OeDP.pdf
- **Beschreibung:** Regelungen zu Mitgliedsbeiträgen, Finanzverwaltung und Haushalt

#### 3. Schiedsgerichtsordnung
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Schiedsgerichtsordnung_OeDP.pdf
- **Beschreibung:** Verfahrensregeln für interne Streitschlichtung

#### 4. Grundsatzprogramm
- **URL:** https://www.oedp.de/programm/grundsatzprogramm
- **Beschreibung:** Grundlegende politische Positionen und Werte

#### 5. Bundesprogramm
- **URL:** https://www.oedp.de/programm
- **Beschreibung:** Aktuelle politische Positionen der ÖDP

---

## 📁 ZUSÄTZLICHE DOKUMENTE (in Daten-Datei)

### Geschäftsordnungen:

#### GO Bundesparteitag
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/GO_BPT.pdf
- **Beschreibung:** Verfahrensregeln für Debatten, Abstimmungen und Quorum des BPT

#### GO Bundeshauptausschuss
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/GO_BHA.pdf
- **Beschreibung:** Verfahrensregeln für den Bundeshauptausschuss

#### GO Bundesarbeitskreise
- **URL:** https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/GO_BAK.pdf
- **Beschreibung:** Regelungen für die interne Arbeit der Bundesarbeitskreise

---

## 🔧 GEÄNDERTE DATEIEN

### 1. `frontend/src/components/Layout.tsx`
**Footer-Sektion aktualisiert:**
```tsx
<div>
  <h3 className="font-bold text-lg mb-3">Rechtliche Dokumente</h3>
  <ul className="space-y-2 text-sm">
    <li><a href="https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Satzung_OeDP.pdf" 
           target="_blank" rel="noopener noreferrer">Satzung der ÖDP</a></li>
    <li><a href="https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Finanzordnung_OeDP.pdf" 
           target="_blank" rel="noopener noreferrer">Finanzordnung</a></li>
    <li><a href="https://www.oedp.de/fileadmin/user_upload/bundesverband/dokumente/Schiedsgerichtsordnung_OeDP.pdf" 
           target="_blank" rel="noopener noreferrer">Schiedsgerichtsordnung</a></li>
    <li><a href="https://www.oedp.de/programm/grundsatzprogramm" 
           target="_blank" rel="noopener noreferrer">Grundsatzprogramm</a></li>
    <li><a href="https://www.oedp.de/programm" 
           target="_blank" rel="noopener noreferrer">Bundesprogramm</a></li>
  </ul>
</div>
```

### 2. `frontend/src/data/legalDocuments.ts`
**Alle URLs aktualisiert:**
- Von lokalen Pfaden (`/documents/...`)
- Zu ÖDP-Website URLs (`https://www.oedp.de/...`)

---

## ✅ VORTEILE

### Für Benutzer
- ✅ **Echte Dokumente** - Direkt von der offiziellen ÖDP-Website
- ✅ **Immer aktuell** - Wenn ÖDP Dokumente aktualisiert, sind sie sofort verfügbar
- ✅ **Vertrauenswürdig** - Offizielle Quelle
- ✅ **Keine Duplikate** - Keine lokalen Kopien nötig

### Für Entwickler
- ✅ **Wartungsfrei** - Keine lokalen PDFs zu pflegen
- ✅ **Automatisch aktuell** - ÖDP pflegt die Dokumente
- ✅ **Weniger Speicher** - Keine großen PDF-Dateien im Repository
- ✅ **Einfacher** - Nur Links, keine Dateiverwaltung

### Für die Partei
- ✅ **Zentrale Verwaltung** - Ein Ort für alle Dokumente
- ✅ **Konsistenz** - Alle Plattformen zeigen gleiche Dokumente
- ✅ **Rechtssicherheit** - Offizielle Versionen verlinkt

---

## 🌐 WIE ES FUNKTIONIERT

### Im Footer (auf jeder Seite):
```
┌─────────────────────────────────────┐
│ Rechtliche Dokumente                │
│ • Satzung der ÖDP          ↗        │
│ • Finanzordnung            ↗        │
│ • Schiedsgerichtsordnung   ↗        │
│ • Grundsatzprogramm        ↗        │
│ • Bundesprogramm           ↗        │
└─────────────────────────────────────┘
```

**Beim Klick:**
- Link öffnet in neuem Tab (`target="_blank"`)
- Sicherheitsattribute gesetzt (`rel="noopener noreferrer"`)
- Zeigt PDF oder Website von www.oedp.de

---

## 🧪 TESTEN

### 1. Frontend öffnen
```
http://localhost:5173
```

### 2. Zum Footer scrollen
- Ganz unten auf jeder Seite
- Sektion "Rechtliche Dokumente"

### 3. Links klicken
- Jeder Link öffnet in neuem Tab
- Zeigt Dokument von www.oedp.de
- PDFs öffnen direkt im Browser

---

## 📝 DOKUMENTEN-STRUKTUR

### Verfassung (Constitution)
```
Satzung der ÖDP
└── Höchste interne Rechtsgrundlage
```

### Ordnungen (Regulations)
```
Finanzordnung
└── Mitgliedsbeiträge, Finanzverwaltung

Schiedsgerichtsordnung
└── Streitschlichtung, Disziplinarverfahren
```

### Geschäftsordnungen (Procedures)
```
GO Bundesparteitag
└── Verfahrensregeln BPT

GO Bundeshauptausschuss
└── Verfahrensregeln BHA

GO Bundesarbeitskreise
└── Regelungen für BAKs
```

### Programme (Policy)
```
Grundsatzprogramm
└── Grundlegende Positionen

Bundesprogramm
└── Aktuelle politische Positionen
```

---

## ✅ ZUSAMMENFASSUNG

**✅ Alle Links zeigen auf www.oedp.de**  
**✅ Footer auf jeder Seite sichtbar**  
**✅ 5 Hauptdokumente im Footer**  
**✅ 8 Dokumente insgesamt in Daten-Datei**  
**✅ Neue Tabs mit Sicherheitsattributen**  
**✅ Wartungsfrei und immer aktuell**

**Die rechtlichen Dokumente sind jetzt mit der offiziellen ÖDP-Website verknüpft!** 🎉

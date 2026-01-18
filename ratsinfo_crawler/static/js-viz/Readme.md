# Frontend Architecture & Module Overview

This document explains the modular design of the visualization system and how the frontend and backend work together.

---

## 1. Frontend & Backend Zusammenarbeit

### **Das Backend (Python/Flask)** – Der Arbeiter
Das Backend macht die schwere Arbeit:
- Liest die CSV-Datei mit allen Dokumenten
- Sucht nach den gesuchten Stichwörtern in den Dokumenttexten
- Zählt, wie oft jedes Wort vorkommt
- Gruppiert die Ergebnisse nach Monaten
- Bereitet die Daten auf (aggregiert, sortiert)
- Sendet die aufbereiteten Daten als JSON zum Frontend

### **Das Frontend (JavaScript/D3)** – Der Visualisierer
Das Frontend macht die Daten sichtbar:
- Nimmt die JSON-Daten vom Backend entgegen
- Bereitet sie für D3-Grafiken auf (z.B. Datum-Konvertierung)
- Zeichnet schöne, interaktive Visualisierungen
- Reagiert auf User-Interaktion (Klicks, Hover, Suche)
- Macht die Anwendung responsiv und benutzerfreundlich

### **So funktioniert's:**
```
User sucht nach "Klima" und klickt auf "Search"
   ↓
Frontend sendet HTTP-Anfrage: GET /trend?word=Klima
   ↓
Backend liest data.csv, filtert, zählt, gruppiert nach Monat
   ↓
Backend schickt JSON zurück:
[
  {month: "2024-01", count: 5},
  {month: "2024-02", count: 8},
  ...
]
   ↓
Frontend konvertiert Daten und zeichnet D3-Liniendiagramm
   ↓
User sieht Zeittrend visualisiert ✨
```

---

## 2. JavaScript-Dateien & ihre Aufgaben

### **api.js**
Sendet Anfragen an das Backend und empfängt Daten.

**Funktionen:**
- `fetchTrend(word)` – Holt monatliche Trenddaten
- `fetchDocuments(word)` – Holt gefundene Dokumente mit Counts

---

### **transforms.js**
Bereitet Rohdaten für D3-Grafiken auf.

**Funktionen:**
- `prepareTrendData(trendData)` – Konvertiert "2024-01" zu JavaScript-Daten
- `getTopDocuments(documents, limit)` – Filtert Top-N Dokumente nach Count

---

### **visualize.js**
Zeichnet D3-Grafiken.

**Funktionen:**
- `renderTrendChart(data, selector, options)` – Liniendiagramm für Zeitreihen
- `renderBarChart(data, selector, options)` – Balkendiagramm für Top-Dokumente

---

### **main.js**
Koordiniert den Ablauf: Events → API → Transform → Visualize.

- Hört auf User-Klicks (Suchbutton, Beispiel-Buttons, Enter)
- Ruft Funktionen in richtiger Reihenfolge auf
- Verwaltet App-Status und Fehlerbehandlung

---

## 3. Zusammenfassung

| Datei | Was es macht |
|-------|--------------|
| **api.js** | HTTP-Anfragen zum Backend |
| **transforms.js** | Daten für D3 aufbereiten |
| **visualize.js** | D3-Grafiken zeichnen |
| **main.js** | Alles koordinieren |


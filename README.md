# SEROS - Aufwandserfassungstool

Ein modernes Zeiterfassungs- und Aufwandsmanagement-Tool mit Supabase-Backend.

## Features

- ✅ **Benutzerauthentifizierung** - Anmeldung & Registrierung über Supabase Auth
- ✅ **Zeiterfassung** - Wöchentliche Erfassung von Arbeitszeiten
- ✅ **Kategorien & PSP-Elemente** - Flexible Zuordnung zu Projekten
- ✅ **Team-Management** - Genehmigung/Ablehnung von Timecards durch Vorgesetzte
- ✅ **Übersichtsseite** - Statistiken und CSV-Export
- ✅ **Stammdatenverwaltung** - Kategorien, Leistungen, PSP-Elemente
- ✅ **Feiertags-Erkennung** - Automatische Erkennung für Baden-Württemberg

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Build Tool**: Vite

## Installation

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

## Supabase Setup

### 1. Supabase Projekt erstellen

Falls noch nicht geschehen, erstellen Sie ein Projekt auf [supabase.com](https://supabase.com).

### 2. Datenbank-Schema ausführen

Führen Sie das SQL-Schema in der Supabase SQL-Konsole aus:

1. Gehen Sie in Ihrem Supabase-Dashboard zu **SQL Editor**
2. Kopieren Sie den Inhalt von `supabase-schema.sql`
3. Führen Sie das SQL aus

### 3. E-Mail-Bestätigung konfigurieren (Optional)

Für Entwicklungszwecke können Sie die E-Mail-Bestätigung deaktivieren:

1. Gehen Sie zu **Authentication** > **Providers** > **Email**
2. Deaktivieren Sie "Confirm email"

### 4. Umgebungsvariablen

Die Supabase-Credentials sind bereits in `lib/supabase.ts` konfiguriert:
- URL: `https://caukwvdizlqtkwbycpaz.supabase.co`
- Anon Key: Bereits eingetragen

## Projektstruktur

```
├── App.tsx                 # Haupt-App-Komponente
├── components/
│   ├── BookingsView.tsx    # Buchungsübersicht
│   ├── Header.tsx          # Navigation & Benutzer-Dropdown
│   ├── LoginView.tsx       # Anmelde-/Registrierungsseite
│   ├── MasterDataView.tsx  # Stammdatenverwaltung
│   ├── OverviewView.tsx    # Statistiken & Export
│   ├── TeamView.tsx        # Team-Management & Genehmigungen
│   └── TrackingView.tsx    # Zeiterfassung
├── contexts/
│   └── AuthContext.tsx     # Authentifizierungs-Context
├── lib/
│   └── supabase.ts         # Supabase Client & Typen
├── services/
│   └── database.ts         # Datenbank-Funktionen
├── utils/
│   └── dateUtils.ts        # Datums-Hilfsfunktionen
├── types.ts                # TypeScript-Typen
├── constants.tsx           # Icons & Konstanten
└── supabase-schema.sql     # Datenbank-Schema
```

## Verwendung

### Registrierung
1. Öffnen Sie die App unter `http://localhost:3000`
2. Klicken Sie auf "Noch kein Konto? Registrieren"
3. Geben Sie Name, E-Mail und Passwort ein
4. Nach Bestätigung der E-Mail können Sie sich anmelden

### Zeiterfassung
1. Wählen Sie die gewünschte Kalenderwoche
2. Fügen Sie Zeilen mit Kategorie, Leistung und PSP-Element hinzu
3. Tragen Sie die Stunden pro Tag ein
4. Klicken Sie auf "Einreichen"

### Team-Management
1. Als Vorgesetzter sehen Sie eingereichte Timecards Ihrer Teammitglieder
2. Klicken Sie auf eine Timecard für Details
3. Genehmigen oder lehnen Sie mit Begründung ab

## Skripte

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktions-Build erstellen
- `npm run preview` - Produktions-Build lokal testen

## Lizenz

Privates Projekt

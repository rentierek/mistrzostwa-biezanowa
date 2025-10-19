# Mistrzostwa Bieżanowa

System zarządzania turniejami EA FC 25 dla Mistrzostw Bieżanowa.

## 🚀 Szybki Start

### 1. Instalacja zależności
```bash
npm install
```

### 2. Konfiguracja bazy danych Supabase

⚠️ **WAŻNE**: Aplikacja obecnie działa w trybie demo. Aby uzyskać pełną funkcjonalność, musisz skonfigurować prawdziwą bazę danych Supabase.

#### Kroki konfiguracji:

1. **Utwórz projekt Supabase:**
   - Idź na [https://supabase.com](https://supabase.com)
   - Zaloguj się lub utwórz konto
   - Utwórz nowy projekt

2. **Pobierz dane konfiguracyjne:**
   - W Dashboard Supabase idź do `Settings > API`
   - Skopiuj `Project URL`
   - Skopiuj `anon public` key

3. **Skonfiguruj zmienne środowiskowe:**
   - Otwórz plik `.env.local`
   - Zastąp `https://placeholder.supabase.co` swoim Project URL
   - Zastąp `placeholder_key_for_demo` swoim anon key

4. **Utwórz strukturę bazy danych:**
   - W Supabase idź do `SQL Editor`
   - Skopiuj całą zawartość pliku `database-schema.sql`
   - Wklej i uruchom SQL

5. **Zrestartuj aplikację:**
   ```bash
   # Zatrzymaj aplikację (Ctrl+C)
   npm run dev
   ```

### 3. Uruchomienie aplikacji
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000)

## 📋 Funkcje

- ✅ **Zarządzanie turniejami** - tworzenie, edycja, usuwanie turniejów
- ✅ **Profile graczy** - szczegółowe statystyki i historia meczów  
- ✅ **System osiągnięć** - trofea i nagrody za wyniki
- ✅ **Panel administratora** - pełne zarządzanie systemem
- ✅ **Automatyczny terminarz** - generowanie harmonogramu round-robin
- ✅ **Tabele ligowe** - automatyczne obliczanie wyników

## 🔧 Panel Administratora

Po skonfigurowaniu bazy danych, panel administratora będzie dostępny pod `/admin` i umożliwi:

- Tworzenie nowych turniejów z automatycznym terminarzem
- Zarządzanie graczami i drużynami
- Wprowadzanie wyników meczów
- Generowanie archiwów turniejów

## 🎯 Tryb Demo vs Produkcja

- **Tryb Demo**: Używa mock danych, funkcje zarządzania wyłączone
- **Tryb Produkcja**: Pełna funkcjonalność z prawdziwą bazą danych

Aplikacja automatycznie wykrywa tryb na podstawie konfiguracji w `.env.local`.

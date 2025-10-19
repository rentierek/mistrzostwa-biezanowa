-- ===================================================================
-- KOMPLETNA NAPRAWA TABELI TOURNAMENTS
-- ===================================================================

-- 1. Sprawdzenie aktualnej struktury tabeli tournaments
SELECT 'AKTUALNA STRUKTURA TABELI TOURNAMENTS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- 2. Dodanie brakujących kolumn do tabeli tournaments
SELECT 'DODAWANIE BRAKUJĄCYCH KOLUMN...' as info;

-- Dodanie kolumny thumbnail_url (dla miniatur turnieju)
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Dodanie kolumny photos (dla galerii zdjęć turnieju)
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Dodanie kolumny videos (dla galerii filmów turnieju)
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- 3. Sprawdzenie czy wszystkie kolumny zostały dodane
SELECT 'SPRAWDZENIE DODANYCH KOLUMN:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND column_name IN ('thumbnail_url', 'photos', 'videos')
ORDER BY column_name;

-- 4. Sprawdzenie przykładowych danych
SELECT 'PRZYKŁADOWE DANE Z TABELI:' as info;
SELECT id, name, is_active, thumbnail_url, 
       COALESCE(array_length(photos, 1), 0) as photos_count,
       COALESCE(array_length(videos, 1), 0) as videos_count
FROM tournaments 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Sprawdzenie czy wszystkie wymagane kolumny istnieją
SELECT 'FINALNE SPRAWDZENIE STRUKTURY:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'thumbnail_url') 
    THEN '✅ thumbnail_url - OK' 
    ELSE '❌ thumbnail_url - BRAK' 
  END as thumbnail_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'photos') 
    THEN '✅ photos - OK' 
    ELSE '❌ photos - BRAK' 
  END as photos_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tournaments' AND column_name = 'videos') 
    THEN '✅ videos - OK' 
    ELSE '❌ videos - BRAK' 
  END as videos_status;

SELECT 'NAPRAWA ZAKOŃCZONA! Możesz teraz testować upload mediów.' as final_message;
-- Sprawdzenie aktualnej struktury tabeli tournaments
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

-- Dodanie brakujących kolumn do tabeli tournaments
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Sprawdzenie czy wszystkie kolumny zostały dodane
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND column_name IN ('thumbnail_url', 'photos', 'videos')
ORDER BY column_name;

-- Sprawdzenie przykładowych danych
SELECT id, name, thumbnail_url, photos, videos 
FROM tournaments 
LIMIT 3;

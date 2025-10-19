-- Dodanie kolumny photos do tabeli tournaments
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Dodanie kolumny videos do tabeli tournaments (jeśli nie istnieje)
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- Sprawdzenie czy kolumny zostały dodane
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND column_name IN ('photos', 'videos');
-- Fix missing photo_url column in players table

-- Add photo_url column if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Verify the column was added
-- You can run this query to check: SELECT column_name FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'photo_url';
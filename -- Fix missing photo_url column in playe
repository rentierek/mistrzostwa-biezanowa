-- Fix missing photo_url column in players table

-- Add photo_url column if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS photo_url TEXT;
-- Fix Storage Bucket RLS Policies
-- This script creates the necessary Row Level Security policies for storage buckets

-- ============================================
-- PLAYER PHOTOS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Allow public read access for player-photos
CREATE POLICY "Public read access for player photos" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');

-- Allow authenticated users to upload to player-photos
CREATE POLICY "Authenticated users can upload player photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update player photos
CREATE POLICY "Authenticated users can update player photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'player-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete player photos
CREATE POLICY "Authenticated users can delete player photos" ON storage.objects
FOR DELETE USING (bucket_id = 'player-photos' AND auth.role() = 'authenticated');

-- ============================================
-- TOURNAMENT MEDIA BUCKET POLICIES
-- ============================================

-- Allow public read access for tournament-media
CREATE POLICY "Public read access for tournament media" ON storage.objects
FOR SELECT USING (bucket_id = 'tournament-media');

-- Allow authenticated users to upload to tournament-media
CREATE POLICY "Authenticated users can upload tournament media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update tournament media
CREATE POLICY "Authenticated users can update tournament media" ON storage.objects
FOR UPDATE USING (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete tournament media
CREATE POLICY "Authenticated users can delete tournament media" ON storage.objects
FOR DELETE USING (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');

-- ============================================
-- ALTERNATIVE: ALLOW ALL OPERATIONS (LESS SECURE BUT SIMPLER)
-- ============================================
-- If the above policies don't work, you can use these more permissive policies:

-- DROP POLICY IF EXISTS "Allow all operations on player photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow all operations on tournament media" ON storage.objects;

-- CREATE POLICY "Allow all operations on player photos" ON storage.objects
-- FOR ALL USING (bucket_id = 'player-photos');

-- CREATE POLICY "Allow all operations on tournament media" ON storage.objects
-- FOR ALL USING (bucket_id = 'tournament-media');
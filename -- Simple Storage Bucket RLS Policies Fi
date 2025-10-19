-- Simple Storage Bucket RLS Policies Fix
-- Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for player photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for tournament media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload tournament media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update tournament media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete tournament media" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on player photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on tournament media" ON storage.objects;

-- Create simple permissive policies
CREATE POLICY "Allow all operations on player photos" ON storage.objects
FOR ALL USING (bucket_id = 'player-photos');

CREATE POLICY "Allow all operations on tournament media" ON storage.objects
FOR ALL USING (bucket_id = 'tournament-media');
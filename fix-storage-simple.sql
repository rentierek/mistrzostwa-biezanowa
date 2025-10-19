-- Simple Storage Bucket RLS Policies Fix
-- This script creates permissive policies that allow all operations on storage buckets

-- ============================================
-- REMOVE ALL EXISTING STORAGE POLICIES
-- ============================================

-- Drop all existing policies to start fresh
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

-- ============================================
-- CREATE SIMPLE PERMISSIVE POLICIES
-- ============================================

-- Allow all operations on player-photos bucket
CREATE POLICY "Allow all operations on player photos" ON storage.objects
FOR ALL USING (bucket_id = 'player-photos');

-- Allow all operations on tournament-media bucket
CREATE POLICY "Allow all operations on tournament media" ON storage.objects
FOR ALL USING (bucket_id = 'tournament-media');

-- ============================================
-- VERIFY POLICIES ARE APPLIED
-- ============================================

-- You can run this query to verify the policies were created:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
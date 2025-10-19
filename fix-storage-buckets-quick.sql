-- 🚀 Szybka naprawa Storage Buckets
-- Skopiuj i wklej do SQL Editor w Supabase Dashboard

-- ============================================
-- USUŃ STARE POLITYKI (jeśli istnieją)
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on player photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on tournament media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for player photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for tournament media" ON storage.objects;

-- ============================================
-- UTWÓRZ PROSTE POLITYKI DOSTĘPU
-- ============================================

-- Pozwól na wszystkie operacje dla bucket'a player-photos
CREATE POLICY "Allow all operations on player photos" ON storage.objects
FOR ALL USING (bucket_id = 'player-photos');

-- Pozwól na wszystkie operacje dla bucket'a tournament-media
CREATE POLICY "Allow all operations on tournament media" ON storage.objects
FOR ALL USING (bucket_id = 'tournament-media');

-- ============================================
-- SPRAWDŹ CZY POLITYKI ZOSTAŁY UTWORZONE
-- ============================================
SELECT 
    policyname, 
    tablename, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%player photos%' OR policyname LIKE '%tournament media%';
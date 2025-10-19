# Supabase Storage Setup

## Required Storage Buckets

The application requires two storage buckets to be created in your Supabase project:

### 1. `player-photos`
- **Purpose**: Stores player profile pictures
- **Used by**: Player profile photo upload functionality
- **File types**: Images (JPG, PNG, etc.)
- **Path structure**: `player-photos/{playerId}-{timestamp}.{extension}`

### 2. `tournament-media`
- **Purpose**: Stores tournament photos, videos, and thumbnails
- **Used by**: Tournament media upload functionality
- **File types**: Images and videos
- **Path structure**: 
  - Photos: `tournament-media/photos/{tournamentId}-{timestamp}.{extension}`
  - Videos: `tournament-media/videos/{tournamentId}-{timestamp}.{extension}`
  - Thumbnails: `tournament-media/thumbnails/{tournamentId}-{timestamp}.{extension}`

## How to Create Storage Buckets

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Access Storage**
   - Click on "Storage" in the left sidebar
   - Click on "Buckets" tab

3. **Create the buckets**
   - Click "New bucket"
   - Create bucket named `player-photos`
   - Set it as **Public** (required for displaying images)
   - Click "Create bucket"
   
   - Repeat for `tournament-media`
   - Set it as **Public** as well

## Bucket Policies

Both buckets should be configured as **Public** with the following policies:

### For `player-photos`:
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'player-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'player-photos' AND auth.role() = 'authenticated');
```

### For `tournament-media`:
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'tournament-media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'tournament-media' AND auth.role() = 'authenticated');
```

## Current Issues

### "Bucket not found" Error
If you're seeing "Bucket not found" errors when uploading photos, it means the required storage buckets haven't been created yet. Follow the steps above to create them.

### File Upload Errors
- Ensure buckets are set to **Public**
- Check that the bucket policies allow the required operations
- Verify your Supabase project URL and anon key are correctly configured

## Testing the Setup

After creating the buckets, you can test:

1. **Player Photos**: Go to any player profile and try uploading a photo
2. **Tournament Media**: Create or edit a tournament and try uploading photos/videos

If uploads work without "Bucket not found" errors, the setup is complete!
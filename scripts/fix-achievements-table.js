const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAchievementsTable() {
  console.log('🔧 Fixing achievements table structure...');
  
  try {
    // First, let's check what columns currently exist
    console.log('📋 Checking current table structure...');
    
    const { data: currentAchievements, error: selectError } = await supabase
      .from('achievements')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Error checking achievements table:', selectError.message);
      
      // Table might not exist, let's create it
      console.log('🔨 Creating achievements table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS achievements (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
          tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
          achievement_type VARCHAR(50) NOT NULL,
          achievement_rank INTEGER,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          icon_url TEXT,
          value INTEGER,
          achievement_date DATE DEFAULT CURRENT_DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          -- Ensure valid achievement types
          CONSTRAINT valid_achievement_type CHECK (achievement_type IN ('tournament_winner', 'top_scorer', 'defensive_leader', 'most_conceded', 'king_of_emotions')),
          -- Ensure valid ranks for tournament winners
          CONSTRAINT valid_tournament_rank CHECK (
            (achievement_type = 'tournament_winner' AND achievement_rank IN (1, 2, 3)) OR
            (achievement_type != 'tournament_winner' AND achievement_rank IS NULL)
          )
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);
        CREATE INDEX IF NOT EXISTS idx_achievements_tournament ON achievements(tournament_id);
      `;
      
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('Please execute the following SQL in your Supabase SQL Editor:');
      console.log('\n--- SQL TO EXECUTE ---');
      console.log(createTableSQL);
      console.log('--- END SQL ---\n');
      
    } else {
      console.log('✅ Achievements table exists');
      
      // Check if required columns exist by trying to select them
      const { data: testData, error: testError } = await supabase
        .from('achievements')
        .select('achievement_type, achievement_rank')
        .limit(1);
      
      if (testError) {
        console.log('❌ Missing required columns. Error:', testError.message);
        
        const alterTableSQL = `
          -- Add missing columns to achievements table
          ALTER TABLE achievements 
          ADD COLUMN IF NOT EXISTS achievement_type VARCHAR(50),
          ADD COLUMN IF NOT EXISTS achievement_rank INTEGER,
          ADD COLUMN IF NOT EXISTS title VARCHAR(255),
          ADD COLUMN IF NOT EXISTS description TEXT,
          ADD COLUMN IF NOT EXISTS icon_url TEXT,
          ADD COLUMN IF NOT EXISTS value INTEGER,
          ADD COLUMN IF NOT EXISTS achievement_date DATE DEFAULT CURRENT_DATE;
          
          -- Update achievement_type to NOT NULL after adding default values
          UPDATE achievements SET achievement_type = 'tournament_winner' WHERE achievement_type IS NULL;
          UPDATE achievements SET title = 'Achievement' WHERE title IS NULL;
          
          ALTER TABLE achievements 
          ALTER COLUMN achievement_type SET NOT NULL,
          ALTER COLUMN title SET NOT NULL;
          
          -- Add constraints
          ALTER TABLE achievements 
          ADD CONSTRAINT IF NOT EXISTS valid_achievement_type 
          CHECK (achievement_type IN ('tournament_winner', 'top_scorer', 'defensive_leader', 'most_conceded', 'king_of_emotions'));
          
          ALTER TABLE achievements 
          ADD CONSTRAINT IF NOT EXISTS valid_tournament_rank 
          CHECK (
            (achievement_type = 'tournament_winner' AND achievement_rank IN (1, 2, 3)) OR
            (achievement_type != 'tournament_winner' AND achievement_rank IS NULL)
          );
        `;
        
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('Please execute the following SQL in your Supabase SQL Editor:');
        console.log('\n--- SQL TO EXECUTE ---');
        console.log(alterTableSQL);
        console.log('--- END SQL ---\n');
        
      } else {
        console.log('✅ All required columns exist');
        
        // Now create the achievement function
        console.log('🔧 Creating award_tournament_achievements function...');
        
        const functionSQL = `
          CREATE OR REPLACE FUNCTION award_tournament_achievements(tournament_uuid UUID)
          RETURNS VOID AS $$
          DECLARE
              tournament_name VARCHAR(255);
          BEGIN
              -- Get tournament name
              SELECT name INTO tournament_name FROM tournaments WHERE id = tournament_uuid;
              
              -- Clear existing achievements for this tournament
              DELETE FROM achievements WHERE tournament_id = tournament_uuid;
              
              -- Award tournament winner achievements (1st, 2nd, 3rd place)
              WITH tournament_standings AS (
                  SELECT 
                      player_id,
                      nickname,
                      points,
                      goal_difference,
                      goals_for,
                      ROW_NUMBER() OVER (ORDER BY points DESC, goal_difference DESC, goals_for DESC) as position
                  FROM league_table_view 
                  WHERE tournament_id = tournament_uuid
              )
              INSERT INTO achievements (player_id, tournament_id, achievement_type, achievement_rank, title, description, value)
              SELECT 
                  player_id,
                  tournament_uuid,
                  'tournament_winner',
                  position,
                  CASE 
                      WHEN position = 1 THEN '🥇 Mistrz Turnieju'
                      WHEN position = 2 THEN '🥈 Wicemistrz Turnieju'
                      WHEN position = 3 THEN '🥉 Trzecie Miejsce'
                  END,
                  CASE 
                      WHEN position = 1 THEN 'Zwyciężca turnieju ' || tournament_name
                      WHEN position = 2 THEN 'Drugie miejsce w turnieju ' || tournament_name
                      WHEN position = 3 THEN 'Trzecie miejsce w turnieju ' || tournament_name
                  END,
                  points
              FROM tournament_standings 
              WHERE position <= 3;
              
              -- Award top scorer achievement
              WITH top_scorers AS (
                  SELECT 
                      player_id,
                      nickname,
                      goals_for,
                      ROW_NUMBER() OVER (ORDER BY goals_for DESC) as rank
                  FROM league_table_view 
                  WHERE tournament_id = tournament_uuid AND goals_for > 0
              )
              INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
              SELECT 
                  player_id,
                  tournament_uuid,
                  'top_scorer',
                  '⚽ Król Strzelców',
                  'Najwięcej bramek w turnieju ' || tournament_name || ' (' || goals_for || ' bramek)',
                  goals_for
              FROM top_scorers 
              WHERE rank = 1;
              
          END;
          $$ LANGUAGE plpgsql;
        `;
        
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('Please execute the following SQL in your Supabase SQL Editor:');
        console.log('\n--- SQL TO EXECUTE ---');
        console.log(functionSQL);
        console.log('--- END SQL ---\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAchievementsTable();
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

async function testAchievementFunction() {
  console.log('🔍 Testing achievement function...');
  
  try {
    // First, get a tournament ID to test with
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);
    
    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('⚠️ No tournaments found to test with');
      return;
    }
    
    const tournament = tournaments[0];
    console.log(`📋 Testing with tournament: ${tournament.name} (${tournament.id})`);
    
    // Test calling the award_tournament_achievements function
    console.log('🎯 Calling award_tournament_achievements function...');
    const { data, error } = await supabase.rpc('award_tournament_achievements', {
      tournament_uuid: tournament.id
    });
    
    if (error) {
      console.error('❌ Error calling award_tournament_achievements:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('💡 The award_tournament_achievements function does not exist in the database.');
        console.log('💡 You need to run the database schema to create this function.');
      }
    } else {
      console.log('✅ Function called successfully!');
      console.log('📊 Result:', data);
      
      // Check if achievements were created
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('tournament_id', tournament.id);
      
      if (achievementsError) {
        console.error('❌ Error fetching achievements:', achievementsError);
      } else {
        console.log(`🏆 Found ${achievements.length} achievements for this tournament:`);
        achievements.forEach(achievement => {
          console.log(`   - ${achievement.title} (${achievement.achievement_type}) for player ${achievement.player_id}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAchievementFunction();
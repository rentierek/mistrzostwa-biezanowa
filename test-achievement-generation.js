const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAchievementGeneration() {
  try {
    console.log('🧪 Testing achievement generation...');
    
    // Get a tournament with matches
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('id, name')
      .limit(1);
    
    if (tournamentsError) {
      throw tournamentsError;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found');
      return;
    }
    
    const tournament = tournaments[0];
    console.log(`📋 Testing with tournament: ${tournament.name} (${tournament.id})`);
    
    // Check if tournament has matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, player1_score, player2_score')
      .eq('tournament_id', tournament.id)
      .not('player1_score', 'is', null)
      .not('player2_score', 'is', null);
    
    if (matchesError) {
      throw matchesError;
    }
    
    console.log(`🏆 Tournament has ${matches?.length || 0} completed matches`);
    
    if (!matches || matches.length === 0) {
      console.log('⚠️ No completed matches found, cannot test achievement generation');
      return;
    }
    
    // Clear existing achievements for this tournament
    console.log('🧹 Clearing existing achievements...');
    await supabase
      .from('achievements')
      .delete()
      .eq('tournament_id', tournament.id);
    
    // Test the RPC function first
    console.log('🎯 Testing database function...');
    const { error: rpcError } = await supabase.rpc('award_tournament_achievements', {
      tournament_uuid: tournament.id
    });
    
    if (rpcError) {
      console.log('⚠️ Database function failed:', rpcError.message);
      console.log('🔄 This will trigger the fallback method in the app');
    } else {
      console.log('✅ Database function executed successfully');
    }
    
    // Check achievements after function call
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('tournament_id', tournament.id);
    
    if (achievementsError) {
      throw achievementsError;
    }
    
    console.log(`🏅 Found ${achievements?.length || 0} achievements after generation`);
    
    if (achievements && achievements.length > 0) {
      console.log('🎉 Achievement generation test PASSED');
      achievements.forEach(achievement => {
        console.log(`  - ${achievement.title}: ${achievement.description}`);
      });
    } else {
      console.log('❌ Achievement generation test FAILED - no achievements created');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAchievementGeneration();
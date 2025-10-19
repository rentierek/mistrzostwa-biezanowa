const { createClient } = require('@supabase/supabase-js');

// Use the same environment variables as the Next.js app
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

console.log('🔍 Testing database connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Key:', supabaseKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tournaments')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Get all tournaments
    console.log('\n📊 Fetching tournaments...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tournamentsError) {
      console.error('❌ Error fetching tournaments:', tournamentsError.message);
      return;
    }
    
    console.log(`✅ Found ${tournaments?.length || 0} tournaments:`);
    
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach((tournament, index) => {
        console.log(`   ${index + 1}. ${tournament.name} (${tournament.is_active ? 'Active' : 'Inactive'})`);
      });
    } else {
      console.log('   No tournaments found');
    }
    
    // Get all players
    console.log('\n👥 Fetching players...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .order('nickname');
    
    if (playersError) {
      console.error('❌ Error fetching players:', playersError.message);
      return;
    }
    
    console.log(`✅ Found ${players?.length || 0} players:`);
    if (players && players.length > 0) {
      players.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.nickname}`);
      });
    }
    
    // Get all teams
    console.log('\n🏆 Fetching teams...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError.message);
      return;
    }
    
    console.log(`✅ Found ${teams?.length || 0} teams:`);
    if (teams && teams.length > 0) {
      teams.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();
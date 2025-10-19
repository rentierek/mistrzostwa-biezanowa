const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTournamentIds() {
  try {
    console.log('🔍 Getting tournament IDs...');
    
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching tournaments:', error.message);
      return;
    }
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No tournaments found');
      return;
    }
    
    console.log(`\n📊 Found ${tournaments.length} tournaments:\n`);
    
    tournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.name}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Status: ${tournament.is_active ? '🟢 Active' : '🔴 Inactive'}`);
      console.log(`   URL: http://localhost:3000/tournament/${tournament.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getTournamentIds();
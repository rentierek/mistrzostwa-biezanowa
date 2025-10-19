const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase config for testing
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeamLogos() {
  try {
    console.log('🔍 Sprawdzanie log klubów...');
    
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, badge_url');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📊 Analiza log klubów:');
    console.log('='.repeat(50));
    
    const teamsWithLogos = teams.filter(team => team.badge_url);
    const teamsWithoutLogos = teams.filter(team => !team.badge_url);
    
    console.log(`✅ Kluby z logami (${teamsWithLogos.length}):`);
    teamsWithLogos.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
    });
    
    console.log(`\n❌ Kluby bez log (${teamsWithoutLogos.length}):`);
    teamsWithoutLogos.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id})`);
    });
    
    console.log(`\n📈 Podsumowanie:`);
    console.log(`  Łącznie klubów: ${teams.length}`);
    console.log(`  Z logami: ${teamsWithLogos.length}`);
    console.log(`  Bez log: ${teamsWithoutLogos.length}`);
    console.log(`  Pokrycie: ${((teamsWithLogos.length / teams.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTeamLogos();
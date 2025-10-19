const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDecemberMatches() {
  try {
    console.log('🔍 Checking December tournament matches...');
    
    // Get December tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_active', true);
    
    if (!tournaments || tournaments.length === 0) {
      console.error('❌ No active tournament found');
      return;
    }
    
    const decemberTournament = tournaments[0];
    console.log(`✅ Found active tournament: ${decemberTournament.name}`);
    
    // Get matches with full details
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        *,
        player1:players!matches_player1_id_fkey(nickname),
        player2:players!matches_player2_id_fkey(nickname),
        team1:teams!matches_team1_id_fkey(name),
        team2:teams!matches_team2_id_fkey(name)
      `)
      .eq('tournament_id', decemberTournament.id)
      .order('match_date');
    
    console.log(`\n📊 Found ${matches?.length || 0} matches`);
    
    if (matches && matches.length > 0) {
      // Analyze team assignments
      const teamAssignments = new Map();
      
      matches.forEach(match => {
        if (match.team1 && match.player1) {
          teamAssignments.set(match.player1.nickname, match.team1.name);
        }
        if (match.team2 && match.player2) {
          teamAssignments.set(match.player2.nickname, match.team2.name);
        }
      });
      
      console.log('\n🏆 Team Assignments:');
      if (teamAssignments.size > 0) {
        teamAssignments.forEach((team, player) => {
          console.log(`   ${player} -> ${team}`);
        });
      } else {
        console.log('   ❌ No team assignments found!');
      }
      
      // Show first 10 matches
      console.log('\n⚽ Sample matches:');
      matches.slice(0, 10).forEach((match, index) => {
        const p1 = match.player1?.nickname || 'Unknown';
        const p2 = match.player2?.nickname || 'Unknown';
        const t1 = match.team1?.name || 'No team';
        const t2 = match.team2?.name || 'No team';
        const score = match.is_completed ? `${match.player1_score}-${match.player2_score}` : 'Not played';
        
        console.log(`   ${index + 1}. ${p1} (${t1}) vs ${p2} (${t2}) - ${score}`);
      });
      
      // Check for missing team assignments
      const playersWithoutTeams = [];
      matches.forEach(match => {
        if (!match.team1 && match.player1) {
          playersWithoutTeams.push(match.player1.nickname);
        }
        if (!match.team2 && match.player2) {
          playersWithoutTeams.push(match.player2.nickname);
        }
      });
      
      const uniquePlayersWithoutTeams = [...new Set(playersWithoutTeams)];
      if (uniquePlayersWithoutTeams.length > 0) {
        console.log('\n⚠️ Players without team assignments:');
        uniquePlayersWithoutTeams.forEach(player => {
          console.log(`   - ${player}`);
        });
      }
      
    } else {
      console.log('❌ No matches found for December tournament');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDecemberMatches();
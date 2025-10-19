const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Team assignments based on user's image
const desiredTeamAssignments = {
  'Bartus': 'Liverpool FC',
  'Grzesiu': 'Bayern Munich', 
  'Karol': 'Manchester City',
  'Mati': 'Paris Saint-Germain',
  'Michu': 'FC Barcelona',
  'Wilku': 'Arsenal FC',
  'Sebus': 'Real Madrid',
  'Kula': 'Borussia Dortmund'
};

async function updateDecemberTeams() {
  try {
    console.log('🔍 Updating December tournament team assignments...');
    
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
    
    // Get all players and teams
    const [playersResult, teamsResult] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('teams').select('*')
    ]);
    
    const players = playersResult.data || [];
    const teams = teamsResult.data || [];
    
    // Create lookup maps
    const playerMap = new Map(players.map(p => [p.nickname, p.id]));
    const teamMap = new Map(teams.map(t => [t.name, t.id]));
    
    console.log('\n🔄 Updating team assignments...');
    
    // Get all matches for the tournament
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', decemberTournament.id);
    
    if (!matches || matches.length === 0) {
      console.log('❌ No matches found to update');
      return;
    }
    
    let updatedCount = 0;
    
    // Update each match with new team assignments
    for (const match of matches) {
      const player1Id = match.player1_id;
      const player2Id = match.player2_id;
      
      // Find player nicknames
      const player1 = players.find(p => p.id === player1Id);
      const player2 = players.find(p => p.id === player2Id);
      
      if (!player1 || !player2) {
        console.log(`⚠️ Could not find players for match ${match.id}`);
        continue;
      }
      
      // Get new team assignments
      const newTeam1Name = desiredTeamAssignments[player1.nickname];
      const newTeam2Name = desiredTeamAssignments[player2.nickname];
      
      if (!newTeam1Name || !newTeam2Name) {
        console.log(`⚠️ No team assignment found for ${player1.nickname} or ${player2.nickname}`);
        continue;
      }
      
      const newTeam1Id = teamMap.get(newTeam1Name);
      const newTeam2Id = teamMap.get(newTeam2Name);
      
      if (!newTeam1Id || !newTeam2Id) {
        console.log(`⚠️ Team not found: ${newTeam1Name} or ${newTeam2Name}`);
        continue;
      }
      
      // Update the match
      const { error } = await supabase
        .from('matches')
        .update({
          team1_id: newTeam1Id,
          team2_id: newTeam2Id
        })
        .eq('id', match.id);
      
      if (error) {
        console.error(`❌ Error updating match ${match.id}:`, error.message);
      } else {
        updatedCount++;
        if (updatedCount <= 5) { // Show first 5 updates
          console.log(`   ✅ ${player1.nickname} (${newTeam1Name}) vs ${player2.nickname} (${newTeam2Name})`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} matches with new team assignments`);
    
    // Show final team assignments
    console.log('\n🏆 New Team Assignments:');
    Object.entries(desiredTeamAssignments).forEach(([player, team]) => {
      console.log(`   ${player} -> ${team}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateDecemberTeams();
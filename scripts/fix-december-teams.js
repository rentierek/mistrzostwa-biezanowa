const { createClient } = require('@supabase/supabase-js');

// Use environment variables directly
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDecemberTeams() {
  try {
    console.log('🔍 Finding December tournament...');
    
    // Get December tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('*')
      .ilike('name', '%grudzień%');
    
    if (!tournaments || tournaments.length === 0) {
      console.error('❌ December tournament not found');
      return;
    }
    
    const decemberTournament = tournaments[0];
    console.log(`✅ Found tournament: ${decemberTournament.name}`);
    
    // Get all players
    const { data: players } = await supabase
      .from('players')
      .select('*');
    
    // Get all teams
    const { data: teams } = await supabase
      .from('teams')
      .select('*');
    
    // Create player lookup
    const playerLookup = {};
    players.forEach(p => {
      playerLookup[p.nickname.toLowerCase()] = p.id;
    });
    
    // Create team lookup
    const teamLookup = {};
    teams.forEach(t => {
      teamLookup[t.name.toLowerCase()] = t.id;
    });
    
    console.log('👥 Available players:', Object.keys(playerLookup));
    console.log('⚽ Available teams:', Object.keys(teamLookup));
    
    // Team assignments based on the image provided by user
    // From the "Losowanie start!" image:
    const teamAssignments = [
      { player: 'bartus', team: 'liverpool fc' },
      { player: 'grzesiu', team: 'bayern munich' },
      { player: 'karol', team: 'manchester city' },
      { player: 'mati', team: 'paris saint-germain' },
      { player: 'michu', team: 'fc barcelona' },
      { player: 'wilku', team: 'arsenal fc' },
      { player: 'sebus', team: 'real madrid' },
      { player: 'kula', team: 'borussia dortmund' }
    ];
    
    console.log('📝 Adding team assignments...');
    
    // Clear existing assignments
    const { error: deleteError } = await supabase
      .from('tournament_players')
      .delete()
      .eq('tournament_id', decemberTournament.id);
    
    if (deleteError) {
      console.error('❌ Error clearing existing assignments:', deleteError);
      return;
    }
    
    console.log('🗑️  Cleared existing assignments');
    
    // Add new assignments
    for (const assignment of teamAssignments) {
      const playerId = playerLookup[assignment.player];
      const teamId = teamLookup[assignment.team];
      
      if (!playerId) {
        console.error(`❌ Player not found: ${assignment.player}`);
        continue;
      }
      
      if (!teamId) {
        console.error(`❌ Team not found: ${assignment.team}`);
        continue;
      }
      
      const { error } = await supabase
        .from('tournament_players')
        .insert({
          tournament_id: decemberTournament.id,
          player_id: playerId,
          team_id: teamId
        });
      
      if (error) {
        console.error(`❌ Error adding assignment for ${assignment.player}:`, error);
      } else {
        console.log(`✅ ${assignment.player} -> ${assignment.team}`);
      }
    }
    
    // Verify assignments
    const { data: finalAssignments } = await supabase
      .from('tournament_players')
      .select(`
        *,
        player:players(nickname),
        team:teams(name)
      `)
      .eq('tournament_id', decemberTournament.id);
    
    console.log('🎯 Final team assignments:');
    finalAssignments?.forEach(a => {
      console.log(`   ${a.player.nickname} -> ${a.team.name}`);
    });
    
    console.log('✅ December tournament team assignments fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDecemberTeams();
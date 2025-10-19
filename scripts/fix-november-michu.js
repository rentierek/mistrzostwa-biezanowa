const { createClient } = require('@supabase/supabase-js');

// Use environment variables directly
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNovemberTournament() {
  try {
    console.log('🔍 Finding November tournament...');
    
    // Get November tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('*')
      .ilike('name', '%listopad%');
    
    if (!tournaments || tournaments.length === 0) {
      console.error('❌ November tournament not found');
      return;
    }
    
    const novemberTournament = tournaments[0];
    console.log(`✅ Found tournament: ${novemberTournament.name}`);
    
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
    
    // Check if Michu exists
    const michuId = playerLookup['michu'];
    if (!michuId) {
      console.error('❌ Michu player not found in database');
      return;
    }
    
    console.log('✅ Found Michu player:', michuId);
    
    // Michu's matches from the original table (row 8 in the image)
    // Michu vs: Bartus(1:7), Grzesiu(2:4), Karol(2:2), Kula(1:4), Mati(X), Sebus(1:0), Wilku(1:1)
    const michuMatches = [
      { opponent: 'bartus', michuScore: 1, opponentScore: 7, michuTeam: 'fc barcelona', opponentTeam: 'liverpool fc' },
      { opponent: 'grzesiu', michuScore: 2, opponentScore: 4, michuTeam: 'fc barcelona', opponentTeam: 'bayern munich' },
      { opponent: 'karol', michuScore: 2, opponentScore: 2, michuTeam: 'fc barcelona', opponentTeam: 'manchester city' },
      { opponent: 'kula', michuScore: 1, opponentScore: 4, michuTeam: 'fc barcelona', opponentTeam: 'borussia dortmund' },
      // Michu vs Mati - this is the X in the table, they don't play each other
      { opponent: 'sebus', michuScore: 1, opponentScore: 0, michuTeam: 'fc barcelona', opponentTeam: 'real madrid' },
      { opponent: 'wilku', michuScore: 1, opponentScore: 1, michuTeam: 'fc barcelona', opponentTeam: 'arsenal fc' }
    ];
    
    console.log('📝 Adding Michu matches...');
    
    for (const match of michuMatches) {
      const opponentId = playerLookup[match.opponent];
      const michuTeamId = teamLookup[match.michuTeam];
      const opponentTeamId = teamLookup[match.opponentTeam];
      
      if (!opponentId || !michuTeamId || !opponentTeamId) {
        console.error(`❌ Missing data for match vs ${match.opponent}`);
        continue;
      }
      
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', novemberTournament.id)
        .or(`and(player1_id.eq.${michuId},player2_id.eq.${opponentId}),and(player1_id.eq.${opponentId},player2_id.eq.${michuId})`);
      
      if (existingMatch && existingMatch.length > 0) {
        console.log(`⏭️  Match vs ${match.opponent} already exists`);
        continue;
      }
      
      // Insert new match
      const { error } = await supabase
        .from('matches')
        .insert({
          tournament_id: novemberTournament.id,
          player1_id: michuId,
          player2_id: opponentId,
          team1_id: michuTeamId,
          team2_id: opponentTeamId,
          player1_score: match.michuScore,
          player2_score: match.opponentScore,
          is_completed: true,
          match_date: '2024-11-15T15:00:00Z'
        });
      
      if (error) {
        console.error(`❌ Error adding match vs ${match.opponent}:`, error);
      } else {
        console.log(`✅ Added match: Michu ${match.michuScore}-${match.opponentScore} ${match.opponent}`);
      }
    }
    
    // Verify final count
    const { data: finalMatches } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', novemberTournament.id);
    
    console.log(`🎯 Final match count: ${finalMatches?.length || 0}`);
    console.log('✅ November tournament fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixNovemberTournament();
const { createClient } = require('@supabase/supabase-js');

// Use environment variables directly
const supabaseUrl = 'https://njtcghhfecdxurejmfnf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdGNnaGhmZWNkeHVyZWptZm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NDE5MjksImV4cCI6MjA3NjQxNzkyOX0.hdQNALrC5w6RwD6Ics8JsQnXVDOiojlILA22VJS_sDI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournaments() {
  try {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('=== TOURNAMENTS IN DATABASE ===');
    tournaments.forEach(t => {
      console.log(`ID: ${t.id}`);
      console.log(`Name: ${t.name}`);
      console.log(`Active: ${t.is_active}`);
      console.log(`Start: ${t.start_date}`);
      console.log(`End: ${t.end_date}`);
      console.log('---');
    });
    
    // Check matches for November tournament
    const novemberTournament = tournaments.find(t => t.name.includes('Listopad') || t.name.includes('November'));
    if (novemberTournament) {
      console.log('=== NOVEMBER TOURNAMENT MATCHES ===');
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(nickname),
          player2:players!matches_player2_id_fkey(nickname),
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('tournament_id', novemberTournament.id);
      
      console.log(`Total matches: ${matches?.length || 0}`);
      console.log(`Completed matches: ${matches?.filter(m => m.is_completed).length || 0}`);
      
      // Show unique players
      const players = new Set();
      matches?.forEach(m => {
        players.add(m.player1.nickname);
        players.add(m.player2.nickname);
      });
      console.log(`Players in tournament: ${Array.from(players).join(', ')}`);
    }
    
    // Check December tournament
    const decemberTournament = tournaments.find(t => t.name.includes('Grudzień') || t.name.includes('December'));
    if (decemberTournament) {
      console.log('=== DECEMBER TOURNAMENT TEAM ASSIGNMENTS ===');
      const { data: assignments } = await supabase
        .from('tournament_players')
        .select(`
          *,
          player:players(nickname),
          team:teams(name)
        `)
        .eq('tournament_id', decemberTournament.id);
      
      console.log('Team assignments:');
      assignments?.forEach(a => {
        console.log(`${a.player.nickname} -> ${a.team.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTournaments();
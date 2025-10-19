const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  return envVars;
}

const envVars = loadEnvFile();
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Team assignments based on November 2024 performance
// Top performers get better teams, lower performers get different teams for balance
const teamAssignments = {
  'Bartus': 'Real Madrid',        // 1st place - gets Real Madrid
  'Kula': 'Manchester City',      // 2nd place - gets Man City  
  'Grzesiu': 'Liverpool FC',      // 3rd place - gets Liverpool
  'Sebus': 'Bayern Munich',       // 4th place - gets Bayern
  'Karol': 'Paris Saint-Germain', // 5th place - gets PSG
  'Mati': 'FC Barcelona',         // 6th place - gets Barcelona
  'Wilku': 'Arsenal FC',          // 7th place - gets Arsenal
  'Michu': 'Borussia Dortmund'    // 8th place - gets Dortmund
};

async function createNextTournament() {
  try {
    console.log('🚀 Creating next tournament (December 2024)...');
    
    // Get all players and teams
    const { data: players } = await supabase.from('players').select('*');
    const { data: teams } = await supabase.from('teams').select('*');
    
    if (!players || !teams) {
      throw new Error('Failed to fetch players or teams');
    }
    
    console.log(`✅ Found ${players.length} players and ${teams.length} teams`);
    
    // Create player and team lookup maps
    const playerLookup = {};
    players.forEach(p => playerLookup[p.nickname] = p);
    
    const teamLookup = {};
    teams.forEach(t => teamLookup[t.name] = t);
    
    // Verify all players and teams exist
    for (const [playerName, teamName] of Object.entries(teamAssignments)) {
      if (!playerLookup[playerName]) {
        throw new Error(`Player not found: ${playerName}`);
      }
      if (!teamLookup[teamName]) {
        throw new Error(`Team not found: ${teamName}`);
      }
    }
    console.log('✅ All players and teams verified');
    
    // Delete existing December 2024 tournament if it exists
    const { data: existingTournaments } = await supabase
      .from('tournaments')
      .select('id')
      .eq('name', 'Mistrzostwa Bieżanowa EA FC 25 Grudzień 2024');
    
    if (existingTournaments && existingTournaments.length > 0) {
      for (const tournament of existingTournaments) {
        await supabase.from('matches').delete().eq('tournament_id', tournament.id);
        await supabase.from('tournaments').delete().eq('id', tournament.id);
      }
      console.log('🗑️ Deleted existing December 2024 tournament');
    }
    
    // Create the December 2024 tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Mistrzostwa Bieżanowa EA FC 25 Grudzień 2024',
        start_date: '2024-12-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        is_active: true
      })
      .select()
      .single();
    
    if (tournamentError) {
      throw new Error('Failed to create tournament: ' + tournamentError.message);
    }
    
    console.log(`✅ Created tournament: ${tournament.name}`);
    
    // Generate round-robin schedule
    const playerList = Object.keys(teamAssignments);
    const matches = [];
    let matchDate = new Date('2024-12-01T16:00:00Z');
    
    // Generate all possible matches (round-robin)
    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        const player1Name = playerList[i];
        const player2Name = playerList[j];
        const player1 = playerLookup[player1Name];
        const player2 = playerLookup[player2Name];
        const team1 = teamLookup[teamAssignments[player1Name]];
        const team2 = teamLookup[teamAssignments[player2Name]];
        
        matches.push({
          tournament_id: tournament.id,
          player1_id: player1.id,
          player2_id: player2.id,
          team1_id: team1.id,
          team2_id: team2.id,
          player1_score: 0,
          player2_score: 0,
          match_date: matchDate.toISOString(),
          is_completed: false
        });
        
        // Increment match date by 1 hour
        matchDate.setHours(matchDate.getHours() + 1);
        
        // If we reach midnight, move to next day at 16:00
        if (matchDate.getHours() >= 23) {
          matchDate.setDate(matchDate.getDate() + 1);
          matchDate.setHours(16, 0, 0, 0);
        }
      }
    }
    
    // Insert all matches
    for (const match of matches) {
      const { error: matchError } = await supabase.from('matches').insert(match);
      if (matchError) {
        console.error('Error inserting match:', matchError);
        throw new Error('Failed to insert match');
      }
    }
    
    console.log(`✅ Created ${matches.length} matches for the tournament`);
    
    // Display team assignments
    console.log('\n🏆 Team Assignments for December 2024:');
    for (const [playerName, teamName] of Object.entries(teamAssignments)) {
      console.log(`${playerName} - ${teamName}`);
    }
    
    console.log('\n🎉 December 2024 tournament created successfully!');
    console.log(`📊 Tournament: ${tournament.name}`);
    console.log(`⚽ Matches created: ${matches.length}`);
    console.log(`👥 Players: ${playerList.length}`);
    console.log(`🏆 Status: Active tournament with schedule`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createNextTournament();
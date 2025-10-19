// Script to add November 2024 tournament with all results and team assignments
// Run: node scripts/add-november-tournament.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables from .env.local
function loadEnvFile() {
  try {
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
  } catch (error) {
    console.error('❌ Cannot read .env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

// Supabase configuration
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.error('❌ Missing Supabase configuration or using placeholder values');
  console.error('Please check your .env.local file for real Supabase data');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Team assignments based on the image
const playerTeamAssignments = {
  'Bartus': 'Liverpool FC',
  'Grzesiu': 'Bayern Munich', 
  'Karol': 'Manchester City',
  'Mati': 'Paris Saint-Germain',
  'Michu': 'FC Barcelona',
  'Wilku': 'Arsenal FC',
  'Sebus': 'Real Madrid',
  'Kula': 'Borussia Dortmund'
};

// Tournament results from the table
const tournamentResults = [
  // Bartus matches
  { player1: 'Bartus', player2: 'Grzesiu', score1: 1, score2: 1 },
  { player1: 'Bartus', player2: 'Karol', score1: 2, score2: 0 },
  { player1: 'Bartus', player2: 'Kula', score1: 3, score2: 0 },
  { player1: 'Bartus', player2: 'Mati', score1: 7, score2: 1 },
  { player1: 'Bartus', player2: 'Sebus', score1: 2, score2: 2 },
  { player1: 'Bartus', player2: 'Wilku', score1: 6, score2: 0 },
  
  // Grzesiu matches (excluding already added)
  { player1: 'Grzesiu', player2: 'Karol', score1: 0, score2: 1 },
  { player1: 'Grzesiu', player2: 'Kula', score1: 1, score2: 1 },
  { player1: 'Grzesiu', player2: 'Mati', score1: 4, score2: 2 },
  { player1: 'Grzesiu', player2: 'Sebus', score1: 2, score2: 0 },
  { player1: 'Grzesiu', player2: 'Wilku', score1: 3, score2: 0 },
  
  // Karol matches (excluding already added)
  { player1: 'Karol', player2: 'Kula', score1: 0, score2: 2 },
  { player1: 'Karol', player2: 'Mati', score1: 2, score2: 2 },
  { player1: 'Karol', player2: 'Sebus', score1: 0, score2: 3 },
  { player1: 'Karol', player2: 'Wilku', score1: 3, score2: 0 },
  
  // Kula matches (excluding already added)
  { player1: 'Kula', player2: 'Mati', score1: 4, score2: 1 },
  { player1: 'Kula', player2: 'Sebus', score1: 4, score2: 3 },
  { player1: 'Kula', player2: 'Wilku', score1: 2, score2: 0 },
  
  // Mati matches (excluding already added)
  { player1: 'Mati', player2: 'Sebus', score1: 0, score2: 1 },
  { player1: 'Mati', player2: 'Wilku', score1: 1, score2: 1 },
  
  // Sebus matches (excluding already added)
  { player1: 'Sebus', player2: 'Wilku', score1: 2, score2: 0 }
];

async function main() {
  try {
    console.log('🚀 Starting November 2024 tournament setup...');

    // Test database connection
    const { data: testData, error: testError } = await supabase.from('players').select('count').limit(1);
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    console.log('✅ Database connection OK');

    // Get all players and teams
    const { data: players, error: playersError } = await supabase.from('players').select('*');
    if (playersError) throw new Error(`Failed to get players: ${playersError.message}`);

    const { data: teams, error: teamsError } = await supabase.from('teams').select('*');
    if (teamsError) throw new Error(`Failed to get teams: ${teamsError.message}`);

    console.log(`📊 Found ${players.length} players and ${teams.length} teams`);

    // Create player and team lookup maps
    const playerMap = {};
    players.forEach(player => {
      playerMap[player.nickname] = player.id;
    });

    const teamMap = {};
    teams.forEach(team => {
      teamMap[team.name] = team.id;
    });

    // Verify all players exist
    const missingPlayers = [];
    Object.keys(playerTeamAssignments).forEach(playerName => {
      if (!playerMap[playerName]) {
        missingPlayers.push(playerName);
      }
    });

    if (missingPlayers.length > 0) {
      console.error('❌ Missing players:', missingPlayers);
      throw new Error('Some players are missing from the database');
    }

    // Verify all teams exist
    const missingTeams = [];
    Object.values(playerTeamAssignments).forEach(teamName => {
      if (!teamMap[teamName]) {
        missingTeams.push(teamName);
      }
    });

    if (missingTeams.length > 0) {
      console.error('❌ Missing teams:', missingTeams);
      throw new Error('Some teams are missing from the database');
    }

    console.log('✅ All players and teams verified');

    // Delete existing November 2024 tournament if it exists
    const { data: existingTournaments } = await supabase
      .from('tournaments')
      .select('id')
      .eq('name', 'Mistrzostwa Bieżanowa EA FC 25 Listopad 2024');
    
    if (existingTournaments && existingTournaments.length > 0) {
      for (const tournament of existingTournaments) {
        await supabase.from('matches').delete().eq('tournament_id', tournament.id);
        await supabase.from('tournaments').delete().eq('id', tournament.id);
      }
      console.log('🗑️ Deleted existing November 2024 tournament');
    }

    // Create the November 2024 tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name: 'Mistrzostwa Bieżanowa EA FC 25 Listopad 2024',
        start_date: '2024-11-01T00:00:00Z',
        end_date: '2024-11-30T23:59:59Z',
        is_active: false
      })
      .select()
      .single();

    if (tournamentError) {
      throw new Error(`Failed to create tournament: ${tournamentError.message}`);
    }

    console.log('✅ Created tournament:', tournament.name);

    // Add all matches with results
    let matchCount = 0;
    for (const result of tournamentResults) {
      const player1Id = playerMap[result.player1];
      const player2Id = playerMap[result.player2];
      const team1Id = teamMap[playerTeamAssignments[result.player1]];
      const team2Id = teamMap[playerTeamAssignments[result.player2]];

      const matchData = {
        tournament_id: tournament.id,
        player1_id: player1Id,
        player2_id: player2Id,
        team1_id: team1Id,
        team2_id: team2Id,
        player1_score: result.score1,
        player2_score: result.score2,
        match_date: new Date(2024, 10, Math.floor(Math.random() * 30) + 1).toISOString(), // Random date in November 2024
        is_completed: true
      };

      const { error: matchError } = await supabase.from('matches').insert(matchData);
      if (matchError) {
        console.error(`❌ Failed to add match ${result.player1} vs ${result.player2}:`, matchError.message);
      } else {
        matchCount++;
        console.log(`✅ Added match: ${result.player1} (${playerTeamAssignments[result.player1]}) ${result.score1}-${result.score2} ${result.player2} (${playerTeamAssignments[result.player2]})`);
      }
    }

    console.log(`\n🎉 Tournament setup completed successfully!`);
    console.log(`📊 Tournament: ${tournament.name}`);
    console.log(`⚽ Matches added: ${matchCount}/${tournamentResults.length}`);
    console.log(`👥 Players: ${Object.keys(playerTeamAssignments).length}`);
    console.log(`🏆 Teams assigned: ${Object.keys(playerTeamAssignments).map(p => `${p} - ${playerTeamAssignments[p]}`).join(', ')}`);

    // Calculate and display final standings
    console.log('\n📈 Calculating final standings...');
    const standings = {};
    
    // Initialize standings
    Object.keys(playerTeamAssignments).forEach(player => {
      standings[player] = {
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      };
    });

    // Calculate standings from results
    tournamentResults.forEach(result => {
      const p1 = result.player1;
      const p2 = result.player2;
      
      standings[p1].matches++;
      standings[p2].matches++;
      standings[p1].goalsFor += result.score1;
      standings[p1].goalsAgainst += result.score2;
      standings[p2].goalsFor += result.score2;
      standings[p2].goalsAgainst += result.score1;
      
      if (result.score1 > result.score2) {
        standings[p1].wins++;
        standings[p1].points += 3;
        standings[p2].losses++;
      } else if (result.score1 < result.score2) {
        standings[p2].wins++;
        standings[p2].points += 3;
        standings[p1].losses++;
      } else {
        standings[p1].draws++;
        standings[p2].draws++;
        standings[p1].points += 1;
        standings[p2].points += 1;
      }
    });

    // Sort by points, then goal difference
    const sortedStandings = Object.entries(standings)
      .map(([player, stats]) => ({
        player,
        team: playerTeamAssignments[player],
        ...stats,
        goalDifference: stats.goalsFor - stats.goalsAgainst
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalDifference - a.goalDifference;
      });

    console.log('\n🏆 Final Standings:');
    sortedStandings.forEach((entry, index) => {
      const position = index + 1;
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
      console.log(`${medal} ${entry.player} (${entry.team}) - ${entry.points} pts, ${entry.wins}W ${entry.draws}D ${entry.losses}L, ${entry.goalsFor}-${entry.goalsAgainst} (${entry.goalDifference > 0 ? '+' : ''}${entry.goalDifference})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
const { createClient } = require('@supabase/supabase-js');

// This script tests the tournament creation with selected participants
// to verify that only selected players are used, not all players

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTournamentCreation() {
  try {
    console.log('=== TESTING TOURNAMENT CREATION ===');
    
    // Get all players first
    const { data: allPlayers, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error('Error fetching players:', playersError);
      return;
    }
    
    console.log('Total players in database:', allPlayers.length);
    console.log('Players:', allPlayers.map(p => `${p.nickname} (${p.id})`));
    
    // Select only first 3 players for testing
    const selectedPlayers = allPlayers.slice(0, 3);
    const participantIds = selectedPlayers.map(p => p.id);
    
    console.log('\nSelected participants for test tournament:');
    console.log('Count:', participantIds.length);
    console.log('IDs:', participantIds);
    console.log('Names:', selectedPlayers.map(p => p.nickname));
    
    // Get teams for assignments
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(3);
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    // Create team assignments
    const teamAssignments = {};
    participantIds.forEach((playerId, index) => {
      if (teams[index]) {
        teamAssignments[playerId] = teams[index].id;
      }
    });
    
    console.log('\nTeam assignments:', teamAssignments);
    
    // Create test tournament
    const tournamentData = {
      name: 'Test Tournament - Selected Participants',
      start_date: '2025-01-20',
      end_date: '2025-01-25',
      is_active: false
    };
    
    console.log('\nCreating tournament with selected participants...');
    
    // Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single();
    
    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError);
      return;
    }
    
    console.log('Tournament created:', tournament.name, 'ID:', tournament.id);
    
    // Generate matches for ONLY the selected participants
    const matches = [];
    for (let i = 0; i < participantIds.length; i++) {
      for (let j = i + 1; j < participantIds.length; j++) {
        const player1Id = participantIds[i];
        const player2Id = participantIds[j];
        const team1Id = teamAssignments[player1Id];
        const team2Id = teamAssignments[player2Id];

        matches.push({
          tournament_id: tournament.id,
          player1_id: player1Id,
          player2_id: player2Id,
          team1_id: team1Id,
          team2_id: team2Id,
          player1_score: null,
          player2_score: null,
          is_played: false,
          match_date: null
        });
      }
    }
    
    console.log('\nExpected matches count:', matches.length);
    console.log('Expected matches for', participantIds.length, 'players:', (participantIds.length * (participantIds.length - 1)) / 2);
    
    // Insert matches
    if (matches.length > 0) {
      const { data: insertedMatches, error: matchesError } = await supabase
        .from('matches')
        .insert(matches)
        .select();
      
      if (matchesError) {
        console.error('Error creating matches:', matchesError);
        // Clean up tournament
        await supabase.from('tournaments').delete().eq('id', tournament.id);
        return;
      }
      
      console.log('Matches created successfully:', insertedMatches.length);
    }
    
    // Verify the matches
    const { data: createdMatches, error: fetchError } = await supabase
      .from('matches')
      .select(`
        *,
        player1:players!matches_player1_id_fkey(nickname),
        player2:players!matches_player2_id_fkey(nickname)
      `)
      .eq('tournament_id', tournament.id);
    
    if (fetchError) {
      console.error('Error fetching created matches:', fetchError);
      return;
    }
    
    console.log('\n=== VERIFICATION ===');
    console.log('Matches created in database:', createdMatches.length);
    console.log('Unique players in matches:');
    
    const playersInMatches = new Set();
    createdMatches.forEach(match => {
      playersInMatches.add(match.player1_id);
      playersInMatches.add(match.player2_id);
    });
    
    console.log('Players count in matches:', playersInMatches.size);
    console.log('Expected players count:', participantIds.length);
    
    if (playersInMatches.size === participantIds.length) {
      console.log('✅ SUCCESS: Only selected participants were used!');
    } else {
      console.log('❌ ERROR: Wrong number of players in matches!');
      console.log('Players in matches:', Array.from(playersInMatches));
      console.log('Expected players:', participantIds);
    }
    
    // Show match details
    console.log('\nMatch details:');
    createdMatches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.player1.nickname} vs ${match.player2.nickname}`);
    });
    
    // Clean up - delete the test tournament
    console.log('\nCleaning up test tournament...');
    await supabase.from('matches').delete().eq('tournament_id', tournament.id);
    await supabase.from('tournaments').delete().eq('id', tournament.id);
    console.log('Test tournament cleaned up.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testTournamentCreation();
import { createClient } from '@supabase/supabase-js';
import { 
  Tournament, 
  Player, 
  Team, 
  Match, 
  Achievement, 
  LeagueTableEntry, 
  MatchWithDetails,
  PlayerStats,
  TopScorer
} from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if we're in demo mode (placeholder credentials)
const isDemoMode = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder');

// Tournament functions
export async function getActiveTournament(): Promise<Tournament | null> {
  if (isDemoMode) {
    // Return mock data for demo
    return {
      id: 'demo-tournament-current',
      name: 'Mistrzostwa Bieżanowa EA FC 25 - Grudzień 2024',
      start_date: '2024-12-01',
      end_date: '2024-12-31',
      is_active: true,
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z'
    };
  }

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching active tournament:', error);
    return null;
  }

  return data;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  if (isDemoMode) {
    // Return mock data for demo
    const mockTournaments: Tournament[] = [
      {
        id: 'demo-tournament-current',
        name: 'Mistrzostwa Bieżanowa EA FC 25 - Grudzień 2024',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        is_active: true,
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z'
      },
      {
        id: 'demo-tournament-archived',
        name: 'Mistrzostwa Bieżanowa EA FC 25 Listopad 2024',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        is_active: false,
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-30T00:00:00Z'
      }
    ];
    return mockTournaments;
  }

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }

  return data || [];
}

export async function getTournamentById(tournamentId: string): Promise<Tournament | null> {
  if (isDemoMode) {
    // Return mock data for demo
    const mockTournaments: Tournament[] = [
      {
        id: 'demo-tournament-current',
        name: 'Mistrzostwa Bieżanowa EA FC 25 - Grudzień 2024',
        start_date: '2024-12-01',
        end_date: '2024-12-31',
        is_active: true,
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z'
      },
      {
        id: 'demo-tournament-archived',
        name: 'Mistrzostwa Bieżanowa EA FC 25 Listopad 2024',
        start_date: '2024-11-01',
        end_date: '2024-11-30',
        is_active: false,
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-11-30T00:00:00Z'
      }
    ];
    return mockTournaments.find(t => t.id === tournamentId) || null;
  }

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single();

  if (error) {
    console.error('Error fetching tournament by ID:', error);
    return null;
  }

  return data;
}

// Get all matches with player and team details
export async function getAllMatches(): Promise<Match[]> {
  if (isDemoMode) {
    // Mock data for demo mode - Archived tournament matches based on final standings
    const archivedMatches = [
      // Round 1 matches
      { id: 'match-1', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-kula', team1_id: 'team-city', team2_id: 'team-dortmund', player1_score: 2, player2_score: 1, match_date: '2024-11-01T16:00:00Z', is_completed: true },
      { id: 'match-2', tournament_id: 'demo-tournament-archived', player1_id: 'player-grzesiu', player2_id: 'player-sebus', team1_id: 'team-bayern', team2_id: 'team-real', player1_score: 3, player2_score: 0, match_date: '2024-11-01T16:00:00Z', is_completed: true },
      { id: 'match-3', tournament_id: 'demo-tournament-archived', player1_id: 'player-karol', player2_id: 'player-wilku', team1_id: 'team-liverpool', team2_id: 'team-arsenal', player1_score: 1, player2_score: 2, match_date: '2024-11-01T16:00:00Z', is_completed: true },
      { id: 'match-4', tournament_id: 'demo-tournament-archived', player1_id: 'player-mati', player2_id: 'player-michu', team1_id: 'team-psg', team2_id: 'team-barcelona', player1_score: 2, player2_score: 1, match_date: '2024-11-01T16:00:00Z', is_completed: true },
      
      // Round 2 matches
      { id: 'match-5', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-sebus', team1_id: 'team-city', team2_id: 'team-real', player1_score: 3, player2_score: 1, match_date: '2024-11-02T16:00:00Z', is_completed: true },
      { id: 'match-6', tournament_id: 'demo-tournament-archived', player1_id: 'player-kula', player2_id: 'player-wilku', team1_id: 'team-dortmund', team2_id: 'team-arsenal', player1_score: 2, player2_score: 0, match_date: '2024-11-02T16:00:00Z', is_completed: true },
      { id: 'match-7', tournament_id: 'demo-tournament-archived', player1_id: 'player-grzesiu', player2_id: 'player-michu', team1_id: 'team-bayern', team2_id: 'team-barcelona', player1_score: 1, player2_score: 2, match_date: '2024-11-02T16:00:00Z', is_completed: true },
      { id: 'match-8', tournament_id: 'demo-tournament-archived', player1_id: 'player-karol', player2_id: 'player-mati', team1_id: 'team-liverpool', team2_id: 'team-psg', player1_score: 0, player2_score: 3, match_date: '2024-11-02T16:00:00Z', is_completed: true },
      
      // Round 3 matches
      { id: 'match-9', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-wilku', team1_id: 'team-city', team2_id: 'team-arsenal', player1_score: 4, player2_score: 0, match_date: '2024-11-03T16:00:00Z', is_completed: true },
      { id: 'match-10', tournament_id: 'demo-tournament-archived', player1_id: 'player-sebus', player2_id: 'player-michu', team1_id: 'team-real', team2_id: 'team-barcelona', player1_score: 1, player2_score: 3, match_date: '2024-11-03T16:00:00Z', is_completed: true },
      { id: 'match-11', tournament_id: 'demo-tournament-archived', player1_id: 'player-kula', player2_id: 'player-mati', team1_id: 'team-dortmund', team2_id: 'team-psg', player1_score: 1, player2_score: 2, match_date: '2024-11-03T16:00:00Z', is_completed: true },
      { id: 'match-12', tournament_id: 'demo-tournament-archived', player1_id: 'player-grzesiu', player2_id: 'player-karol', team1_id: 'team-bayern', team2_id: 'team-liverpool', player1_score: 2, player2_score: 1, match_date: '2024-11-03T16:00:00Z', is_completed: true },
      
      // Round 4 matches
      { id: 'match-13', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-michu', team1_id: 'team-city', team2_id: 'team-barcelona', player1_score: 2, player2_score: 1, match_date: '2024-11-04T16:00:00Z', is_completed: true },
      { id: 'match-14', tournament_id: 'demo-tournament-archived', player1_id: 'player-wilku', player2_id: 'player-mati', team1_id: 'team-arsenal', team2_id: 'team-psg', player1_score: 0, player2_score: 4, match_date: '2024-11-04T16:00:00Z', is_completed: true },
      { id: 'match-15', tournament_id: 'demo-tournament-archived', player1_id: 'player-sebus', player2_id: 'player-karol', team1_id: 'team-real', team2_id: 'team-liverpool', player1_score: 2, player2_score: 1, match_date: '2024-11-04T16:00:00Z', is_completed: true },
      { id: 'match-16', tournament_id: 'demo-tournament-archived', player1_id: 'player-kula', player2_id: 'player-grzesiu', team1_id: 'team-dortmund', team2_id: 'team-bayern', player1_score: 1, player2_score: 3, match_date: '2024-11-04T16:00:00Z', is_completed: true },
      
      // Round 5 matches
      { id: 'match-17', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-mati', team1_id: 'team-city', team2_id: 'team-psg', player1_score: 3, player2_score: 2, match_date: '2024-11-05T16:00:00Z', is_completed: true },
      { id: 'match-18', tournament_id: 'demo-tournament-archived', player1_id: 'player-michu', player2_id: 'player-karol', team1_id: 'team-barcelona', team2_id: 'team-liverpool', player1_score: 2, player2_score: 0, match_date: '2024-11-05T16:00:00Z', is_completed: true },
      { id: 'match-19', tournament_id: 'demo-tournament-archived', player1_id: 'player-wilku', player2_id: 'player-grzesiu', team1_id: 'team-arsenal', team2_id: 'team-bayern', player1_score: 1, player2_score: 2, match_date: '2024-11-05T16:00:00Z', is_completed: true },
      { id: 'match-20', tournament_id: 'demo-tournament-archived', player1_id: 'player-sebus', player2_id: 'player-kula', team1_id: 'team-real', team2_id: 'team-dortmund', player1_score: 0, player2_score: 1, match_date: '2024-11-05T16:00:00Z', is_completed: true },
      
      // Round 6 matches
      { id: 'match-21', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-karol', team1_id: 'team-city', team2_id: 'team-liverpool', player1_score: 1, player2_score: 0, match_date: '2024-11-06T16:00:00Z', is_completed: true },
      { id: 'match-22', tournament_id: 'demo-tournament-archived', player1_id: 'player-mati', player2_id: 'player-grzesiu', team1_id: 'team-psg', team2_id: 'team-bayern', player1_score: 2, player2_score: 3, match_date: '2024-11-06T16:00:00Z', is_completed: true },
      { id: 'match-23', tournament_id: 'demo-tournament-archived', player1_id: 'player-michu', player2_id: 'player-kula', team1_id: 'team-barcelona', team2_id: 'team-dortmund', player1_score: 1, player2_score: 2, match_date: '2024-11-06T16:00:00Z', is_completed: true },
      { id: 'match-24', tournament_id: 'demo-tournament-archived', player1_id: 'player-wilku', player2_id: 'player-sebus', team1_id: 'team-arsenal', team2_id: 'team-real', player1_score: 0, player2_score: 2, match_date: '2024-11-06T16:00:00Z', is_completed: true },
      
      // Round 7 matches
      { id: 'match-25', tournament_id: 'demo-tournament-archived', player1_id: 'player-bartus', player2_id: 'player-grzesiu', team1_id: 'team-city', team2_id: 'team-bayern', player1_score: 2, player2_score: 1, match_date: '2024-11-07T16:00:00Z', is_completed: true },
      { id: 'match-26', tournament_id: 'demo-tournament-archived', player1_id: 'player-karol', player2_id: 'player-kula', team1_id: 'team-liverpool', team2_id: 'team-dortmund', player1_score: 1, player2_score: 2, match_date: '2024-11-07T16:00:00Z', is_completed: true },
      { id: 'match-27', tournament_id: 'demo-tournament-archived', player1_id: 'player-mati', player2_id: 'player-sebus', team1_id: 'team-psg', team2_id: 'team-real', player1_score: 3, player2_score: 1, match_date: '2024-11-07T16:00:00Z', is_completed: true },
      { id: 'match-28', tournament_id: 'demo-tournament-archived', player1_id: 'player-michu', player2_id: 'player-wilku', team1_id: 'team-barcelona', team2_id: 'team-arsenal', player1_score: 4, player2_score: 1, match_date: '2024-11-07T16:00:00Z', is_completed: true }
    ];

    // Current tournament matches (some completed, some upcoming)
    const currentMatches = [
      // Round 1 - completed matches
      { id: 'match-current-1', tournament_id: 'demo-tournament-current', player1_id: 'player-bartus', player2_id: 'player-grzesiu', team1_id: 'team-liverpool', team2_id: 'team-manchester', player1_score: 2, player2_score: 1, match_date: '2024-12-01T16:00:00Z', is_completed: true },
      { id: 'match-current-2', tournament_id: 'demo-tournament-current', player1_id: 'player-karol', player2_id: 'player-mati', team1_id: 'team-manchester', team2_id: 'team-psg', player1_score: 1, player2_score: 3, match_date: '2024-12-01T17:00:00Z', is_completed: true },
      { id: 'match-current-3', tournament_id: 'demo-tournament-current', player1_id: 'player-michu', player2_id: 'player-wilku', team1_id: 'team-barcelona', team2_id: 'team-arsenal', player1_score: 2, player2_score: 0, match_date: '2024-12-01T18:00:00Z', is_completed: true },
      { id: 'match-current-4', tournament_id: 'demo-tournament-current', player1_id: 'player-sebus', player2_id: 'player-kula', team1_id: 'team-real', team2_id: 'team-dortmund', player1_score: 1, player2_score: 1, match_date: '2024-12-01T19:00:00Z', is_completed: true },
      
      // Round 2 - some completed, some upcoming
      { id: 'match-current-5', tournament_id: 'demo-tournament-current', player1_id: 'player-nowy', player2_id: 'player-bartus', team1_id: 'team-juventus', team2_id: 'team-liverpool', player1_score: 0, player2_score: 2, match_date: '2024-12-02T16:00:00Z', is_completed: true },
      { id: 'match-current-6', tournament_id: 'demo-tournament-current', player1_id: 'player-grzesiu', player2_id: 'player-karol', team1_id: 'team-manchester', team2_id: 'team-manchester', player1_score: 0, player2_score: 0, match_date: '2024-12-03T16:00:00Z', is_completed: false },
      { id: 'match-current-7', tournament_id: 'demo-tournament-current', player1_id: 'player-mati', player2_id: 'player-michu', team1_id: 'team-psg', team2_id: 'team-barcelona', player1_score: 0, player2_score: 0, match_date: '2024-12-03T17:00:00Z', is_completed: false },
      { id: 'match-current-8', tournament_id: 'demo-tournament-current', player1_id: 'player-wilku', player2_id: 'player-sebus', team1_id: 'team-arsenal', team2_id: 'team-real', player1_score: 0, player2_score: 0, match_date: '2024-12-03T18:00:00Z', is_completed: false }
    ];

    const allMatches = [...archivedMatches, ...currentMatches];

    // Add tournament and player/team details to each match
    const players = await getAllPlayers();
    const teams = await getAllTeams();
    const tournaments = await getAllTournaments();
    
    return allMatches.map(match => ({
      ...match,
      created_at: match.match_date,
      updated_at: match.match_date,
      tournament: tournaments.find(t => t.id === match.tournament_id)!,
      player1: players.find(p => p.id === match.player1_id)!,
      player2: players.find(p => p.id === match.player2_id)!,
      team1: teams.find(t => t.id === match.team1_id)!,
      team2: teams.find(t => t.id === match.team2_id)!
    }));
  }

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      tournament:tournaments(*),
      player1:players!matches_player1_id_fkey(*),
      player2:players!matches_player2_id_fkey(*),
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*)
    `)
    .order('match_date', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

// Update match score
export async function updateMatchScore(matchId: string, player1Score: number, player2Score: number): Promise<void> {
  if (isDemoMode) {
    // In demo mode, just log the action
    console.log(`Demo: Updated match ${matchId} score to ${player1Score}-${player2Score}`);
    return;
  }

  // First, get the match to find the tournament ID
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select('tournament_id')
    .eq('id', matchId)
    .single();

  if (matchError) {
    console.error('Error fetching match data:', matchError);
    throw new Error('Failed to fetch match data');
  }

  const { error } = await supabase
    .from('matches')
    .update({
      player1_score: player1Score,
      player2_score: player2Score,
      is_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId);

  if (error) {
    console.error('Error updating match score:', error);
    throw new Error('Failed to update match score');
  }

  // Check if tournament is completed and assign achievements if needed
  await checkAndAssignTournamentAchievements(matchData.tournament_id);
}

// Undo match - revert completed match back to pending
export async function undoMatch(matchId: string): Promise<void> {
  if (isDemoMode) {
    // In demo mode, just log the action
    console.log(`Demo: Undoing match ${matchId}`);
    return;
  }

  const { error } = await supabase
    .from('matches')
    .update({
      player1_score: 0,
      player2_score: 0,
      is_completed: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', matchId);

  if (error) {
    console.error('Error undoing match:', error);
    throw new Error('Failed to undo match');
  }
}

// Update match order for drag and drop reordering
export async function updateMatchOrder(tournamentId: string, matchOrders: { matchId: string; order: number }[]): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Would update match order', { tournamentId, matchOrders });
    return;
  }

  // Update each match with its new order by adjusting match_date
  // We use the order to set relative dates (each order increment = 1 hour later)
  const baseDate = new Date();
  
  for (const { matchId, order } of matchOrders) {
    const newDate = new Date(baseDate.getTime() + order * 60 * 60 * 1000); // Add hours based on order
    
    const { error } = await supabase
      .from('matches')
      .update({
        match_date: newDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .eq('tournament_id', tournamentId);

    if (error) {
      console.error('Error updating match order:', error);
      throw new Error('Failed to update match order');
    }
  }
}

// Create new tournament
export async function createTournament(tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<Tournament> {
  if (isDemoMode) {
    // In demo mode, just return a mock tournament
    const mockTournament: Tournament = {
      id: `tournament-${Date.now()}`,
      ...tournamentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('Demo: Created tournament', mockTournament);
    return mockTournament;
  }

  const { data, error } = await supabase
    .from('tournaments')
    .insert([{
      ...tournamentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw new Error('Failed to create tournament');
  }

  return data;
}

// Update tournament
export async function updateTournament(tournamentId: string, tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  if (isDemoMode) {
    // In demo mode, just log the action
    console.log(`Demo: Updated tournament ${tournamentId}`, tournamentData);
    return;
  }

  console.log('=== UPDATE TOURNAMENT DEBUG ===');
  console.log('Tournament ID:', tournamentId);
  console.log('Tournament Data:', tournamentData);

  const updateData = {
    ...tournamentData,
    updated_at: new Date().toISOString()
  };

  console.log('Final update data:', updateData);

  const { error, data } = await supabase
    .from('tournaments')
    .update(updateData)
    .eq('id', tournamentId)
    .select();

  if (error) {
    console.error('=== SUPABASE UPDATE ERROR ===');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Full error object:', error);
    throw new Error(`Failed to update tournament: ${error.message} (Code: ${error.code})`);
  }

  console.log('Update successful, returned data:', data);
}

// Delete tournament
export async function deleteTournament(tournamentId: string): Promise<void> {
  if (isDemoMode) {
    // In demo mode, just log the action
    console.log(`Demo: Deleted tournament ${tournamentId}`);
    return;
  }

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId);

  if (error) {
    console.error('Error deleting tournament:', error);
    throw new Error('Failed to delete tournament');
  }
}

// Match functions
export async function getMatchesForTournament(tournamentId: string): Promise<MatchWithDetails[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:players!matches_player1_id_fkey(*),
      player2:players!matches_player2_id_fkey(*),
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', tournamentId)
    .order('match_date', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function getUpcomingMatches(tournamentId: string, limit: number = 5): Promise<MatchWithDetails[]> {
  if (isDemoMode) {
    // Return mock data for demo
    const mockMatches: MatchWithDetails[] = [
      {
        id: 'match-1',
        tournament_id: tournamentId,
        player1_id: 'player-1',
        player2_id: 'player-2',
        team1_id: 'team-1',
        team2_id: 'team-2',
        player1_score: 0,
        player2_score: 0,
        match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        player1: { id: 'player-1', nickname: 'Kamil', created_at: '', updated_at: '' },
        player2: { id: 'player-2', nickname: 'Mateusz', created_at: '', updated_at: '' },
        team1: { id: 'team-1', name: 'Real Madrid', created_at: '', updated_at: '' },
        team2: { id: 'team-2', name: 'Barcelona', created_at: '', updated_at: '' }
      },
      {
        id: 'match-2',
        tournament_id: tournamentId,
        player1_id: 'player-3',
        player2_id: 'player-4',
        team1_id: 'team-3',
        team2_id: 'team-4',
        player1_score: 0,
        player2_score: 0,
        match_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        player1: { id: 'player-3', nickname: 'Paweł', created_at: '', updated_at: '' },
        player2: { id: 'player-4', nickname: 'Jakub', created_at: '', updated_at: '' },
        team1: { id: 'team-3', name: 'Manchester City', created_at: '', updated_at: '' },
        team2: { id: 'team-4', name: 'Liverpool', created_at: '', updated_at: '' }
      }
    ];
    return mockMatches.slice(0, limit);
  }

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:players!matches_player1_id_fkey(*),
      player2:players!matches_player2_id_fkey(*),
      team1:teams!matches_team1_id_fkey(*),
      team2:teams!matches_team2_id_fkey(*)
    `)
    .eq('tournament_id', tournamentId)
    .eq('is_completed', false)
    .order('match_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }

  return data || [];
}

// League table functions
export async function getLeagueTable(tournamentId: string): Promise<LeagueTableEntry[]> {
  if (isDemoMode) {
    // Return mock data for demo
    const mockLeagueTable: LeagueTableEntry[] = [
      {
        tournament_id: tournamentId,
        player_id: 'player-1',
        nickname: 'Kamil',
        team_name: 'Real Madrid',
        matches_played: 8,
        points: 21,
        wins: 7,
        draws: 0,
        losses: 1,
        goals_for: 28,
        goals_against: 12,
        goal_difference: 16,
        position: 1
      },
      {
        tournament_id: tournamentId,
        player_id: 'player-2',
        nickname: 'Mateusz',
        team_name: 'Barcelona',
        matches_played: 8,
        points: 18,
        wins: 6,
        draws: 0,
        losses: 2,
        goals_for: 24,
        goals_against: 15,
        goal_difference: 9,
        position: 2
      },
      {
        tournament_id: tournamentId,
        player_id: 'player-3',
        nickname: 'Paweł',
        team_name: 'Manchester City',
        matches_played: 8,
        points: 15,
        wins: 5,
        draws: 0,
        losses: 3,
        goals_for: 22,
        goals_against: 18,
        goal_difference: 4,
        position: 3
      },
      {
        tournament_id: tournamentId,
        player_id: 'player-4',
        nickname: 'Jakub',
        team_name: 'Liverpool',
        matches_played: 8,
        points: 12,
        wins: 4,
        draws: 0,
        losses: 4,
        goals_for: 19,
        goals_against: 21,
        goal_difference: -2,
        position: 4
      }
    ];
    return mockLeagueTable;
  }

  const { data, error } = await supabase
    .from('league_table_view')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .order('goals_for', { ascending: false });

  if (error) {
    console.error('Error fetching league table:', error);
    return [];
  }

  // Add position numbers
  const tableWithPositions = (data || []).map((entry, index) => ({
    ...entry,
    position: index + 1
  }));

  return tableWithPositions;
}

// Calculate league table from raw match data (alternative approach)
export function calculateLeagueTable(matches: MatchWithDetails[]): LeagueTableEntry[] {
  const playerStats: { [playerId: string]: LeagueTableEntry } = {};

  matches.forEach(match => {
    if (!match.is_completed) return;

    // Initialize player1 stats if not exists
    if (!playerStats[match.player1_id]) {
      playerStats[match.player1_id] = {
        tournament_id: match.tournament_id,
        player_id: match.player1_id,
        nickname: match.player1.nickname,
        team_name: match.team1.name,
        team_badge: match.team1.badge_url,
        matches_played: 0,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0
      };
    }

    // Initialize player2 stats if not exists
    if (!playerStats[match.player2_id]) {
      playerStats[match.player2_id] = {
        tournament_id: match.tournament_id,
        player_id: match.player2_id,
        nickname: match.player2.nickname,
        team_name: match.team2.name,
        team_badge: match.team2.badge_url,
        matches_played: 0,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0
      };
    }

    // Update player1 stats
    const player1Stats = playerStats[match.player1_id];
    player1Stats.matches_played++;
    player1Stats.goals_for += match.player1_score;
    player1Stats.goals_against += match.player2_score;

    // Update player2 stats
    const player2Stats = playerStats[match.player2_id];
    player2Stats.matches_played++;
    player2Stats.goals_for += match.player2_score;
    player2Stats.goals_against += match.player1_score;

    // Determine match result and update points/wins/draws/losses
    if (match.player1_score > match.player2_score) {
      // Player1 wins
      player1Stats.points += 3;
      player1Stats.wins++;
      player2Stats.losses++;
    } else if (match.player1_score < match.player2_score) {
      // Player2 wins
      player2Stats.points += 3;
      player2Stats.wins++;
      player1Stats.losses++;
    } else {
      // Draw
      player1Stats.points += 1;
      player2Stats.points += 1;
      player1Stats.draws++;
      player2Stats.draws++;
    }

    // Update goal difference
    player1Stats.goal_difference = player1Stats.goals_for - player1Stats.goals_against;
    player2Stats.goal_difference = player2Stats.goals_for - player2Stats.goals_against;
  });

  // Convert to array and sort
  const tableEntries = Object.values(playerStats);
  
  // Sort by points (desc), then goal difference (desc), then goals for (desc)
  tableEntries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return b.goals_for - a.goals_for;
  });

  // Add positions
  return tableEntries.map((entry, index) => ({
    ...entry,
    position: index + 1
  }));
}

// Player functions
export async function getAllPlayers(): Promise<Player[]> {
  if (isDemoMode) {
    // Return mock data for demo
    const mockPlayers: Player[] = [
      {
        id: 'player-bartus',
        nickname: 'Bartuś',
        email: 'bartus@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-grzesiu',
        nickname: 'Grzesiu',
        email: 'grzesiu@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-karol',
        nickname: 'Karol',
        email: 'karol@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-mati',
        nickname: 'Mati',
        email: 'mati@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-michu',
        nickname: 'Michu',
        email: 'michu@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-wilku',
        nickname: 'Wilku',
        email: 'wilku@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-sebus',
        nickname: 'Sebuś',
        email: 'sebus@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-kula',
        nickname: 'Kula',
        email: 'kula@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z'
      },
      {
        id: 'player-nowy',
        nickname: 'Nowy Gracz',
        email: 'nowy@biezanow.pl',
        avatar_url: undefined,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      }
    ];
    return mockPlayers;
  }

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('nickname');

  if (error) {
    console.error('Error fetching players:', error);
    return [];
  }

  return data || [];
}

export async function getPlayerStats(playerId: string): Promise<PlayerStats | null> {
  try {
    const allMatches = await getAllMatches();
    const players = await getAllPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) return null;

    // Filter matches where this player participated
    const playerMatches = allMatches.filter(match => 
      (match.player1_id === playerId || match.player2_id === playerId) && match.is_completed
    );

    let totalWins = 0;
    let totalDraws = 0;
    let totalLosses = 0;
    let totalGoals = 0;
    let totalGoalsConceded = 0;
    let totalPoints = 0;
    let cleanSheets = 0;
    let biggestWin = 0;
    let biggestLoss = 0;

    playerMatches.forEach(match => {
      const isPlayer1 = match.player1_id === playerId;
      const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
      const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;

      totalGoals += playerScore;
      totalGoalsConceded += opponentScore;

      // Track clean sheets (no goals conceded)
      if (opponentScore === 0) {
        cleanSheets++;
      }

      const goalDifference = playerScore - opponentScore;

      if (playerScore > opponentScore) {
        totalWins++;
        totalPoints += 3;
        // Track biggest win
        if (goalDifference > biggestWin) {
          biggestWin = goalDifference;
        }
      } else if (playerScore === opponentScore) {
        totalDraws++;
        totalPoints += 1;
      } else {
        totalLosses++;
        // Track biggest loss (as positive number)
        const lossMargin = Math.abs(goalDifference);
        if (lossMargin > biggestLoss) {
          biggestLoss = lossMargin;
        }
      }
    });

    const totalMatches = playerMatches.length;
    const winPercentage = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const goalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;
    const goalDifference = totalGoals - totalGoalsConceded;

    // Calculate tournaments won (placeholder - would need tournament results)
    const tournamentsWon = 0; // This would need to be calculated from tournament standings

    return {
      player_id: playerId,
      nickname: player.nickname,
      total_matches: totalMatches,
      total_wins: totalWins,
      total_draws: totalDraws,
      total_losses: totalLosses,
      total_goals: totalGoals,
      total_goals_conceded: totalGoalsConceded,
      goal_difference: goalDifference,
      total_points: totalPoints,
      tournaments_won: tournamentsWon,
      win_percentage: winPercentage,
      goals_per_match: goalsPerMatch,
      clean_sheets: cleanSheets,
      biggest_win: biggestWin,
      biggest_loss: biggestLoss
    };
  } catch (error) {
    console.error('Error calculating player stats:', error);
    return null;
  }
}

// Get player achievements
export async function getPlayerAchievements(playerId: string): Promise<Achievement[]> {
  if (isDemoMode) {
    // Return mock achievements for demo
    const mockAchievements: Achievement[] = [
      {
        id: 'achievement-1',
        player_id: playerId,
        tournament_id: 'demo-tournament-archived',
        achievement_type: 'tournament_winner',
        achievement_rank: 1,
        title: '🥇 Mistrz Turnieju',
        description: 'Zwyciężca turnieju Mistrzostwa Bieżanowa EA FC 25 Listopad 2024',
        icon_url: '/icons/trophy-gold.svg',
        value: 18,
        achievement_date: '2024-11-30T00:00:00Z',
        created_at: '2024-11-30T00:00:00Z'
      },
      {
        id: 'achievement-2',
        player_id: playerId,
        tournament_id: 'demo-tournament-archived',
        achievement_type: 'top_scorer',
        title: '⚽ Król Strzelców',
        description: 'Najwięcej bramek w turnieju Mistrzostwa Bieżanowa EA FC 25 Listopad 2024 (12 bramek)',
        icon_url: '/icons/soccer-ball.svg',
        value: 12,
        achievement_date: '2024-11-30T00:00:00Z',
        created_at: '2024-11-30T00:00:00Z'
      },
      {
        id: 'achievement-3',
        player_id: playerId,
        tournament_id: 'demo-tournament-archived',
        achievement_type: 'defensive_leader',
        title: '🛡️ Lider Obrony',
        description: 'Najwięcej czystych kont w turnieju Mistrzostwa Bieżanowa EA FC 25 Listopad 2024 (5 czystych kont)',
        icon_url: '/icons/shield.svg',
        value: 5,
        achievement_date: '2024-11-30T00:00:00Z',
        created_at: '2024-11-30T00:00:00Z'
      },
      {
        id: 'achievement-4',
        player_id: playerId,
        tournament_id: 'demo-tournament-archived',
        achievement_type: 'king_of_emotions',
        title: '🎭 Król Emocji',
        description: 'Najwięcej bramek w meczach gracza w turnieju Mistrzostwa Bieżanowa EA FC 25 Listopad 2024 (25 bramek łącznie)',
        icon_url: '/icons/emotions.svg',
        value: 25,
        achievement_date: '2024-11-30T00:00:00Z',
        created_at: '2024-11-30T00:00:00Z'
      }
    ];

    // Only return achievements for specific players based on the standings
    if (playerId === 'player-grzesiu') {
      return [mockAchievements[0], mockAchievements[2]]; // Tournament winner + Defensive leader
    } else if (playerId === 'player-bartus') {
      return [mockAchievements[1]]; // Top scorer
    } else if (playerId === 'player-michu') {
      return [mockAchievements[3]]; // King of emotions
    }
    
    return [];
  }

  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('player_id', playerId)
    .order('achievement_date', { ascending: false });

  if (error) {
    console.error('Error fetching player achievements:', error);
    return [];
  }

  return data || [];
}

// Generate achievements based on tournament results
export async function generateTournamentAchievements(tournamentId: string): Promise<void> {
  if (isDemoMode) {
    // In demo mode, simulate achievement generation with a delay
    console.log(`Demo: Generating achievements for tournament ${tournamentId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
    console.log(`Demo: Successfully generated achievements for tournament ${tournamentId}`);
    return;
  }

  try {
    // First try the database function
    const { error } = await supabase.rpc('award_tournament_achievements', {
      tournament_uuid: tournamentId
    });

    if (error) {
      console.warn('Database function not available, using fallback achievement generation:', error.message);
      
      // Fallback: Generate achievements using TypeScript logic
      await generateTournamentAchievementsFallback(tournamentId);
      return;
    }

    console.log('Tournament achievements generated successfully using database function');
  } catch (error) {
    console.error('Error generating tournament achievements:', error);
    
    // Try fallback method
    try {
      console.log('Attempting fallback achievement generation...');
      await generateTournamentAchievementsFallback(tournamentId);
    } catch (fallbackError) {
      console.error('Fallback achievement generation also failed:', fallbackError);
      throw error;
    }
  }
}

// Fallback achievement generation using TypeScript logic
async function generateTournamentAchievementsFallback(tournamentId: string): Promise<void> {
  console.log('🎯 Generating achievements using fallback method for tournament:', tournamentId);
  
  try {
    // Get tournament info
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('name')
      .eq('id', tournamentId)
      .single();
    
    if (tournamentError || !tournament) {
      throw new Error('Tournament not found');
    }
    
    // Clear existing achievements for this tournament
    await supabase
      .from('achievements')
      .delete()
      .eq('tournament_id', tournamentId);
    
    // Get league table for this tournament
    const leagueTable = await getLeagueTable(tournamentId);
    
    if (leagueTable.length === 0) {
      console.log('No league table data found, skipping achievement generation');
      return;
    }
    
    const achievements: Omit<Achievement, 'id' | 'created_at'>[] = [];
    
    // 1. Tournament winner achievements (1st, 2nd, 3rd place)
    const sortedTable = [...leagueTable].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });
    
    for (let i = 0; i < Math.min(3, sortedTable.length); i++) {
      const player = sortedTable[i];
      const position = i + 1;
      
      achievements.push({
        player_id: player.player_id,
        tournament_id: tournamentId,
        achievement_type: 'tournament_winner',
        achievement_rank: position,
        title: position === 1 ? '🥇 Mistrz Turnieju' : 
               position === 2 ? '🥈 Wicemistrz Turnieju' : '🥉 Trzecie Miejsce',
        description: position === 1 ? `Zwyciężca turnieju ${tournament.name}` :
                    position === 2 ? `Drugie miejsce w turnieju ${tournament.name}` :
                    `Trzecie miejsce w turnieju ${tournament.name}`,
        icon_url: position === 1 ? '/icons/trophy-gold.svg' :
                 position === 2 ? '/icons/trophy-silver.svg' : '/icons/trophy-bronze.svg',
        value: player.points,
        achievement_date: new Date().toISOString()
      });
    }
    
    // 2. Top scorer achievement
    const topScorer = leagueTable.reduce((max, player) => 
      player.goals_for > max.goals_for ? player : max
    );
    
    if (topScorer.goals_for > 0) {
      achievements.push({
        player_id: topScorer.player_id,
        tournament_id: tournamentId,
        achievement_type: 'top_scorer',
        achievement_rank: undefined,
        title: '⚽ Król Strzelców',
        description: `Najwięcej bramek w turnieju ${tournament.name} (${topScorer.goals_for} bramek)`,
        icon_url: '/icons/soccer-ball.svg',
        value: topScorer.goals_for,
        achievement_date: new Date().toISOString()
      });
    }
    
    // 3. Defensive leader achievement (best goal difference with positive goals)
    const defensiveLeader = leagueTable
      .filter(player => player.goals_for > 0)
      .reduce((best, player) => 
        player.goal_difference > best.goal_difference ? player : best
      );
    
    if (defensiveLeader.goal_difference > 0) {
      achievements.push({
        player_id: defensiveLeader.player_id,
        tournament_id: tournamentId,
        achievement_type: 'defensive_leader',
        achievement_rank: undefined,
        title: '🛡️ Lider Obrony',
        description: `Najlepsza różnica bramkowa w turnieju ${tournament.name} (+${defensiveLeader.goal_difference})`,
        icon_url: '/icons/shield.svg',
        value: defensiveLeader.goal_difference,
        achievement_date: new Date().toISOString()
      });
    }
    
    // 4. Most goals conceded achievement
    const mostConceded = leagueTable.reduce((max, player) => 
      player.goals_against > max.goals_against ? player : max
    );
    
    if (mostConceded.goals_against > 0) {
      achievements.push({
        player_id: mostConceded.player_id,
        tournament_id: tournamentId,
        achievement_type: 'most_conceded',
        achievement_rank: undefined,
        title: '🤡 Lider Obrony XD',
        description: `Najwięcej straconych bramek w turnieju ${tournament.name} (${mostConceded.goals_against} bramek)`,
        icon_url: '/icons/sad-face.svg',
        value: mostConceded.goals_against,
        achievement_date: new Date().toISOString()
      });
    }
    
    // 5. King of Emotions achievement (most total goals in matches)
    const emotionsKing = leagueTable.reduce((max, player) => {
      const totalGoals = player.goals_for + player.goals_against;
      const maxTotalGoals = max.goals_for + max.goals_against;
      return totalGoals > maxTotalGoals ? player : max;
    });
    
    const emotionsKingTotalGoals = emotionsKing.goals_for + emotionsKing.goals_against;
    if (emotionsKingTotalGoals > 0) {
      achievements.push({
        player_id: emotionsKing.player_id,
        tournament_id: tournamentId,
        achievement_type: 'king_of_emotions',
        achievement_rank: undefined,
        title: '🎭 Król Emocji',
        description: `Najwięcej bramek w meczach gracza w turnieju ${tournament.name} (${emotionsKingTotalGoals} bramek łącznie)`,
        icon_url: '/icons/drama-mask.svg',
        value: emotionsKingTotalGoals,
        achievement_date: new Date().toISOString()
      });
    }
    
    // Insert all achievements
    if (achievements.length > 0) {
      const { error: insertError } = await supabase
        .from('achievements')
        .insert(achievements);
      
      if (insertError) {
        throw insertError;
      }
      
      console.log(`✅ Successfully generated ${achievements.length} achievements for tournament ${tournamentId}`);
    } else {
      console.log('⚠️ No achievements generated - insufficient data');
    }
    
  } catch (error) {
    console.error('Error in fallback achievement generation:', error);
    throw error;
  }
}

// Check if tournament is completed and assign achievements automatically
export async function checkAndAssignTournamentAchievements(tournamentId: string): Promise<void> {
  if (isDemoMode) {
    return;
  }

  try {
    // Get all matches for the tournament
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, is_completed')
      .eq('tournament_id', tournamentId);

    if (matchesError) {
      console.error('Error fetching tournament matches:', matchesError);
      return;
    }

    // Check if all matches are completed
    const allMatchesCompleted = matches && matches.length > 0 && matches.every(match => match.is_completed);

    if (allMatchesCompleted) {
      // Check if achievements have already been assigned for this tournament
      const { data: existingAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id')
        .eq('tournament_id', tournamentId)
        .limit(1);

      if (achievementsError) {
        console.error('Error checking existing achievements:', achievementsError);
        return;
      }

      // If no achievements exist yet, generate them
      if (!existingAchievements || existingAchievements.length === 0) {
        console.log(`Tournament ${tournamentId} completed! Generating achievements...`);
        await generateTournamentAchievements(tournamentId);
        
        // Optionally mark tournament as inactive
        await supabase
          .from('tournaments')
          .update({ 
            is_active: false,
            end_date: new Date().toISOString()
          })
          .eq('id', tournamentId);
        
        console.log(`Tournament ${tournamentId} marked as completed with achievements assigned.`);
      }
    }
  } catch (error) {
    console.error('Error checking tournament completion:', error);
  }
}

// Clean archived tournaments and create new tournament with results
export async function setupNewTournament(): Promise<void> {
  if (isDemoMode) {
    // In demo mode, we don't modify the database
    console.log('Demo mode: Tournament setup skipped');
    return;
  }

  try {
    // First, delete all existing matches
    await supabase.from('matches').delete().neq('id', '');
    
    // Delete all existing tournaments
    await supabase.from('tournaments').delete().neq('id', '');
    
    // Create the new archived tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        id: 'mistrzostwa-biezanowa-listopad-2024',
        name: 'Mistrzostwa Bieżanowa EA FC 25 Listopad 2024',
        start_date: '2024-11-01T00:00:00Z',
        end_date: '2024-11-30T23:59:59Z',
        is_active: false
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError);
      return;
    }

    // Create matches based on the provided results
    const matches = [
      // Round 1
      { player1: 'player-bartus', player2: 'player-grzesiu', team1: 'liverpool', team2: 'bayern-munich', score1: 4, score2: 2 },
      { player1: 'player-karol', player2: 'player-mati', team1: 'manchester-city', team2: 'psg', score1: 4, score2: 1 },
      { player1: 'player-michu', player2: 'player-wilku', team1: 'barcelona', team2: 'arsenal', score1: 3, score2: 2 },
      { player1: 'player-sebus', player2: 'player-kula', team1: 'real-madrid', team2: 'borussia', score1: 3, score2: 1 },
      
      // Round 2
      { player1: 'player-grzesiu', player2: 'player-karol', team1: 'bayern-munich', team2: 'manchester-city', score1: 4, score2: 1 },
      { player1: 'player-mati', player2: 'player-michu', team1: 'psg', team2: 'barcelona', score1: 3, score2: 1 },
      { player1: 'player-wilku', player2: 'player-sebus', team1: 'arsenal', team2: 'real-madrid', score1: 3, score2: 2 },
      { player1: 'player-kula', player2: 'player-bartus', team1: 'borussia', team2: 'liverpool', score1: 2, score2: 1 },
      
      // Round 3
      { player1: 'player-bartus', player2: 'player-karol', team1: 'liverpool', team2: 'manchester-city', score1: 4, score2: 1 },
      { player1: 'player-grzesiu', player2: 'player-mati', team1: 'bayern-munich', team2: 'psg', score1: 4, score2: 1 },
      { player1: 'player-michu', player2: 'player-sebus', team1: 'barcelona', team2: 'real-madrid', score1: 3, score2: 1 },
      { player1: 'player-wilku', player2: 'player-kula', team1: 'arsenal', team2: 'borussia', score1: 3, score2: 2 },
      
      // Round 4
      { player1: 'player-karol', player2: 'player-michu', team1: 'manchester-city', team2: 'barcelona', score1: 3, score2: 1 },
      { player1: 'player-mati', player2: 'player-wilku', team1: 'psg', team2: 'arsenal', score1: 3, score2: 2 },
      { player1: 'player-sebus', player2: 'player-bartus', team1: 'real-madrid', team2: 'liverpool', score1: 3, score2: 1 },
      { player1: 'player-kula', player2: 'player-grzesiu', team1: 'borussia', team2: 'bayern-munich', score1: 2, score2: 1 },
      
      // Round 5
      { player1: 'player-mati', player2: 'player-sebus', team1: 'psg', team2: 'real-madrid', score1: 2, score2: 1 },
      { player1: 'player-wilku', player2: 'player-bartus', team1: 'arsenal', team2: 'liverpool', score1: 3, score2: 1 },
      { player1: 'player-kula', player2: 'player-karol', team1: 'borussia', team2: 'manchester-city', score1: 2, score2: 1 },
      { player1: 'player-grzesiu', player2: 'player-michu', team1: 'bayern-munich', team2: 'barcelona', score1: 3, score2: 1 },
      
      // Round 6
      { player1: 'player-wilku', player2: 'player-karol', team1: 'arsenal', team2: 'manchester-city', score1: 2, score2: 1 },
      { player1: 'player-sebus', player2: 'player-grzesiu', team1: 'real-madrid', team2: 'bayern-munich', score1: 2, score2: 1 },
      { player1: 'player-bartus', player2: 'player-michu', team1: 'liverpool', team2: 'barcelona', score1: 0, score2: 2 },
      { player1: 'player-kula', player2: 'player-mati', team1: 'borussia', team2: 'psg', score1: 0, score2: 1 },
      
      // Round 7
      { player1: 'player-sebus', player2: 'player-karol', team1: 'real-madrid', team2: 'manchester-city', score1: 0, score2: 1 },
      { player1: 'player-michu', player2: 'player-kula', team1: 'barcelona', team2: 'borussia', score1: 0, score2: 1 },
      { player1: 'player-bartus', player2: 'player-mati', team1: 'liverpool', team2: 'psg', score1: 0, score2: 5 },
      { player1: 'player-grzesiu', player2: 'player-wilku', team1: 'bayern-munich', team2: 'arsenal', score1: 0, score2: 1 }
    ];

    // Insert all matches
    for (const match of matches) {
      await supabase.from('matches').insert({
        tournament_id: tournament.id,
        player1_id: match.player1,
        player2_id: match.player2,
        team1_id: match.team1,
        team2_id: match.team2,
        player1_score: match.score1,
        player2_score: match.score2,
        match_date: new Date().toISOString(),
        is_completed: true
      });
    }

    // Generate achievements for this tournament
    await generateTournamentAchievements(tournament.id);

    console.log('Tournament setup completed successfully');
  } catch (error) {
    console.error('Error setting up tournament:', error);
  }
}

// Create new active tournament
export async function createNewActiveTournament(): Promise<string | null> {
  if (isDemoMode) {
    console.log('Demo mode: Active tournament creation skipped');
    return 'demo-tournament-active';
  }

  try {
    // Get all active tournaments before setting them to inactive
    const { data: activeTournaments } = await supabase
      .from('tournaments')
      .select('id')
      .eq('is_active', true);

    // First, set all existing tournaments to inactive
    await supabase
      .from('tournaments')
      .update({ is_active: false })
      .neq('id', '');

    // Generate achievements for tournaments that were just ended
    if (activeTournaments && activeTournaments.length > 0) {
      for (const tournament of activeTournaments) {
        try {
          await generateTournamentAchievements(tournament.id);
          console.log(`Automatically generated achievements for ended tournament: ${tournament.id}`);
        } catch (error) {
          console.error(`Failed to generate achievements for tournament ${tournament.id}:`, error);
        }
      }
    }

    // Create new active tournament
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        name: 'Mistrzostwa Bieżanowa EA FC 25 Grudzień 2024',
        start_date: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating active tournament:', error);
      return null;
    }

    return tournament.id;
  } catch (error) {
    console.error('Error creating active tournament:', error);
    return null;
  }
}

// End a tournament and generate achievements
export async function endTournament(tournamentId: string): Promise<void> {
  if (isDemoMode) {
    console.log(`Demo: Ending tournament ${tournamentId} and generating achievements...`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    console.log(`Demo: Tournament ${tournamentId} ended successfully`);
    return;
  }

  try {
    // Set tournament to inactive
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        is_active: false,
        end_date: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (updateError) {
      throw new Error(`Failed to end tournament: ${updateError.message}`);
    }

    // Generate achievements for the ended tournament
    await generateTournamentAchievements(tournamentId);
    console.log(`Tournament ${tournamentId} ended and achievements generated successfully`);
  } catch (error) {
    console.error(`Error ending tournament ${tournamentId}:`, error);
    throw error;
  }
}

// Generate round-robin schedule for tournament
export async function generateRoundRobinSchedule(tournamentId: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Round-robin schedule generation skipped');
    return;
  }

  try {
    // Get all players
    const players = await getAllPlayers();
    const teams = await getAllTeams();
    
    if (players.length < 2) {
      throw new Error('Need at least 2 players to generate schedule');
    }

    // Generate all possible pairings (round-robin)
    const matches = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const player1 = players[i];
        const player2 = players[j];
        
        // Assign teams randomly but try to balance usage
        const team1 = teams[Math.floor(Math.random() * teams.length)];
        const team2 = teams[Math.floor(Math.random() * teams.length)];
        
        matches.push({
          tournament_id: tournamentId,
          player1_id: player1.id,
          player2_id: player2.id,
          team1_id: team1.id,
          team2_id: team2.id,
          player1_score: 0,
          player2_score: 0,
          match_date: new Date().toISOString(),
          is_completed: false
        });
      }
    }

    // Shuffle matches for random order
    for (let i = matches.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [matches[i], matches[j]] = [matches[j], matches[i]];
    }

    // Insert all matches
    for (const match of matches) {
      await supabase.from('matches').insert(match);
    }

    console.log(`Generated ${matches.length} matches for round-robin tournament`);
  } catch (error) {
    console.error('Error generating round-robin schedule:', error);
    throw error;
  }
}

// Create new tournament with round-robin schedule
export async function createTournamentWithSchedule(): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Tournament with schedule creation skipped');
    return;
  }

  try {
    const tournamentId = await createNewActiveTournament();
    if (!tournamentId) {
      throw new Error('Failed to create tournament');
    }

    await generateRoundRobinSchedule(tournamentId);
    console.log('Tournament with round-robin schedule created successfully');
  } catch (error) {
    console.error('Error creating tournament with schedule:', error);
    throw error;
  }
}

// Get player matches with full details
export async function getPlayerMatches(playerId: string, limit: number = 10, includeUpcoming: boolean = false): Promise<MatchWithDetails[]> {
  try {
    const allMatches = await getAllMatches();
    const players = await getAllPlayers();
    const teams = await getAllTeams();

    // Filter matches for this player
    let playerMatches = allMatches.filter(match => 
      match.player1_id === playerId || match.player2_id === playerId
    );

    // Filter out upcoming matches unless specifically requested
    if (!includeUpcoming) {
      playerMatches = playerMatches.filter(match => match.is_completed);
    }

    // Add full details to matches
    const matchesWithDetails: MatchWithDetails[] = playerMatches.map(match => {
      const player1 = players.find(p => p.id === match.player1_id);
      const player2 = players.find(p => p.id === match.player2_id);
      const team1 = teams.find(t => t.id === match.team1_id);
      const team2 = teams.find(t => t.id === match.team2_id);

      return {
        ...match,
        player1: player1!,
        player2: player2!,
        team1: team1!,
        team2: team2!
      };
    });

    // Sort by date (most recent first) and limit
    return matchesWithDetails
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching player matches:', error);
    return [];
  }
}

// Top scorers function
export async function getTopScorers(tournamentId: string, limit: number = 10): Promise<TopScorer[]> {
  const matches = await getMatchesForTournament(tournamentId);
  const scorerStats: { [playerId: string]: TopScorer } = {};

  matches.forEach(match => {
    if (!match.is_completed) return;

    // Track player1 goals
    if (!scorerStats[match.player1_id]) {
      scorerStats[match.player1_id] = {
        player_id: match.player1_id,
        nickname: match.player1.nickname,
        tournament_id: tournamentId,
        total_goals: 0
      };
    }
    scorerStats[match.player1_id].total_goals += match.player1_score;

    // Track player2 goals
    if (!scorerStats[match.player2_id]) {
      scorerStats[match.player2_id] = {
        player_id: match.player2_id,
        nickname: match.player2.nickname,
        tournament_id: tournamentId,
        total_goals: 0
      };
    }
    scorerStats[match.player2_id].total_goals += match.player2_score;
  });

  return Object.values(scorerStats)
    .sort((a, b) => b.total_goals - a.total_goals)
    .slice(0, limit);
}

// Teams function
export async function getAllTeams(): Promise<Team[]> {
  if (isDemoMode) {
    // Return mock data for demo
    return [
      { id: 'team-city', name: 'Manchester City', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-bayern', name: 'Bayern Monachium', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-liverpool', name: 'Liverpool FC', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-psg', name: 'Paris Saint-Germain', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-barcelona', name: 'FC Barcelona', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-arsenal', name: 'Arsenal London', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-real', name: 'Real Madryt', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-dortmund', name: 'Borussia Dortmund', created_at: '2024-11-01', updated_at: '2024-11-01' },
      { id: 'team-juventus', name: 'Juventus', created_at: '2024-12-01', updated_at: '2024-12-01' }
    ];
  }

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return data || [];
}

// Player Management Functions
export async function createPlayer(playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
  if (isDemoMode) {
    // Return mock data for demo
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      nickname: playerData.nickname,
      email: playerData.email,
      avatar_url: playerData.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newPlayer;
  }

  const { data, error } = await supabase
    .from('players')
    .insert([playerData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlayer(playerId: string, playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  if (isDemoMode) {
    // Mock update for demo
    console.log('Demo mode: Player updated', { playerId, playerData });
    return;
  }

  const { error } = await supabase
    .from('players')
    .update({
      ...playerData,
      updated_at: new Date().toISOString()
    })
    .eq('id', playerId);

  if (error) throw error;
}

export async function deletePlayer(playerId: string): Promise<void> {
  if (isDemoMode) {
    // Mock delete for demo
    console.log('Demo mode: Player deleted', { playerId });
    return;
  }

  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
}

// Team Management Functions
export async function createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team> {
  if (isDemoMode) {
    // Return mock data for demo
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTeam;
  }

  const { data, error } = await supabase
    .from('teams')
    .insert([teamData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(teamId: string, teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  if (isDemoMode) {
    // Mock update for demo
    console.log('Demo mode: Team updated', { teamId, teamData });
    return;
  }

  const { error } = await supabase
    .from('teams')
    .update({
      ...teamData,
      updated_at: new Date().toISOString()
    })
    .eq('id', teamId);

  if (error) throw error;
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (isDemoMode) {
    // Mock delete for demo
    console.log('Demo mode: Team deleted', { teamId });
    return;
  }

  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) throw error;
}

export async function createTournamentWithParticipants(
  tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>,
  participants: string[],
  teamAssignments: Record<string, string>
): Promise<Tournament> {
  console.log('=== CREATE TOURNAMENT WITH PARTICIPANTS DEBUG ===');
  console.log('Received participants:', participants);
  console.log('Received participants count:', participants.length);
  console.log('Received team assignments:', teamAssignments);
  
  // Extra validation: ensure participants array is not empty and contains valid IDs
  if (!participants || participants.length === 0) {
    throw new Error('No participants provided for tournament creation');
  }
  
  // Validate that all participants have team assignments
  const missingTeamAssignments = participants.filter(playerId => !teamAssignments[playerId]);
  if (missingTeamAssignments.length > 0) {
    console.error('Missing team assignments for players:', missingTeamAssignments);
    throw new Error(`Missing team assignments for ${missingTeamAssignments.length} players`);
  }
  
  // Log detailed participant information
  console.log('Validated participants for tournament creation:');
  participants.forEach((playerId, index) => {
    console.log(`${index + 1}. Player ID: ${playerId}, Team ID: ${teamAssignments[playerId]}`);
  });
  
  if (isDemoMode) {
    // In demo mode, just return mock data
    const mockTournament: Tournament = {
      id: `tournament-${Date.now()}`,
      name: tournamentData.name,
      start_date: tournamentData.start_date,
      end_date: tournamentData.end_date,
      is_active: tournamentData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('Demo mode: Created mock tournament with', participants.length, 'participants');
    return mockTournament;
  }

  // Create the tournament first
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .insert([tournamentData])
    .select()
    .single();

  if (tournamentError) {
    throw new Error(`Failed to create tournament: ${tournamentError.message}`);
  }

  // Generate round-robin matches for the participants
  const matches = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const player1Id = participants[i];
      const player2Id = participants[j];
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
        is_completed: false,
        match_date: null
      });
    }
  }

  // Insert all matches
  if (matches.length > 0) {
    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matches);

    if (matchesError) {
      // If matches creation fails, we should clean up the tournament
      await supabase.from('tournaments').delete().eq('id', tournament.id);
      throw new Error(`Failed to create matches: ${matchesError.message}`);
    }
  }

  return tournament;
}

// Player Photo Upload Functions
export async function uploadPlayerPhoto(playerId: string, file: File): Promise<string> {
  if (isDemoMode) {
    // In demo mode, return a placeholder URL
    return `https://via.placeholder.com/150x150?text=${playerId}`;
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${playerId}-${Date.now()}.${fileExt}`;
    const filePath = `player-photos/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('player-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('=== PHOTO UPLOAD ERROR ===');
      console.error('Error code:', uploadError.message);
      console.error('Full error:', uploadError);
      
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket 'tournament-media' not found. Please create the required storage buckets in your Supabase dashboard. See SUPABASE_STORAGE_SETUP.md for instructions.`);
      }
      
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('player-photos')
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl;

    // Update player's photo_url in the database
    const { error: updateError } = await supabase
      .from('players')
      .update({ photo_url: photoUrl })
      .eq('id', playerId);

    if (updateError) {
      // If database update fails, try to clean up the uploaded file
      await supabase.storage.from('player-photos').remove([filePath]);
      throw new Error(`Failed to update player photo URL: ${updateError.message}`);
    }

    return photoUrl;
  } catch (error) {
    console.error('Error uploading player photo:', error);
    throw error;
  }
}

export async function deletePlayerPhoto(playerId: string, photoUrl: string): Promise<void> {
  if (isDemoMode) {
    // In demo mode, just log the action
    console.log('Demo mode: Photo deletion skipped');
    return;
  }

  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `player-photos/${fileName}`;

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('player-photos')
      .remove([filePath]);

    if (deleteError) {
      console.warn('Failed to delete photo from storage:', deleteError.message);
    }

    // Update player's photo_url to null in the database
    const { error: updateError } = await supabase
      .from('players')
      .update({ photo_url: null })
      .eq('id', playerId);

    if (updateError) {
      throw new Error(`Failed to update player photo URL: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error deleting player photo:', error);
    throw error;
  }
}

// Tournament Media Upload Functions

export async function uploadTournamentPhoto(tournamentId: string, file: File): Promise<string> {
  if (isDemoMode) {
    // In demo mode, return a placeholder URL
    return `https://via.placeholder.com/800x600?text=Tournament+Photo`;
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tournamentId}-photo-${Date.now()}.${fileExt}`;
    const filePath = `tournament-media/${tournamentId}/photos/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('tournament-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading tournament photo:', error);
    throw error;
  }
}

export async function uploadTournamentVideo(tournamentId: string, file: File): Promise<string> {
  if (isDemoMode) {
    // In demo mode, return a placeholder URL
    return `https://via.placeholder.com/800x600?text=Tournament+Video`;
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tournamentId}-video-${Date.now()}.${fileExt}`;
    const filePath = `tournament-media/${tournamentId}/videos/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading tournament video:', uploadError.message);
      console.error('Full upload error:', uploadError);
      
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error(`Failed to upload video: Bucket not found. Please create the 'tournament-media' bucket in your Supabase dashboard. See SUPABASE_STORAGE_SETUP.md for instructions.`);
      }
      
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('tournament-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading tournament video:', error);
    throw error;
  }
}

export async function uploadTournamentThumbnail(tournamentId: string, file: File): Promise<string> {
  if (isDemoMode) {
    // In demo mode, return a placeholder URL
    return `https://via.placeholder.com/400x300?text=Tournament+Thumbnail`;
  }

  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${tournamentId}-thumbnail-${Date.now()}.${fileExt}`;
    const filePath = `tournament-media/${tournamentId}/thumbnails/${fileName}`;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading tournament thumbnail:', uploadError.message);
      console.error('Full upload error:', uploadError);
      
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error(`Failed to upload thumbnail: Bucket not found. Please create the 'tournament-media' bucket in your Supabase dashboard. See SUPABASE_STORAGE_SETUP.md for instructions.`);
      }
      
      throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('tournament-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading tournament thumbnail:', error);
    throw error;
  }
}

export async function updateTournamentMedia(
  tournamentId: string, 
  mediaData: {
    thumbnail_url?: string;
    photos?: string[];
    videos?: string[];
  }
): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Tournament media update skipped');
    return;
  }

  try {
    const { error } = await supabase
      .from('tournaments')
      .update(mediaData)
      .eq('id', tournamentId);

    if (error) {
      throw new Error(`Failed to update tournament media: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating tournament media:', error);
    throw error;
  }
}

export async function deleteTournamentMediaFile(fileUrl: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Media file deletion skipped');
    return;
  }

  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'tournament-media');
    if (bucketIndex === -1) {
      throw new Error('Invalid tournament media URL');
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('tournament-media')
      .remove([filePath]);

    if (deleteError) {
      console.warn('Failed to delete media file from storage:', deleteError.message);
    }
  } catch (error) {
    console.error('Error deleting tournament media file:', error);
    throw error;
  }
}

export async function addPhotoToTournament(tournamentId: string, photoUrl: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Adding photo to tournament skipped');
    return;
  }

  try {
    // Get current tournament data
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('photos')
      .eq('id', tournamentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch tournament: ${fetchError.message}`);
    }

    // Add new photo to existing photos array
    const currentPhotos = tournament.photos || [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    // Update tournament with new photos array
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ photos: updatedPhotos })
      .eq('id', tournamentId);

    if (updateError) {
      throw new Error(`Failed to add photo to tournament: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error adding photo to tournament:', error);
    throw error;
  }
}

export async function addVideoToTournament(tournamentId: string, videoUrl: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Adding video to tournament skipped');
    return;
  }

  try {
    // Get current tournament data
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('videos')
      .eq('id', tournamentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch tournament: ${fetchError.message}`);
    }

    // Add new video to existing videos array
    const currentVideos = tournament.videos || [];
    const updatedVideos = [...currentVideos, videoUrl];

    // Update tournament with new videos array
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ videos: updatedVideos })
      .eq('id', tournamentId);

    if (updateError) {
      throw new Error(`Failed to add video to tournament: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error adding video to tournament:', error);
    throw error;
  }
}

export async function removePhotoFromTournament(tournamentId: string, photoUrl: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Removing photo from tournament skipped');
    return;
  }

  try {
    // Get current tournament data
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('photos')
      .eq('id', tournamentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch tournament: ${fetchError.message}`);
    }

    // Remove photo from existing photos array
    const currentPhotos = tournament.photos || [];
    const updatedPhotos = currentPhotos.filter((photo: string) => photo !== photoUrl);

    // Update tournament with new photos array
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ photos: updatedPhotos })
      .eq('id', tournamentId);

    if (updateError) {
      throw new Error(`Failed to remove photo from tournament: ${updateError.message}`);
    }

    // Delete the actual file from storage
    await deleteTournamentMediaFile(photoUrl);
  } catch (error) {
    console.error('Error removing photo from tournament:', error);
    throw error;
  }
}

export async function removeVideoFromTournament(tournamentId: string, videoUrl: string): Promise<void> {
  if (isDemoMode) {
    console.log('Demo mode: Removing video from tournament skipped');
    return;
  }

  try {
    // Get current tournament data
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('videos')
      .eq('id', tournamentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch tournament: ${fetchError.message}`);
    }

    // Remove video from existing videos array
    const currentVideos = tournament.videos || [];
    const updatedVideos = currentVideos.filter((video: string) => video !== videoUrl);

    // Update tournament with new videos array
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ videos: updatedVideos })
      .eq('id', tournamentId);

    if (updateError) {
      throw new Error(`Failed to remove video from tournament: ${updateError.message}`);
    }

    // Delete the actual file from storage
    await deleteTournamentMediaFile(videoUrl);
  } catch (error) {
    console.error('Error removing video from tournament:', error);
    throw error;
  }
}

// Tournament statistics functions for archives page
export interface TournamentStats {
  participantCount: number;
  matchCount: number;
  totalGoals: number;
  completedMatches: number;
}

export async function getTournamentStats(tournamentId: string): Promise<TournamentStats> {
  try {
    // Get matches and league table for the tournament
    const [matches, leagueTable] = await Promise.all([
      getMatchesForTournament(tournamentId),
      getLeagueTable(tournamentId)
    ]);

    const completedMatches = matches.filter(match => match.is_completed);
    const totalGoals = completedMatches.reduce((sum, match) => sum + match.player1_score + match.player2_score, 0);

    return {
      participantCount: leagueTable.length,
      matchCount: matches.length,
      totalGoals,
      completedMatches: completedMatches.length
    };
  } catch (error) {
    console.error('Error getting tournament stats:', error);
    return {
      participantCount: 0,
      matchCount: 0,
      totalGoals: 0,
      completedMatches: 0
    };
  }
}

// Global statistics functions for stats page
export interface GlobalStats {
  totalGoals: number;
  totalMatches: number;
  totalCompletedMatches: number;
  averageGoalsPerMatch: number;
  topScorer: { nickname: string; goals: number } | null;
  mostWins: { nickname: string; wins: number } | null;
  bestGoalDifference: { nickname: string; difference: number } | null;
  mostTournaments: { nickname: string; tournaments: number } | null;
}

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const [allMatches, allPlayers] = await Promise.all([
      getAllMatches(),
      getAllPlayers()
    ]);

    const completedMatches = allMatches.filter(match => match.is_completed);
    const totalGoals = completedMatches.reduce((sum, match) => sum + match.player1_score + match.player2_score, 0);
    const averageGoalsPerMatch = completedMatches.length > 0 ? totalGoals / completedMatches.length : 0;

    // Calculate player statistics across all tournaments
    const playerStats: { [playerId: string]: { 
      nickname: string; 
      goals: number; 
      wins: number; 
      goalDifference: number; 
      tournaments: Set<string>;
    } } = {};

    // Initialize player stats
    allPlayers.forEach(player => {
      playerStats[player.id] = {
        nickname: player.nickname,
        goals: 0,
        wins: 0,
        goalDifference: 0,
        tournaments: new Set()
      };
    });

    // Calculate stats from matches
    completedMatches.forEach(match => {
      const player1Stats = playerStats[match.player1_id];
      const player2Stats = playerStats[match.player2_id];

      if (player1Stats) {
        player1Stats.goals += match.player1_score;
        player1Stats.goalDifference += (match.player1_score - match.player2_score);
        player1Stats.tournaments.add(match.tournament_id);
        if (match.player1_score > match.player2_score) {
          player1Stats.wins++;
        }
      }

      if (player2Stats) {
        player2Stats.goals += match.player2_score;
        player2Stats.goalDifference += (match.player2_score - match.player1_score);
        player2Stats.tournaments.add(match.tournament_id);
        if (match.player2_score > match.player1_score) {
          player2Stats.wins++;
        }
      }
    });

    // Find top performers
    const playerStatsArray = Object.values(playerStats);
    
    const topScorer = playerStatsArray.reduce((max, player) => 
      player.goals > (max?.goals || 0) ? { nickname: player.nickname, goals: player.goals } : max, 
      null as { nickname: string; goals: number } | null
    );

    const mostWins = playerStatsArray.reduce((max, player) => 
      player.wins > (max?.wins || 0) ? { nickname: player.nickname, wins: player.wins } : max, 
      null as { nickname: string; wins: number } | null
    );

    const bestGoalDifference = playerStatsArray.reduce((max, player) => 
      player.goalDifference > (max?.difference || -Infinity) ? { nickname: player.nickname, difference: player.goalDifference } : max, 
      null as { nickname: string; difference: number } | null
    );

    const mostTournaments = playerStatsArray.reduce((max, player) => 
      player.tournaments.size > (max?.tournaments || 0) ? { nickname: player.nickname, tournaments: player.tournaments.size } : max, 
      null as { nickname: string; tournaments: number } | null
    );

    return {
      totalGoals,
      totalMatches: allMatches.length,
      totalCompletedMatches: completedMatches.length,
      averageGoalsPerMatch,
      topScorer,
      mostWins,
      bestGoalDifference,
      mostTournaments
    };
  } catch (error) {
    console.error('Error getting global stats:', error);
    return {
      totalGoals: 0,
      totalMatches: 0,
      totalCompletedMatches: 0,
      averageGoalsPerMatch: 0,
      topScorer: null,
      mostWins: null,
      bestGoalDifference: null,
      mostTournaments: null
    };
  }
}

export async function getAllPlayersWithStats(): Promise<(Player & { stats: PlayerStats })[]> {
  try {
    const allPlayers = await getAllPlayers();
    const playersWithStats = await Promise.all(
      allPlayers.map(async (player) => {
        const stats = await getPlayerStats(player.id);
        return {
          ...player,
          stats: stats || {
            player_id: player.id,
            nickname: player.nickname,
            total_matches: 0,
            total_wins: 0,
            total_draws: 0,
            total_losses: 0,
            total_goals: 0,
            total_goals_conceded: 0,
            goal_difference: 0,
            total_points: 0,
            tournaments_won: 0,
            win_percentage: 0,
            goals_per_match: 0,
            clean_sheets: 0,
            biggest_win: 0,
            biggest_loss: 0
          }
        };
      })
    );
    
    return playersWithStats;
  } catch (error) {
    console.error('Error getting players with stats:', error);
    return [];
  }
}
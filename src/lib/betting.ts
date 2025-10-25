import { supabase } from './supabase';
import { getAllPlayers } from './supabase';
import {
  BettingCoupon,
  BettingPrediction,
  BettingPredictionType,
  BettingPlayerStats,
  BettingAchievement,
  BettingFormData,
  BettingRankingEntry
} from '@/types/database';

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || 
                   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('placeholder');

// ============================================================================
// BETTING SYSTEM FUNCTIONS
// ============================================================================

/**
 * Get all betting prediction types
 */
export async function getBettingPredictionTypes(): Promise<BettingPredictionType[]> {
  if (isDemoMode) {
    return [
      {
        id: 'type-1',
        type_name: 'goals_over_under',
        display_name: 'Over/Under Bramki',
        description: 'Przewidywanie czy średnia bramek na mecz będzie powyżej czy poniżej 4',
        points_for_correct: 2,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'type-2',
        type_name: 'final_ranking',
        display_name: 'Kolejność Miejsc',
        description: 'Przewidywanie końcowej kolejności graczy w turnieju',
        points_for_correct: 5,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'type-3',
        type_name: 'top_scorer',
        display_name: 'Król Strzelców',
        description: 'Przewidywanie kto strzeli najwięcej bramek',
        points_for_correct: 3,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'type-4',
        type_name: 'worst_defense',
        display_name: 'Najgorsza Obrona',
        description: 'Przewidywanie kto straci najwięcej bramek',
        points_for_correct: 3,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'type-5',
        type_name: 'tournament_winner',
        display_name: 'Zwycięzca Turnieju',
        description: 'Przewidywanie kto wygra turniej',
        points_for_correct: 5,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'type-6',
        type_name: 'surprise_player',
        display_name: 'Niespodzianka Turnieju',
        description: 'Przewidywanie gracza który zaskoczy pozytywnie',
        points_for_correct: 4,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('betting_prediction_types')
    .select('*')
    .eq('is_active', true)
    .order('type_name');

  if (error) {
    console.error('Error fetching betting prediction types:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate coupon results and award points
 * This function should be called when a tournament is completed
 */
export async function calculateCouponResults(tournamentId: string): Promise<{ success: boolean; error?: string; processedCoupons?: number }> {
  try {
    if (isDemoMode) {
      return { success: true, processedCoupons: 0 };
    }

    // Get tournament data with final results
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select(`
        *,
        matches:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `)
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    // Get all submitted coupons for this tournament
    const { data: coupons, error: couponsError } = await supabase
      .from('betting_coupons')
      .select(`
        *,
        predictions:betting_predictions(*)
      `)
      .eq('tournament_id', tournamentId)
      .eq('is_submitted', true);

    if (couponsError) {
      return { success: false, error: 'Error fetching coupons' };
    }

    if (!coupons || coupons.length === 0) {
      return { success: true, processedCoupons: 0 };
    }

    // Calculate tournament statistics for comparison
    const tournamentStats = calculateTournamentStats(tournament.matches);
    
    let processedCount = 0;

    // Process each coupon
    for (const coupon of coupons) {
      const points = calculateCouponPoints(coupon, tournamentStats);
      
      // Update coupon with calculated points
      const { error: updateError } = await supabase
        .from('betting_coupons')
        .update({
          total_points: points,
          is_calculated: true,
          calculated_at: new Date().toISOString()
        })
        .eq('id', coupon.id);

      if (updateError) {
        console.error(`Error updating coupon ${coupon.id}:`, updateError);
        continue;
      }

      processedCount++;
    }

    // Award achievements for this tournament
    await awardTournamentAchievements(tournamentId);

    return { success: true, processedCoupons: processedCount };

  } catch (error) {
    console.error('Error calculating coupon results:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Calculate tournament statistics from matches
 */
function calculateTournamentStats(matches: any[]) {
  const completedMatches = matches.filter(m => m.status === 'completed');
  
  if (completedMatches.length === 0) {
    return {
      averageGoalsPerMatch: 0,
      topScorer: null,
      worstDefense: null,
      tournamentWinner: null,
      finalRanking: []
    };
  }

  // Calculate average goals per match
  const totalGoals = completedMatches.reduce((sum, match) => 
    sum + (match.home_score || 0) + (match.away_score || 0), 0);
  const averageGoalsPerMatch = totalGoals / completedMatches.length;

  // Calculate player statistics
  const playerStats = new Map();
  
  completedMatches.forEach(match => {
    const homeTeamId = match.home_team?.id;
    const awayTeamId = match.away_team?.id;
    const homeScore = match.home_score || 0;
    const awayScore = match.away_score || 0;

    if (homeTeamId) {
      if (!playerStats.has(homeTeamId)) {
        playerStats.set(homeTeamId, { goals: 0, conceded: 0, points: 0 });
      }
      const homeStats = playerStats.get(homeTeamId);
      homeStats.goals += homeScore;
      homeStats.conceded += awayScore;
      
      // Award points based on result
      if (homeScore > awayScore) homeStats.points += 3;
      else if (homeScore === awayScore) homeStats.points += 1;
    }

    if (awayTeamId) {
      if (!playerStats.has(awayTeamId)) {
        playerStats.set(awayTeamId, { goals: 0, conceded: 0, points: 0 });
      }
      const awayStats = playerStats.get(awayTeamId);
      awayStats.goals += awayScore;
      awayStats.conceded += homeScore;
      
      // Award points based on result
      if (awayScore > homeScore) awayStats.points += 3;
      else if (awayScore === homeScore) awayStats.points += 1;
    }
  });

  // Find top scorer
  let topScorer = null;
  let maxGoals = 0;
  playerStats.forEach((stats, playerId) => {
    if (stats.goals > maxGoals) {
      maxGoals = stats.goals;
      topScorer = playerId;
    }
  });

  // Find worst defense
  let worstDefense = null;
  let maxConceded = 0;
  playerStats.forEach((stats, playerId) => {
    if (stats.conceded > maxConceded) {
      maxConceded = stats.conceded;
      worstDefense = playerId;
    }
  });

  // Create final ranking
  const finalRanking = Array.from(playerStats.entries())
    .map(([playerId, stats]) => ({ playerId, ...stats }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if ((b.goals - b.conceded) !== (a.goals - a.conceded)) return (b.goals - b.conceded) - (a.goals - a.conceded);
      return b.goals - a.goals;
    });

  const tournamentWinner = finalRanking.length > 0 ? finalRanking[0].playerId : null;

  return {
    averageGoalsPerMatch,
    topScorer,
    worstDefense,
    tournamentWinner,
    finalRanking: finalRanking.map(r => r.playerId)
  };
}

/**
 * Calculate points for a single coupon
 */
function calculateCouponPoints(coupon: any, tournamentStats: any): number {
  let totalPoints = 0;
  const predictions = coupon.predictions || [];

  predictions.forEach((prediction: any) => {
    const predictionValue = prediction.prediction_value;
    
    switch (prediction.prediction_type) {
      case 'goals_over_under':
        if (predictionValue === 'over' && tournamentStats.averageGoalsPerMatch > 4) {
          totalPoints += 5;
        } else if (predictionValue === 'under' && tournamentStats.averageGoalsPerMatch <= 4) {
          totalPoints += 5;
        }
        break;

      case 'top_scorer':
        if (predictionValue === tournamentStats.topScorer) {
          totalPoints += 10;
        }
        break;

      case 'worst_defense':
        if (predictionValue === tournamentStats.worstDefense) {
          totalPoints += 8;
        }
        break;

      case 'tournament_winner':
        if (predictionValue === tournamentStats.tournamentWinner) {
          totalPoints += 15;
        }
        break;

      case 'final_ranking':
        // Award points based on how close the prediction is to actual ranking
        if (Array.isArray(predictionValue) && tournamentStats.finalRanking.length > 0) {
          const rankingPoints = calculateRankingPoints(predictionValue, tournamentStats.finalRanking);
          totalPoints += rankingPoints;
        }
        break;

      case 'surprise_player':
        // Award points if the predicted player finished higher than expected
        if (tournamentStats.finalRanking.length > 0) {
          const playerIndex = tournamentStats.finalRanking.indexOf(predictionValue);
          if (playerIndex >= 0 && playerIndex < Math.floor(tournamentStats.finalRanking.length / 2)) {
            totalPoints += 12; // Player finished in top half
          }
        }
        break;
    }
  });

  return totalPoints;
}

/**
 * Calculate points for ranking prediction
 */
function calculateRankingPoints(predictedRanking: string[], actualRanking: string[]): number {
  let points = 0;
  const maxPositions = Math.min(predictedRanking.length, actualRanking.length);

  for (let i = 0; i < maxPositions; i++) {
    const predictedPlayer = predictedRanking[i];
    const actualPosition = actualRanking.indexOf(predictedPlayer);
    
    if (actualPosition === i) {
      // Exact position match
      points += 5;
    } else if (actualPosition >= 0 && Math.abs(actualPosition - i) === 1) {
      // Off by one position
      points += 3;
    } else if (actualPosition >= 0 && Math.abs(actualPosition - i) === 2) {
      // Off by two positions
      points += 1;
    }
  }

  return points;
}

/**
 * Award achievements for tournament
 */
async function awardTournamentAchievements(tournamentId: string): Promise<void> {
  try {
    // Get all coupons for this tournament, ordered by points
    const { data: coupons, error } = await supabase
      .from('betting_coupons')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('is_calculated', true)
      .order('total_points', { ascending: false });

    if (error || !coupons || coupons.length === 0) {
      return;
    }

    // Award "Gambling King" to the best coupon
    const bestCoupon = coupons[0];
    if (bestCoupon.total_points > 0) {
      await supabase
        .from('betting_achievements')
        .insert({
          tournament_id: tournamentId,
          player_id: bestCoupon.player_id,
          achievement_type: 'gambling_king',
          achievement_name: 'Król Hazardu',
          description: `Najlepszy kupon w turnieju z ${bestCoupon.total_points} punktami`,
          points_earned: 25
        });
    }

    // Award "Dark Horse" to players who exceeded expectations
    const averagePoints = coupons.reduce((sum, c) => sum + c.total_points, 0) / coupons.length;
    const darkHorseCandidates = coupons.filter(c => c.total_points > averagePoints * 1.5);
    
    for (const candidate of darkHorseCandidates.slice(0, 3)) { // Max 3 dark horse awards
      await supabase
        .from('betting_achievements')
        .insert({
          tournament_id: tournamentId,
          player_id: candidate.player_id,
          achievement_type: 'dark_horse',
          achievement_name: 'Czarny Koń',
          description: `Przekroczył oczekiwania z ${candidate.total_points} punktami`,
          points_earned: 15
        });
    }

  } catch (error) {
    console.error('Error awarding achievements:', error);
  }
}

/**
 * Create a new betting coupon with predictions
 */
export async function createBettingCoupon(formData: BettingFormData): Promise<{ success: boolean; data?: BettingCoupon; error?: string }> {
  if (isDemoMode) {
    console.log('Demo mode: Would create betting coupon:', formData);
    return {
      success: true,
      data: {
        id: `coupon-${Date.now()}`,
        tournament_id: formData.tournament_id,
        player_id: formData.player_id,
        coupon_name: formData.coupon_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_submitted: true,
        total_points: 0
      }
    };
  }

  try {
    // First, create the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('betting_coupons')
      .insert({
        tournament_id: formData.tournament_id,
        player_id: formData.player_id,
        coupon_name: formData.coupon_name,
        is_submitted: true
      })
      .select()
      .single();

    if (couponError) {
      console.error('Error creating betting coupon:', couponError);
      return {
        success: false,
        error: `Błąd podczas tworzenia kuponu: ${couponError.message}`
      };
    }

    // Then, create predictions
    const predictions = [];
    
    if (formData.predictions.goals_over_under) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'goals_over_under',
        prediction_value: formData.predictions.goals_over_under
      });
    }

    if (formData.predictions.final_ranking && formData.predictions.final_ranking.length > 0) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'final_ranking',
        prediction_value: JSON.stringify(formData.predictions.final_ranking)
      });
    }

    if (formData.predictions.top_scorer) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'top_scorer',
        prediction_value: formData.predictions.top_scorer
      });
    }

    if (formData.predictions.worst_defense) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'worst_defense',
        prediction_value: formData.predictions.worst_defense
      });
    }

    if (formData.predictions.tournament_winner) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'tournament_winner',
        prediction_value: formData.predictions.tournament_winner
      });
    }

    if (formData.predictions.surprise_player) {
      predictions.push({
        coupon_id: coupon.id,
        prediction_type: 'surprise_player',
        prediction_value: formData.predictions.surprise_player
      });
    }

    if (predictions.length > 0) {
      const { error: predictionsError } = await supabase
        .from('betting_predictions')
        .insert(predictions);

      if (predictionsError) {
        console.error('Error creating betting predictions:', predictionsError);
        // Rollback coupon creation
        await supabase.from('betting_coupons').delete().eq('id', coupon.id);
        return {
          success: false,
          error: `Błąd podczas tworzenia przewidywań: ${predictionsError.message}`
        };
      }
    }

    return {
      success: true,
      data: coupon
    };
  } catch (error) {
    console.error('Error in createBettingCoupon:', error);
    return {
      success: false,
      error: `Nieoczekiwany błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
    };
  }
}

/**
 * Get betting coupon for a player in a tournament
 */
export async function getBettingCoupon(tournamentId: string, playerId: string): Promise<BettingCoupon | null> {
  if (isDemoMode) {
    return null; // No existing coupons in demo mode
  }

  const { data, error } = await supabase
    .from('betting_coupons')
    .select(`
      *,
      predictions:betting_predictions(*)
    `)
    .eq('tournament_id', tournamentId)
    .eq('player_id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No coupon found
      return null;
    }
    console.error('Error fetching betting coupon:', error);
    return null;
  }

  return data;
}

/**
 * Get all betting coupons for a tournament
 */
export async function getTournamentBettingCoupons(tournamentId: string): Promise<BettingCoupon[]> {
  if (isDemoMode) {
    const players = await getAllPlayers();
    return players.slice(0, 3).map((player, index) => ({
      id: `coupon-${index + 1}`,
      tournament_id: tournamentId,
      player_id: player.id,
      coupon_name: `Kupon ${player.nickname}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_submitted: true,
      total_points: Math.floor(Math.random() * 20) + 5,
      player
    }));
  }

  const { data, error } = await supabase
    .from('betting_coupons')
    .select(`
      *,
      player:players(*),
      predictions:betting_predictions(*)
    `)
    .eq('tournament_id', tournamentId)
    .eq('is_submitted', true)
    .order('total_points', { ascending: false });

  if (error) {
    console.error('Error fetching tournament betting coupons:', error);
    return [];
  }

  return data || [];
}

/**
 * Get betting player stats
 */
export async function getBettingPlayerStats(playerId: string): Promise<BettingPlayerStats | null> {
  if (isDemoMode) {
    return {
      id: `stats-${playerId}`,
      player_id: playerId,
      total_coupons: Math.floor(Math.random() * 10) + 1,
      total_points: Math.floor(Math.random() * 100) + 20,
      correct_predictions: Math.floor(Math.random() * 30) + 5,
      total_predictions: Math.floor(Math.random() * 50) + 20,
      accuracy_percentage: Math.random() * 100,
      best_coupon_points: Math.floor(Math.random() * 25) + 10,
      gambling_king_awards: Math.floor(Math.random() * 3),
      dark_horse_awards: Math.floor(Math.random() * 2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('betting_player_stats')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No stats found
      return null;
    }
    console.error('Error fetching betting player stats:', error);
    return null;
  }

  return data;
}

/**
 * Get betting ranking for all players
 */
export async function getBettingRanking(): Promise<BettingRankingEntry[]> {
  if (isDemoMode) {
    const players = await getAllPlayers();
    return players.map((player, index) => ({
      player_id: player.id,
      nickname: player.nickname,
      total_points: Math.floor(Math.random() * 100) + 20,
      total_coupons: Math.floor(Math.random() * 10) + 1,
      accuracy_percentage: Math.random() * 100,
      gambling_king_awards: Math.floor(Math.random() * 3),
      dark_horse_awards: Math.floor(Math.random() * 2),
      position: index + 1
    })).sort((a, b) => b.total_points - a.total_points);
  }

  const { data, error } = await supabase
    .from('betting_player_stats')
    .select(`
      *,
      player:players(nickname)
    `)
    .order('total_points', { ascending: false })
    .order('accuracy_percentage', { ascending: false });

  if (error) {
    console.error('Error fetching betting ranking:', error);
    return [];
  }

  return (data || []).map((stats, index) => ({
    player_id: stats.player_id,
    nickname: stats.player?.nickname || 'Unknown',
    total_points: stats.total_points,
    total_coupons: stats.total_coupons,
    accuracy_percentage: stats.accuracy_percentage,
    gambling_king_awards: stats.gambling_king_awards,
    dark_horse_awards: stats.dark_horse_awards,
    position: index + 1
  }));
}

/**
 * Get betting achievements for a player
 */
export async function getBettingAchievements(playerId: string): Promise<BettingAchievement[]> {
  if (isDemoMode) {
    return [
      {
        id: `achievement-1`,
        tournament_id: 'tournament-1',
        player_id: playerId,
        achievement_type: 'gambling_king',
        achievement_name: 'Król Hazardu',
        description: 'Najlepszy kupon w turnieju',
        points_earned: 25,
        created_at: new Date().toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('betting_achievements')
    .select(`
      *,
      tournament:tournaments(name),
      player:players(nickname)
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching betting achievements:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete betting coupon (admin only)
 */
export async function deleteBettingCoupon(couponId: string): Promise<{ success: boolean; error?: string }> {
  if (isDemoMode) {
    return { success: true };
  }

  try {
    // First delete all predictions associated with the coupon
    const { error: predictionsError } = await supabase
      .from('betting_predictions')
      .delete()
      .eq('coupon_id', couponId);

    if (predictionsError) {
      console.error('Error deleting betting predictions:', predictionsError);
      return { success: false, error: 'Błąd podczas usuwania przewidywań' };
    }

    // Then delete the coupon itself
    const { error: couponError } = await supabase
      .from('betting_coupons')
      .delete()
      .eq('id', couponId);

    if (couponError) {
      console.error('Error deleting betting coupon:', couponError);
      return { success: false, error: 'Błąd podczas usuwania kuponu' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBettingCoupon:', error);
    return { success: false, error: 'Nieoczekiwany błąd podczas usuwania kuponu' };
  }
}

/**
 * Get all betting coupons for a specific player
 */
export async function getPlayerBettingCoupons(playerId: string): Promise<BettingCoupon[]> {
  if (isDemoMode) {
    const players = await getAllPlayers();
    const tournaments = [
      { id: 'tournament-1', name: 'Turniej Demo 1' },
      { id: 'tournament-2', name: 'Turniej Demo 2' }
    ];
    
    return tournaments.map((tournament, index) => ({
      id: `coupon-${playerId}-${index + 1}`,
      tournament_id: tournament.id,
      player_id: playerId,
      coupon_name: `Kupon ${tournament.name}`,
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      updated_at: new Date(Date.now() - index * 86400000).toISOString(),
      is_submitted: true,
      total_points: Math.floor(Math.random() * 20) + 5,
      tournament: tournament,
      predictions: [
        {
          id: `pred-${index}-1`,
          coupon_id: `coupon-${playerId}-${index + 1}`,
          prediction_type: 'goals_over_under',
          prediction_value: Math.random() > 0.5 ? 'over' : 'under',
          is_correct: Math.random() > 0.5,
          points_earned: Math.floor(Math.random() * 5)
        }
      ]
    }));
  }

  const { data, error } = await supabase
    .from('betting_coupons')
    .select(`
      *,
      tournament:tournaments(id, name),
      predictions:betting_predictions(*)
    `)
    .eq('player_id', playerId)
    .eq('is_submitted', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching player betting coupons:', error);
    return [];
  }

  return data || [];
}
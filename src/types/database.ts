export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  thumbnail_url?: string;
  photos?: string[];
  videos?: string[];
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar_url?: string;
  photo_url?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  badge_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  team1_id: string;
  team2_id: string;
  player1_score: number;
  player2_score: number;
  match_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  tournament?: Tournament;
  player1?: Player;
  player2?: Player;
  team1?: Team;
  team2?: Team;
}

export interface Achievement {
  id: string;
  player_id: string;
  tournament_id?: string;
  achievement_type: 'tournament_winner' | 'top_scorer' | 'defensive_leader' | 'most_conceded' | 'king_of_emotions';
  achievement_rank?: number; // 1, 2, 3 for tournament winners
  title: string;
  description?: string;
  icon_url?: string;
  value?: number; // numerical value (goals, points, etc.)
  achievement_date: string;
  created_at: string;
  // Relations
  player?: Player;
  tournament?: Tournament;
}

export interface LeagueTableEntry {
  tournament_id: string;
  player_id: string;
  nickname: string;
  team_name: string;
  team_badge?: string;
  matches_played: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  position?: number;
}

export interface MatchWithDetails extends Match {
  player1: Player;
  player2: Player;
  team1: Team;
  team2: Team;
}

export interface PlayerStats {
  player_id: string;
  nickname: string;
  total_matches: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  total_goals: number;
  total_goals_conceded: number;
  goal_difference: number;
  total_points: number;
  tournaments_won: number;
  win_percentage: number;
  goals_per_match: number;
  clean_sheets: number;
  biggest_win: number;
  biggest_loss: number;
}

export interface TopScorer {
  player_id: string;
  nickname: string;
  tournament_id: string;
  total_goals: number;
}

export interface TournamentStats {
  participantCount: number;
  matchCount: number;
  totalGoals: number;
  completedMatches: number;
}

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

// Betting System Types
export interface BettingCoupon {
  id: string;
  tournament_id: string;
  player_id: string;
  coupon_name: string;
  created_at: string;
  updated_at: string;
  is_submitted: boolean;
  total_points: number;
  // Relations
  tournament?: Tournament;
  player?: Player;
  predictions?: BettingPrediction[];
}

export interface BettingPrediction {
  id: string;
  coupon_id: string;
  prediction_type: string;
  prediction_value: string;
  points_awarded: number;
  is_correct: boolean | null;
  created_at: string;
  // Relations
  coupon?: BettingCoupon;
  prediction_type_info?: BettingPredictionType;
}

export interface BettingPredictionType {
  id: string;
  type_name: string;
  display_name: string;
  description?: string;
  points_for_correct: number;
  is_active: boolean;
  created_at: string;
}

export interface BettingPlayerStats {
  id: string;
  player_id: string;
  total_coupons: number;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy_percentage: number;
  best_coupon_points: number;
  gambling_king_awards: number;
  dark_horse_awards: number;
  created_at: string;
  updated_at: string;
  // Relations
  player?: Player;
}

export interface BettingAchievement {
  id: string;
  tournament_id: string;
  player_id: string;
  achievement_type: 'gambling_king' | 'dark_horse' | 'perfect_predictor';
  achievement_name: string;
  description?: string;
  points_earned: number;
  created_at: string;
  // Relations
  tournament?: Tournament;
  player?: Player;
}

// Betting Form Types
export interface BettingFormData {
  coupon_name: string;
  tournament_id: string;
  player_id: string;
  predictions: {
    goals_over_under?: 'over' | 'under';
    final_ranking?: string[]; // Array of player IDs in predicted order
    top_scorer?: string; // Player ID
    worst_defense?: string; // Player ID
    tournament_winner?: string; // Player ID
    surprise_player?: string; // Player ID
  };
}

export interface BettingRankingEntry {
  player_id: string;
  nickname: string;
  total_points: number;
  total_coupons: number;
  accuracy_percentage: number;
  gambling_king_awards: number;
  dark_horse_awards: number;
  position: number;
}
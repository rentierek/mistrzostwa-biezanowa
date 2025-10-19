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
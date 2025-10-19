-- Mistrzostwa Bieżanowa Database Schema
-- EA FC Tournament Management System

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    thumbnail_url TEXT, -- URL to tournament thumbnail image
    photos TEXT[], -- Array of photo URLs
    videos TEXT[], -- Array of video URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname VARCHAR(100) NOT NULL UNIQUE,
    avatar_url TEXT,
    photo_url TEXT, -- URL to player's photo
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    badge_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure players are different
    CONSTRAINT different_players CHECK (player1_id != player2_id),
    -- Ensure teams are different
    CONSTRAINT different_teams CHECK (team1_id != team2_id),
    -- Ensure scores are non-negative
    CONSTRAINT valid_scores CHECK (player1_score >= 0 AND player2_score >= 0)
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'tournament_winner', 'top_scorer', 'defensive_leader', 'most_conceded', 'king_of_emotions'
    achievement_rank INTEGER, -- 1 for 1st place, 2 for 2nd place, 3 for 3rd place (for tournament winners)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT, -- URL to achievement badge/icon
    value INTEGER, -- numerical value (goals scored, clean sheets, etc.)
    achievement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid achievement types
    CONSTRAINT valid_achievement_type CHECK (achievement_type IN ('tournament_winner', 'top_scorer', 'defensive_leader', 'most_conceded', 'king_of_emotions')),
    -- Ensure valid ranks for tournament winners
    CONSTRAINT valid_tournament_rank CHECK (
        (achievement_type = 'tournament_winner' AND achievement_rank IN (1, 2, 3)) OR
        (achievement_type != 'tournament_winner' AND achievement_rank IS NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_active ON tournaments(is_active);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_completed ON matches(is_completed);
CREATE INDEX idx_achievements_player ON achievements(player_id);
CREATE INDEX idx_achievements_tournament ON achievements(tournament_id);

-- Create a view for league table calculation
CREATE OR REPLACE VIEW league_table_view AS
WITH match_results AS (
    SELECT 
        m.tournament_id,
        m.player1_id as player_id,
        m.team1_id as team_id,
        CASE 
            WHEN m.player1_score > m.player2_score THEN 3
            WHEN m.player1_score = m.player2_score THEN 1
            ELSE 0
        END as points,
        1 as matches_played,
        CASE WHEN m.player1_score > m.player2_score THEN 1 ELSE 0 END as wins,
        CASE WHEN m.player1_score = m.player2_score THEN 1 ELSE 0 END as draws,
        CASE WHEN m.player1_score < m.player2_score THEN 1 ELSE 0 END as losses,
        m.player1_score as goals_for,
        m.player2_score as goals_against
    FROM matches m
    WHERE m.is_completed = true
    
    UNION ALL
    
    SELECT 
        m.tournament_id,
        m.player2_id as player_id,
        m.team2_id as team_id,
        CASE 
            WHEN m.player2_score > m.player1_score THEN 3
            WHEN m.player2_score = m.player1_score THEN 1
            ELSE 0
        END as points,
        1 as matches_played,
        CASE WHEN m.player2_score > m.player1_score THEN 1 ELSE 0 END as wins,
        CASE WHEN m.player2_score = m.player1_score THEN 1 ELSE 0 END as draws,
        CASE WHEN m.player2_score < m.player1_score THEN 1 ELSE 0 END as losses,
        m.player2_score as goals_for,
        m.player1_score as goals_against
    FROM matches m
    WHERE m.is_completed = true
)
SELECT 
    mr.tournament_id,
    mr.player_id,
    p.nickname,
    t.name as team_name,
    t.badge_url as team_badge,
    SUM(mr.matches_played) as matches_played,
    SUM(mr.points) as points,
    SUM(mr.wins) as wins,
    SUM(mr.draws) as draws,
    SUM(mr.losses) as losses,
    SUM(mr.goals_for) as goals_for,
    SUM(mr.goals_against) as goals_against,
    SUM(mr.goals_for) - SUM(mr.goals_against) as goal_difference
FROM match_results mr
JOIN players p ON mr.player_id = p.id
JOIN teams t ON mr.team_id = t.id
GROUP BY mr.tournament_id, mr.player_id, p.nickname, t.name, t.badge_url;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and award achievements for a tournament
CREATE OR REPLACE FUNCTION award_tournament_achievements(tournament_uuid UUID)
RETURNS VOID AS $$
DECLARE
    tournament_name VARCHAR(255);
BEGIN
    -- Get tournament name
    SELECT name INTO tournament_name FROM tournaments WHERE id = tournament_uuid;
    
    -- Clear existing achievements for this tournament
    DELETE FROM achievements WHERE tournament_id = tournament_uuid;
    
    -- Award tournament winner achievements (1st, 2nd, 3rd place)
    WITH tournament_standings AS (
        SELECT 
            player_id,
            nickname,
            points,
            goal_difference,
            goals_for,
            ROW_NUMBER() OVER (ORDER BY points DESC, goal_difference DESC, goals_for DESC) as position
        FROM league_table_view 
        WHERE tournament_id = tournament_uuid
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, achievement_rank, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'tournament_winner',
        position,
        CASE 
            WHEN position = 1 THEN '🥇 Mistrz Turnieju'
            WHEN position = 2 THEN '🥈 Wicemistrz Turnieju'
            WHEN position = 3 THEN '🥉 Trzecie Miejsce'
        END,
        CASE 
            WHEN position = 1 THEN 'Zwyciężca turnieju ' || tournament_name
            WHEN position = 2 THEN 'Drugie miejsce w turnieju ' || tournament_name
            WHEN position = 3 THEN 'Trzecie miejsce w turnieju ' || tournament_name
        END,
        points
    FROM tournament_standings 
    WHERE position <= 3;
    
    -- Award top scorer achievement
    WITH top_scorers AS (
        SELECT 
            player_id,
            nickname,
            goals_for,
            ROW_NUMBER() OVER (ORDER BY goals_for DESC) as rank
        FROM league_table_view 
        WHERE tournament_id = tournament_uuid AND goals_for > 0
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'top_scorer',
        '⚽ Król Strzelców',
        'Najwięcej bramek w turnieju ' || tournament_name || ' (' || goals_for || ' bramek)',
        goals_for
    FROM top_scorers 
    WHERE rank = 1;
    
    -- Award defensive leader achievement (most clean sheets)
    WITH defensive_leaders AS (
        SELECT 
            ltv.player_id,
            ltv.nickname,
            COUNT(CASE WHEN (m.player1_id = ltv.player_id AND m.player2_score = 0) OR 
                              (m.player2_id = ltv.player_id AND m.player1_score = 0) THEN 1 END) as clean_sheets,
            ROW_NUMBER() OVER (ORDER BY COUNT(CASE WHEN (m.player1_id = ltv.player_id AND m.player2_score = 0) OR 
                                                        (m.player2_id = ltv.player_id AND m.player1_score = 0) THEN 1 END) DESC) as rank
        FROM league_table_view ltv
        JOIN matches m ON (m.player1_id = ltv.player_id OR m.player2_id = ltv.player_id) 
                      AND m.tournament_id = tournament_uuid AND m.is_completed = true
        WHERE ltv.tournament_id = tournament_uuid
        GROUP BY ltv.player_id, ltv.nickname
        HAVING COUNT(CASE WHEN (m.player1_id = ltv.player_id AND m.player2_score = 0) OR 
                                (m.player2_id = ltv.player_id AND m.player1_score = 0) THEN 1 END) > 0
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'defensive_leader',
        '🛡️ Lider Obrony',
        'Najwięcej czystych kont w turnieju ' || tournament_name || ' (' || clean_sheets || ' czystych kont)',
        clean_sheets
    FROM defensive_leaders 
    WHERE rank = 1;
    
    -- Award most goals conceded achievement
    WITH most_conceded AS (
        SELECT 
            player_id,
            nickname,
            goals_against,
            ROW_NUMBER() OVER (ORDER BY goals_against DESC) as rank
        FROM league_table_view 
        WHERE tournament_id = tournament_uuid AND goals_against > 0
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'most_conceded',
        '🤡 Lider Obrony XD',
        'Najwięcej straconych bramek w turnieju ' || tournament_name || ' (' || goals_against || ' bramek)',
        goals_against
    FROM most_conceded 
    WHERE rank = 1;
    
    -- Award King of Emotions achievement (most goals in their matches - scored + conceded)
    WITH emotions_king AS (
        SELECT 
            player_id,
            nickname,
            (goals_for + goals_against) as total_goals,
            ROW_NUMBER() OVER (ORDER BY (goals_for + goals_against) DESC) as rank
        FROM league_table_view 
        WHERE tournament_id = tournament_uuid AND (goals_for + goals_against) > 0
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'king_of_emotions',
        '🎭 Król Emocji',
        'Najwięcej bramek w meczach gracza w turnieju ' || tournament_name || ' (' || total_goals || ' bramek łącznie)',
        total_goals
    FROM emotions_king 
    WHERE rank = 1;
    
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for development
INSERT INTO tournaments (name, start_date, end_date, is_active) VALUES
('Sezon 1 - Mistrzostwa Bieżanowa', '2024-01-01', '2024-03-31', false),
('Sezon 2 - Mistrzostwa Bieżanowa', '2024-04-01', '2024-06-30', false),
('Sezon 3 - Mistrzostwa Bieżanowa', '2024-07-01', NULL, true);

INSERT INTO players (nickname, email) VALUES
('KrólStrzelców', 'krol@example.com'),
('DefensorPro', 'defensor@example.com'),
('MistrzowyGracz', 'mistrz@example.com'),
('TaktykFC', 'taktyk@example.com'),
('SpeedyWinger', 'speedy@example.com'),
('GoalMachine', 'goal@example.com');

INSERT INTO teams (name) VALUES
('Real Madrid'),
('FC Barcelona'),
('Manchester City'),
('Liverpool FC'),
('Bayern Munich'),
('Paris Saint-Germain'),
('Juventus'),
('AC Milan'),
('Chelsea FC'),
('Arsenal FC'),
('Manchester United'),
('Atletico Madrid');
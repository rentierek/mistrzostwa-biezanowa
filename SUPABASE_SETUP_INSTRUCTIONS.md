# 🚀 Supabase Setup Instructions - Copy & Paste Ready

## 📦 Step 1: Create Storage Buckets

Go to your Supabase Dashboard → Storage → Create new bucket

### Create these buckets (copy-paste the names exactly):

```
tournament-media
```

```
player-photos
```

**Bucket Settings for both:**
- Public bucket: ✅ **YES** (check this box)
- File size limit: 50MB
- Allowed MIME types: `image/*,video/*`

---

## 🗄️ Step 2: Create Database Function for Achievements

Go to your Supabase Dashboard → SQL Editor → New query

**Copy and paste this entire SQL code:**

```sql
-- Create the achievement generation function
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
    
    -- Award defensive leader achievement (best goal difference)
    WITH defensive_leaders AS (
        SELECT 
            player_id,
            nickname,
            goal_difference,
            ROW_NUMBER() OVER (ORDER BY goal_difference DESC) as rank
        FROM league_table_view 
        WHERE tournament_id = tournament_uuid AND goal_difference > 0
    )
    INSERT INTO achievements (player_id, tournament_id, achievement_type, title, description, value)
    SELECT 
        player_id,
        tournament_uuid,
        'defensive_leader',
        '🛡️ Lider Obrony',
        'Najlepsza różnica bramkowa w turnieju ' || tournament_name || ' (+' || goal_difference || ')',
        goal_difference
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
    
    -- Award King of Emotions achievement (most total goals in matches)
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
$$
LANGUAGE plpgsql;
```

**After pasting, click "RUN" to execute the SQL.**

---

## ✅ Step 3: Verify Setup

1. **Check Buckets**: Go to Storage → you should see `tournament-media` and `player-photos` buckets
2. **Check Function**: Go to Database → Functions → you should see `award_tournament_achievements`

---

## 🔧 Troubleshooting

**If you get errors:**
- Make sure you have the `achievements` and `league_table_view` tables (they should exist from the main database schema)
- Ensure you're running this in the correct Supabase project
- Check that you have admin permissions in Supabase

**Note**: Even if the database function fails, the app has a backup system that will work automatically! 🎉
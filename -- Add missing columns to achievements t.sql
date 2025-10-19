-- Add missing columns to achievements table
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS achievement_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS achievement_rank INTEGER,
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS value INTEGER,
ADD COLUMN IF NOT EXISTS achievement_date DATE DEFAULT CURRENT_DATE;

-- Update achievement_type to NOT NULL after adding default values
UPDATE achievements SET achievement_type = 'tournament_winner' WHERE achievement_type IS NULL;
UPDATE achievements SET title = 'Achievement' WHERE title IS NULL;

ALTER TABLE achievements 
ALTER COLUMN achievement_type SET NOT NULL,
ALTER COLUMN title SET NOT NULL;

-- Add constraints
ALTER TABLE achievements 
ADD CONSTRAINT IF NOT EXISTS valid_achievement_type 
CHECK (achievement_type IN ('tournament_winner', 'top_scorer', 'defensive_leader', 'most_conceded', 'king_of_emotions'));

ALTER TABLE achievements 
ADD CONSTRAINT IF NOT EXISTS valid_tournament_rank 
CHECK (
  (achievement_type = 'tournament_winner' AND achievement_rank IN (1, 2, 3)) OR
  (achievement_type != 'tournament_winner' AND achievement_rank IS NULL)
);
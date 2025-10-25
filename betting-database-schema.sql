-- Schemat bazy danych dla systemu betowania
-- System kuponów z przewidywaniami na turnieje

-- Tabela kuponów betowania
CREATE TABLE betting_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    coupon_name VARCHAR(100) NOT NULL, -- Nazwa kuponu nadana przez gracza
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_submitted BOOLEAN DEFAULT FALSE, -- Czy kupon został już złożony (nie można edytować)
    total_points INTEGER DEFAULT 0, -- Łączne punkty za kupon (obliczane po turnieju)
    
    -- Ograniczenia
    UNIQUE(tournament_id, player_id) -- Jeden kupon na gracza na turniej
);

-- Tabela przewidywań w kuponie
CREATE TABLE betting_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES betting_coupons(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- Typ przewidywania
    prediction_value TEXT NOT NULL, -- Wartość przewidywania (JSON lub tekst)
    points_awarded INTEGER DEFAULT 0, -- Punkty przyznane za to przewidywanie
    is_correct BOOLEAN DEFAULT NULL, -- Czy przewidywanie było poprawne (NULL = nie sprawdzone)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela typów przewidywań (konfiguracja)
CREATE TABLE betting_prediction_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL, -- np. 'goals_over_under', 'final_ranking', 'top_scorer'
    display_name VARCHAR(100) NOT NULL, -- Nazwa wyświetlana
    description TEXT, -- Opis typu przewidywania
    points_for_correct INTEGER DEFAULT 1, -- Punkty za poprawne przewidywanie
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela wyników betowania (statystyki graczy)
CREATE TABLE betting_player_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    total_coupons INTEGER DEFAULT 0, -- Łączna liczba kuponów
    total_points INTEGER DEFAULT 0, -- Łączne punkty ze wszystkich kuponów
    correct_predictions INTEGER DEFAULT 0, -- Liczba poprawnych przewidywań
    total_predictions INTEGER DEFAULT 0, -- Łączna liczba przewidywań
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00, -- Procent trafności
    best_coupon_points INTEGER DEFAULT 0, -- Najlepszy wynik z kuponu
    gambling_king_awards INTEGER DEFAULT 0, -- Liczba nagród "Król Hazardu"
    dark_horse_awards INTEGER DEFAULT 0, -- Liczba nagród "Czarny Koń"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(player_id)
);

-- Tabela achievements dla betowania
CREATE TABLE betting_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'gambling_king', 'dark_horse', 'perfect_predictor'
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    points_earned INTEGER NOT NULL, -- Punkty za które otrzymano achievement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wstawienie podstawowych typów przewidywań
INSERT INTO betting_prediction_types (type_name, display_name, description, points_for_correct) VALUES
('goals_over_under', 'Over/Under Bramki', 'Przewidywanie czy średnia bramek na mecz będzie powyżej czy poniżej 4', 2),
('final_ranking', 'Kolejność Miejsc', 'Przewidywanie końcowej kolejności graczy w turnieju', 5),
('top_scorer', 'Król Strzelców', 'Przewidywanie kto strzeli najwięcej bramek', 3),
('worst_defense', 'Najgorsza Obrona', 'Przewidywanie kto straci najwięcej bramek', 3),
('tournament_winner', 'Zwycięzca Turnieju', 'Przewidywanie kto wygra turniej', 5),
('surprise_player', 'Niespodzianka Turnieju', 'Przewidywanie gracza który zaskoczy pozytywnie', 4);

-- Funkcja do obliczania statystyk gracza
CREATE OR REPLACE FUNCTION update_betting_player_stats(p_player_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_coupons INTEGER;
    v_total_points INTEGER;
    v_correct_predictions INTEGER;
    v_total_predictions INTEGER;
    v_accuracy DECIMAL(5,2);
    v_best_coupon INTEGER;
    v_gambling_king INTEGER;
    v_dark_horse INTEGER;
BEGIN
    -- Oblicz statystyki
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_points), 0),
        COALESCE(MAX(total_points), 0)
    INTO v_total_coupons, v_total_points, v_best_coupon
    FROM betting_coupons 
    WHERE player_id = p_player_id AND is_submitted = TRUE;
    
    SELECT 
        COUNT(*) FILTER (WHERE is_correct = TRUE),
        COUNT(*)
    INTO v_correct_predictions, v_total_predictions
    FROM betting_predictions bp
    JOIN betting_coupons bc ON bp.coupon_id = bc.id
    WHERE bc.player_id = p_player_id AND bc.is_submitted = TRUE;
    
    -- Oblicz procent trafności
    v_accuracy := CASE 
        WHEN v_total_predictions > 0 THEN 
            ROUND((v_correct_predictions::DECIMAL / v_total_predictions) * 100, 2)
        ELSE 0 
    END;
    
    -- Policz achievements
    SELECT 
        COUNT(*) FILTER (WHERE achievement_type = 'gambling_king'),
        COUNT(*) FILTER (WHERE achievement_type = 'dark_horse')
    INTO v_gambling_king, v_dark_horse
    FROM betting_achievements
    WHERE player_id = p_player_id;
    
    -- Wstaw lub zaktualizuj statystyki
    INSERT INTO betting_player_stats (
        player_id, total_coupons, total_points, correct_predictions, 
        total_predictions, accuracy_percentage, best_coupon_points,
        gambling_king_awards, dark_horse_awards, updated_at
    ) VALUES (
        p_player_id, v_total_coupons, v_total_points, v_correct_predictions,
        v_total_predictions, v_accuracy, v_best_coupon,
        v_gambling_king, v_dark_horse, NOW()
    )
    ON CONFLICT (player_id) DO UPDATE SET
        total_coupons = EXCLUDED.total_coupons,
        total_points = EXCLUDED.total_points,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions,
        accuracy_percentage = EXCLUDED.accuracy_percentage,
        best_coupon_points = EXCLUDED.best_coupon_points,
        gambling_king_awards = EXCLUDED.gambling_king_awards,
        dark_horse_awards = EXCLUDED.dark_horse_awards,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego aktualizowania statystyk
CREATE OR REPLACE FUNCTION trigger_update_betting_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_betting_player_stats(NEW.player_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_betting_player_stats(OLD.player_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggery
CREATE TRIGGER betting_coupons_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON betting_coupons
    FOR EACH ROW EXECUTE FUNCTION trigger_update_betting_stats();

CREATE TRIGGER betting_achievements_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON betting_achievements
    FOR EACH ROW EXECUTE FUNCTION trigger_update_betting_stats();

-- ============================================================================
-- INDEKSY
-- ============================================================================

-- Indeksy dla betting_coupons
CREATE INDEX idx_betting_coupons_tournament ON betting_coupons (tournament_id);
CREATE INDEX idx_betting_coupons_player ON betting_coupons (player_id);

-- Indeksy dla betting_predictions
CREATE INDEX idx_betting_predictions_coupon ON betting_predictions (coupon_id);
CREATE INDEX idx_betting_predictions_type ON betting_predictions (prediction_type);

-- Indeksy dla betting_player_stats
CREATE INDEX idx_betting_stats_points ON betting_player_stats (total_points DESC);
CREATE INDEX idx_betting_stats_accuracy ON betting_player_stats (accuracy_percentage DESC);

-- Indeksy dla betting_achievements
CREATE INDEX idx_betting_achievements_tournament ON betting_achievements (tournament_id);
CREATE INDEX idx_betting_achievements_player ON betting_achievements (player_id);
CREATE INDEX idx_betting_achievements_type ON betting_achievements (achievement_type);

-- Dodatkowe indeksy dla wydajności
CREATE INDEX idx_betting_coupons_submitted ON betting_coupons(is_submitted);
CREATE INDEX idx_betting_predictions_correct ON betting_predictions(is_correct);

-- Komentarze do tabel
COMMENT ON TABLE betting_coupons IS 'Kupony betowania graczy na turnieje';
COMMENT ON TABLE betting_predictions IS 'Poszczególne przewidywania w kuponach';
COMMENT ON TABLE betting_prediction_types IS 'Typy przewidywań dostępne w systemie';
COMMENT ON TABLE betting_player_stats IS 'Statystyki betowania dla każdego gracza';
COMMENT ON TABLE betting_achievements IS 'Achievements związane z betowaniem';

COMMENT ON COLUMN betting_coupons.is_submitted IS 'Czy kupon został złożony - po złożeniu nie można edytować';
COMMENT ON COLUMN betting_predictions.prediction_value IS 'Wartość przewidywania - może być JSON dla złożonych przewidywań';
COMMENT ON COLUMN betting_player_stats.accuracy_percentage IS 'Procent trafności przewidywań gracza';
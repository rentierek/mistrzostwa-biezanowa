'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Target, Users, Calendar, RefreshCw } from 'lucide-react';
import { Achievement, Tournament } from '@/types/database';
import { getPlayerAchievements, generateTournamentAchievements, getAllTournaments, getAllPlayers } from '@/lib/supabase';

interface AchievementStats {
  totalAchievements: number;
  tournamentWinners: number;
  topScorers: number;
  defensiveLeaders: number;
  mostConceded: number;
  kingOfEmotions: number;
}

export const AdminAchievementPanel: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalAchievements: 0,
    tournamentWinners: 0,
    topScorers: 0,
    defensiveLeaders: 0,
    mostConceded: 0,
    kingOfEmotions: 0
  });
  const [loading, setLoading] = useState(true);
  const [generatingAchievements, setGeneratingAchievements] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tournaments and players
      const [tournamentsData, playersData] = await Promise.all([
        getAllTournaments(),
        getAllPlayers()
      ]);
      
      setTournaments(tournamentsData);
      setPlayers(playersData);
      
      // Load all achievements for all players
      const allAchievements: Achievement[] = [];
      for (const player of playersData) {
        try {
          const playerAchievements = await getPlayerAchievements(player.id);
          allAchievements.push(...playerAchievements);
        } catch (error) {
          console.error(`Error loading achievements for player ${player.id}:`, error);
        }
      }
      
      setAchievements(allAchievements);
      
      // Calculate statistics
      const newStats: AchievementStats = {
        totalAchievements: allAchievements.length,
        tournamentWinners: allAchievements.filter(a => a.achievement_type === 'tournament_winner').length,
        topScorers: allAchievements.filter(a => a.achievement_type === 'top_scorer').length,
        defensiveLeaders: allAchievements.filter(a => a.achievement_type === 'defensive_leader').length,
        mostConceded: allAchievements.filter(a => a.achievement_type === 'most_conceded').length,
        kingOfEmotions: allAchievements.filter(a => a.achievement_type === 'king_of_emotions').length
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAchievements = async (tournamentId: string) => {
    if (!confirm('Czy na pewno chcesz wygenerować osiągnięcia dla tego turnieju? Istniejące osiągnięcia zostaną zastąpione.')) {
      return;
    }

    try {
      setGeneratingAchievements(tournamentId);
      await generateTournamentAchievements(tournamentId);
      await loadData(); // Reload data to show new achievements
      alert('Osiągnięcia zostały pomyślnie wygenerowane!');
    } catch (error) {
      console.error('Error generating achievements:', error);
      alert('Błąd podczas generowania osiągnięć: ' + (error as Error).message);
    } finally {
      setGeneratingAchievements(null);
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'tournament_winner':
        return '🏆';
      case 'top_scorer':
        return '⚽';
      case 'defensive_leader':
        return '🛡️';
      case 'most_conceded':
        return '🤡';
      case 'king_of_emotions':
        return '🎭';
      default:
        return '🏅';
    }
  };

  const getAchievementTypeLabel = (type: string) => {
    switch (type) {
      case 'tournament_winner':
        return 'Zwycięzcy Turniejów';
      case 'top_scorer':
        return 'Królowie Strzelców';
      case 'defensive_leader':
        return 'Liderzy Obrony';
      case 'most_conceded':
        return 'Najwięcej Straconych';
      case 'king_of_emotions':
        return 'Królowie Emocji';
      default:
        return 'Inne';
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.nickname : 'Nieznany gracz';
  };

  const getTournamentName = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : 'Nieznany turniej';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Ładowanie osiągnięć...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zarządzanie Osiągnięciami</h2>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Odśwież</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wszystkie</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAchievements}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Zwycięzcy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tournamentWinners}</p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Strzelcy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.topScorers}</p>
            </div>
            <div className="text-2xl">⚽</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Obrońcy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.defensiveLeaders}</p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stracone</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mostConceded}</p>
            </div>
            <div className="text-2xl">🤡</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emocje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.kingOfEmotions}</p>
            </div>
            <div className="text-2xl">🎭</div>
          </div>
        </div>
      </div>

      {/* Tournament Achievement Generation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generowanie Osiągnięć dla Turniejów</h3>
        <div className="space-y-3">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{tournament.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {tournament.is_active ? 'Aktywny' : 'Zakończony'}
                  {tournament.end_date && (
                    <span className="ml-2">
                      • Zakończony: {new Date(tournament.end_date).toLocaleDateString('pl-PL')}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleGenerateAchievements(tournament.id)}
                disabled={generatingAchievements === tournament.id}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingAchievements === tournament.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generowanie...</span>
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    <span>Generuj Osiągnięcia</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ostatnie Osiągnięcia</h3>
        {achievements.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {achievements
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 20)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl">{getAchievementIcon(achievement.achievement_type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Gracz: {getPlayerName(achievement.player_id)}</span>
                      <span>Turniej: {getTournamentName(achievement.tournament_id || '')}</span>
                      <span>Data: {new Date(achievement.created_at).toLocaleDateString('pl-PL')}</span>
                      {achievement.value && <span>Wartość: {achievement.value}</span>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Brak osiągnięć do wyświetlenia</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Wygeneruj osiągnięcia dla zakończonych turniejów powyżej
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
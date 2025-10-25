'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getMatchesForTournament, getLeagueTable } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LeagueTable } from '@/components/tournament/LeagueTable';
import { MatchesList } from '@/components/tournament/MatchesList';
import TournamentAwardsAnimation from '@/components/tournament/TournamentAwardsAnimation';
import { Trophy, Calendar, Users, Target, Award, TrendingUp, Crown, Shield, Zap, RefreshCw } from 'lucide-react';
import { Tournament, MatchWithDetails, LeagueTableEntry } from '@/types/database';

interface TournamentStatsProps {
  tournament: Tournament;
  initialMatches: MatchWithDetails[];
  initialLeagueTable: LeagueTableEntry[];
}

export function TournamentStats({ tournament, initialMatches, initialLeagueTable }: TournamentStatsProps) {
  const [matches, setMatches] = useState<MatchWithDetails[]>(initialMatches);
  const [leagueTable, setLeagueTable] = useState<LeagueTableEntry[]>(initialLeagueTable);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [showAwardsAnimation, setShowAwardsAnimation] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [newMatches, newLeagueTable] = await Promise.all([
        getMatchesForTournament(tournament.id),
        getLeagueTable(tournament.id)
      ]);
      
      setMatches(newMatches);
      setLeagueTable(newLeagueTable);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing tournament data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [tournament.id]);

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-refresh every 30 seconds for active tournaments
  useEffect(() => {
    if (!tournament.is_active) return;

    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [tournament.is_active, refreshData]);

  // Calculate statistics
  const completedMatches = matches.filter(match => match.is_completed);
  const upcomingMatches = matches.filter(match => !match.is_completed);
  const totalGoals = completedMatches.reduce((sum, match) => sum + match.player1_score + match.player2_score, 0);
  const averageGoalsPerMatch = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : '0';

  // Calculate tournament statistics
  const playerGoalStats = leagueTable.reduce((acc, player) => {
    acc.totalGoals += player.goals_for;
    if (player.goals_for > acc.topScorer.goals) {
      acc.topScorer = { nickname: player.nickname, goals: player.goals_for };
    }
    return acc;
  }, { totalGoals: 0, topScorer: { nickname: '', goals: 0 } });

  const mostExcitingMatch = completedMatches.reduce((max, match) => {
    const totalGoals = match.player1_score + match.player2_score;
    const maxGoals = max ? max.player1_score + max.player2_score : 0;
    return totalGoals > maxGoals ? match : max;
  }, null as MatchWithDetails | null);

  const startDate = new Date(tournament.start_date);
  const endDate = tournament.end_date ? new Date(tournament.end_date) : null;

  return (
    <div className="space-y-8">
      {/* Tournament Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <div className="flex items-center gap-3">
            {/* Awards Animation Button */}
            <button
              onClick={() => setShowAwardsAnimation(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Award className="w-5 h-5" />
              Ceremonia Nagród
            </button>
            
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Odśwież
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              {startDate.toLocaleDateString('pl-PL')}
              {endDate && ` - ${endDate.toLocaleDateString('pl-PL')}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isClient && (
              <div className="text-sm opacity-75">
                Ostatnia aktualizacja: {lastRefresh.toLocaleTimeString('pl-PL')}
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
              <Trophy size={14} />
              {tournament.is_active ? 'Aktywny' : 'Zakończony'}
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{leagueTable.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uczestników</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{matches.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wszystkich Meczów</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bramek Ogółem</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageGoalsPerMatch}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Średnio/Mecz</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      {completedMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Scorer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Król Strzelców
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {playerGoalStats.topScorer.nickname}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {playerGoalStats.topScorer.goals}
                </div>
                <div className="text-sm text-gray-600">bramek</div>
              </div>
            </CardContent>
          </Card>

          {/* League Leader */}
          {leagueTable.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Lider Tabeli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {leagueTable[0]?.nickname}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {leagueTable[0]?.points}
                  </div>
                  <div className="text-sm text-gray-600">punktów</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Most Exciting Match */}
          {mostExcitingMatch && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Najciekawszy Mecz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {mostExcitingMatch.player1?.nickname} vs {mostExcitingMatch.player2?.nickname}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {mostExcitingMatch.player1_score}:{mostExcitingMatch.player2_score}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tournament Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Postęp Turnieju
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedMatches.length}</div>
              <div className="text-sm text-gray-600">Mecze Rozegrane</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{upcomingMatches.length}</div>
              <div className="text-sm text-gray-600">Mecze Pozostałe</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {matches.length > 0 ? Math.round((completedMatches.length / matches.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Ukończone</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${matches.length > 0 ? (completedMatches.length / matches.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* League Table */}
        <div>
          <LeagueTable 
            data={leagueTable}
            title="Tabela Ligowa"
            showExport={true}
          />
        </div>

        {/* Matches */}
        <div className="space-y-6">
          {upcomingMatches.length > 0 && (
            <MatchesList 
              matches={upcomingMatches}
              title="Nadchodzące Mecze"
              maxItems={5}
              showExport={false}
            />
          )}
          
          {completedMatches.length > 0 && (
            <MatchesList 
              matches={completedMatches.slice(0, 5)}
              title="Ostatnie Mecze"
              maxItems={5}
              showExport={false}
            />
          )}
        </div>
      </div>

      {/* Tournament Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Podsumowanie Turnieju
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Uczestników:</span>
                <span className="font-medium">{leagueTable.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mecze rozegrane:</span>
                <span className="font-medium">{completedMatches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bramki ogółem:</span>
                <span className="font-medium">{totalGoals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Średnio bramek/mecz:</span>
                <span className="font-medium">{averageGoalsPerMatch}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{tournament.is_active ? 'Aktywny' : 'Zakończony'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data rozpoczęcia:</span>
                <span className="font-medium">{startDate.toLocaleDateString('pl-PL')}</span>
              </div>
              {endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Data zakończenia:</span>
                  <span className="font-medium">{endDate.toLocaleDateString('pl-PL')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Postęp:</span>
                <span className="font-medium">
                  {matches.length > 0 ? Math.round((completedMatches.length / matches.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Awards Animation */}
      {showAwardsAnimation && (
        <TournamentAwardsAnimation
          leagueTable={leagueTable}
          onClose={() => setShowAwardsAnimation(false)}
        />
      )}
    </div>
  );
}
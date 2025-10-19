import React from 'react';
import { getAllTournaments, getAllPlayers, getGlobalStats } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExportButton } from '@/components/ui/ExportButton';
import { GlobalStats } from '@/types/database';
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award,
  BarChart3,
  Crown,
  Zap,
  Shield
} from 'lucide-react';

export default async function StatsPage() {
  const [tournaments, players, globalStats] = await Promise.all([
    getAllTournaments(),
    getAllPlayers(),
    getGlobalStats()
  ]);

  const activeTournaments = tournaments.filter(t => t.is_active);
  const completedTournaments = tournaments.filter(t => !t.is_active);

  // Prepare data for export
  const exportData = [
    {
      'Kategoria': 'Turnieje',
      'Wszystkich': tournaments.length,
      'Aktywnych': activeTournaments.length,
      'Zakończonych': completedTournaments.length
    },
    {
      'Kategoria': 'Gracze',
      'Wszystkich': players.length,
      'Aktywnych': players.length,
      'Zakończonych': '-'
    },
    {
      'Kategoria': 'Mecze',
      'Wszystkich': globalStats.totalMatches,
      'Aktywnych': globalStats.totalMatches - globalStats.totalCompletedMatches,
      'Zakończonych': globalStats.totalCompletedMatches
    },
    {
      'Kategoria': 'Bramki',
      'Wszystkich': globalStats.totalGoals,
      'Aktywnych': '-',
      'Zakończonych': globalStats.totalGoals
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Statystyki
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Kompleksowe statystyki i rekordy Mistrzostw Bieżanowa
        </p>
        <div className="flex justify-center">
          <ExportButton 
            data={exportData}
            fileName="statystyki-mistrzostwa-biezanowa"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{tournaments.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wszystkich Turniejów</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{players.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wszystkich Graczy</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{globalStats.totalGoals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bramek Ogółem</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{globalStats.totalCompletedMatches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Meczów Ogółem</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Statystyki Turniejów
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Status Turniejów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Aktywne</span>
                  <span className="text-2xl font-bold text-green-600">{activeTournaments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Zakończone</span>
                  <span className="text-2xl font-bold text-blue-600">{completedTournaments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wszystkich</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{tournaments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Średnia Bramek na Mecz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {globalStats.averageGoalsPerMatch.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bramek na mecz</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Records and Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-600" />
          Rekordy i Osiągnięcia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Król Strzelców
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {globalStats.topScorer ? (
                  <>
                    <div className="text-3xl font-bold text-red-600 mb-2">{globalStats.topScorer.goals}</div>
                    <div className="text-sm text-gray-600">{globalStats.topScorer.nickname}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-red-600 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Najwięcej Zwycięstw
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {globalStats.mostWins ? (
                  <>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{globalStats.mostWins.wins}</div>
                    <div className="text-sm text-gray-600">{globalStats.mostWins.nickname}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Najlepsza Różnica Bramek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {globalStats.bestGoalDifference ? (
                  <>
                    <div className="text-3xl font-bold text-green-600 mb-2">+{globalStats.bestGoalDifference.difference}</div>
                    <div className="text-sm text-gray-600">{globalStats.bestGoalDifference.nickname}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-green-600 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Najwięcej Turniejów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {globalStats.mostTournaments ? (
                  <>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{globalStats.mostTournaments.tournaments}</div>
                    <div className="text-sm text-gray-600">{globalStats.mostTournaments.nickname}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-purple-600 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Średnia Bramek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {globalStats.averageGoalsPerMatch.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Na mecz</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{players.length}</div>
                <div className="text-sm text-gray-600">Aktywnych graczy</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Data */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Dane Historyczne
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Turnieje w Czasie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Wykres Niedostępny
                </h3>
                <p className="text-gray-600">
                  Dane historyczne będą dostępne po przeprowadzeniu większej liczby turniejów.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktywność Graczy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Analiza Niedostępna
                </h3>
                <p className="text-gray-600">
                  Statystyki aktywności będą dostępne po zebraniu większej ilości danych.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { getAllPlayersWithStats } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExportButton } from '@/components/ui/ExportButton';
import { User, Trophy, Target, TrendingUp, Users, Award } from 'lucide-react';
import { Player, PlayerStats } from '@/types/database';

export default async function PlayersPage() {
  const players = await getAllPlayersWithStats();

  // Calculate statistics
  const totalGoals = players.reduce((sum, player) => sum + player.stats.total_goals, 0);
  const activePlayers = players.filter(player => player.stats.total_matches > 0).length;
  
  // Find top players
  const topWinsPlayer = players.reduce((max, player) => 
    player.stats.total_wins > (max?.stats.total_wins || 0) ? player : max, 
    players[0]
  );
  
  const topGoalsPlayer = players.reduce((max, player) => 
    player.stats.total_goals > (max?.stats.total_goals || 0) ? player : max, 
    players[0]
  );
  
  const topTournamentsPlayer = players.reduce((max, player) => 
    player.stats.tournaments_won > (max?.stats.tournaments_won || 0) ? player : max, 
    players[0]
  );

  // Prepare data for export
  const exportData = players.map(player => ({
    'Gracz': player.nickname,
    'Email': player.email || 'Brak',
    'Data Dołączenia': new Date(player.created_at).toLocaleDateString('pl-PL'),
    'Mecze': player.stats.total_matches,
    'Zwycięstwa': player.stats.total_wins,
    'Bramki': player.stats.total_goals,
    'Punkty': player.stats.total_points
  }));

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Gracze
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Wszyscy gracze uczestniczący w Mistrzostwach Bieżanowa
        </p>
        <div className="flex justify-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Users size={16} />
            {players.length} Graczy
          </div>
          <ExportButton 
            data={exportData}
            fileName="gracze-mistrzostwa-biezanowa"
          />
        </div>
      </div>

      {/* Players Grid */}
      {players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Brak Graczy
            </h3>
            <p className="text-gray-600">
              Gracze będą wyświetlani tutaj po dołączeniu do turniejów.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{players.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Wszystkich Graczy</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activePlayers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aktywnych</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Osiągnięć</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bramek Ogółem</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Players Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Najlepsi Gracze
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Najwięcej Zwycięstw
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {topWinsPlayer && topWinsPlayer.stats.total_wins > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {topWinsPlayer.stats.total_wins}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {topWinsPlayer.nickname}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">-</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Najwięcej Bramek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {topGoalsPlayer && topGoalsPlayer.stats.total_goals > 0 ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {topGoalsPlayer.stats.total_goals}
                    </div>
                    <div className="text-sm text-gray-600">
                      {topGoalsPlayer.nickname}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Najlepszy Bilans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {topWinsPlayer && topWinsPlayer.stats.goal_difference !== 0 ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {topWinsPlayer.stats.goal_difference > 0 ? '+' : ''}{topWinsPlayer.stats.goal_difference}
                    </div>
                    <div className="text-sm text-gray-600">
                      {topWinsPlayer.nickname}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-2">-</div>
                    <div className="text-sm text-gray-600">Brak danych</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player & { stats: PlayerStats };
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const joinDate = new Date(player.created_at);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {(player.photo_url || player.avatar_url) ? (
              <img 
                src={player.photo_url || player.avatar_url} 
                alt={player.nickname}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{player.nickname}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dołączył {joinDate.toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{player.stats.total_matches}</div>
              <div className="text-gray-600 dark:text-gray-400">Mecze</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{player.stats.total_wins}</div>
              <div className="text-gray-600 dark:text-gray-400">Zwycięstwa</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{player.stats.total_goals}</div>
              <div className="text-gray-600 dark:text-gray-400">Bramki</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{player.stats.total_points}</div>
              <div className="text-gray-600 dark:text-gray-400">Punkty</div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <a 
              href={`/player/${player.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm w-full justify-center"
            >
              <User size={16} />
              Zobacz Profil
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
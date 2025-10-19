import React from 'react';
import { getAllTournaments, getTournamentStats } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Trophy, Calendar, Users, Target, Archive } from 'lucide-react';
import { Tournament, TournamentStats } from '@/types/database';

interface TournamentWithStats extends Tournament {
  stats: TournamentStats;
}

export default async function ArchivesPage() {
  const tournaments = await getAllTournaments();
  
  // Fetch statistics for all tournaments
  const tournamentsWithStats: TournamentWithStats[] = await Promise.all(
    tournaments.map(async (tournament) => {
      const stats = await getTournamentStats(tournament.id);
      return { ...tournament, stats };
    })
  );
  
  // Separate active and completed tournaments
  const activeTournaments = tournamentsWithStats.filter(t => t.is_active);
  const completedTournaments = tournamentsWithStats.filter(t => !t.is_active);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Archiwum Turniejów
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Historia wszystkich turniejów Mistrzostw Bieżanowa
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <Archive size={16} />
          {tournaments.length} Turniejów w Archiwum
        </div>
      </div>

      {/* Active Tournaments */}
      {activeTournaments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Ostatnie Turnieje
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} isActive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tournaments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Archive className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          Archiwum Turniejów
        </h2>
        {completedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} isActive={false} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Brak Zakończonych Turniejów
              </h3>
              <p className="text-gray-600">
                Zakończone turnieje będą wyświetlane tutaj po ich zakończeniu.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeTournaments.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aktywnych</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedTournaments.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Zakończonych</div>
            </div>
          </CardContent>
        </Card>

        <Card padding="sm">
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Date().getFullYear()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bieżący Rok</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TournamentCardProps {
  tournament: TournamentWithStats;
  isActive: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, isActive }) => {
  const startDate = new Date(tournament.start_date);
  const endDate = tournament.end_date ? new Date(tournament.end_date) : null;
  
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {/* Tournament Thumbnail */}
      {tournament.thumbnail_url && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={tournament.thumbnail_url} 
            alt={`${tournament.name} thumbnail`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{tournament.name}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive ? 'Aktywny' : 'Zakończony'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar size={16} />
            <span>
              {startDate.toLocaleDateString('pl-PL')}
              {endDate && ` - ${endDate.toLocaleDateString('pl-PL')}`}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users size={16} className="text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">{tournament.stats.participantCount} graczy</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={16} className="text-red-600" />
              <span className="text-gray-600 dark:text-gray-400">{tournament.stats.matchCount} meczów</span>
            </div>
          </div>
          
          {tournament.stats.totalGoals > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Trophy size={16} className="text-yellow-600" />
              <span>{tournament.stats.totalGoals} bramek ogółem</span>
            </div>
          )}

          <div className="pt-3 border-t">
            <a 
              href={`/tournament/${tournament.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all text-sm"
            >
              <Trophy size={16} />
              Zobacz Szczegóły
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};